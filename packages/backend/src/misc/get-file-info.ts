import * as fs from "node:fs";
import * as crypto from "node:crypto";
import { join } from "node:path";
import * as stream from "node:stream";
import * as util from "node:util";
import { FSWatcher } from "chokidar";
import { fileTypeFromFile } from "file-type";
import FFmpeg from "fluent-ffmpeg";
import isSvg from "is-svg";
import probeImageSize from "probe-image-size";
import { type predictionType } from "nsfwjs";
import sharp from "sharp";
import { encode } from "blurhash";
import { detectSensitive } from "@/services/detect-sensitive.js";
import { createTempDir } from "./create-temp.js";

const pipeline = util.promisify(stream.pipeline);

export type FileInfo = {
	size: number;
	md5: string;
	type: {
		mime: string;
		ext: string | null;
	};
	width?: number;
	height?: number;
	orientation?: number;
	blurhash?: string;
	sensitive: boolean;
	porn: boolean;
	warnings: string[];
};

const TYPE_OCTET_STREAM = {
	mime: "application/octet-stream",
	ext: null,
};

const TYPE_SVG = {
	mime: "image/svg+xml",
	ext: "svg",
};

/**
 * Get file information
 */
export async function getFileInfo(
	path: string,
	opts: {
		skipSensitiveDetection: boolean;
		sensitiveThreshold?: number;
		sensitiveThresholdForPorn?: number;
		enableSensitiveMediaDetectionForVideos?: boolean;
	},
): Promise<FileInfo> {
	const warnings = [] as string[];

	const size = await getFileSize(path);
	const md5 = await calcHash(path);

	let type = await detectType(path);

	// image dimensions
	let width: number | undefined;
	let height: number | undefined;
	let orientation: number | undefined;

	if (
		[
			"image/jpeg",
			"image/gif",
			"image/png",
			"image/apng",
			"image/webp",
			"image/bmp",
			"image/tiff",
			"image/svg+xml",
			"image/vnd.adobe.photoshop",
			"image/avif",
		].includes(type.mime)
	) {
		const imageSize = await detectImageSize(path).catch((e) => {
			warnings.push(`detectImageSize failed: ${e}`);
			return undefined;
		});

		// うまく判定できない画像は octet-stream にする
		if (!imageSize) {
			warnings.push("cannot detect image dimensions");
			type = TYPE_OCTET_STREAM;
		} else if (imageSize.wUnits === "px") {
			width = imageSize.width;
			height = imageSize.height;
			orientation = imageSize.orientation;

			// 制限を超えている画像は octet-stream にする
			if (imageSize.width > 16383 || imageSize.height > 16383) {
				warnings.push("image dimensions exceeds limits");
				type = TYPE_OCTET_STREAM;
			}
		} else {
			warnings.push(`unsupported unit type: ${imageSize.wUnits}`);
		}
	}

	let blurhash: string | undefined;

	if (
		[
			"image/jpeg",
			"image/gif",
			"image/png",
			"image/apng",
			"image/webp",
			"image/svg+xml",
			"image/avif",
		].includes(type.mime)
	) {
		blurhash = await getBlurhash(path).catch((e) => {
			warnings.push(`getBlurhash failed: ${e}`);
			return undefined;
		});
	}

	let sensitive = false;
	let porn = false;

	if (!opts.skipSensitiveDetection) {
		await detectSensitivity(
			path,
			type.mime,
			opts.sensitiveThreshold ?? 0.5,
			opts.sensitiveThresholdForPorn ?? 0.75,
			opts.enableSensitiveMediaDetectionForVideos ?? false,
		).then(
			(value) => {
				[sensitive, porn] = value;
			},
			(error) => {
				warnings.push(`detectSensitivity failed: ${error}`);
			},
		);
	}

	return {
		size,
		md5,
		type,
		width,
		height,
		orientation,
		blurhash,
		sensitive,
		porn,
		warnings,
	};
}

async function detectSensitivity(
	source: string,
	mime: string,
	sensitiveThreshold: number,
	sensitiveThresholdForPorn: number,
	analyzeVideo: boolean,
): Promise<[sensitive: boolean, porn: boolean]> {
	let sensitive = false;
	let porn = false;

	function judgePrediction(
		result: readonly predictionType[],
	): [sensitive: boolean, porn: boolean] {
		let sensitive = false;
		let porn = false;

		if (
			(result.find((x) => x.className === "Sexy")?.probability ?? 0) >
			sensitiveThreshold
		)
			sensitive = true;
		if (
			(result.find((x) => x.className === "Hentai")?.probability ?? 0) >
			sensitiveThreshold
		)
			sensitive = true;
		if (
			(result.find((x) => x.className === "Porn")?.probability ?? 0) >
			sensitiveThreshold
		)
			sensitive = true;

		if (
			(result.find((x) => x.className === "Porn")?.probability ?? 0) >
			sensitiveThresholdForPorn
		)
			porn = true;

		return [sensitive, porn];
	}

	if (["image/jpeg", "image/png", "image/webp"].includes(mime)) {
		const result = await detectSensitive(source);
		if (result) {
			[sensitive, porn] = judgePrediction(result);
		}
	} else if (
		analyzeVideo &&
		(mime === "image/apng" || mime.startsWith("video/"))
	) {
		const [outDir, disposeOutDir] = await createTempDir();
		try {
			const command = FFmpeg()
				.input(source)
				.inputOptions([
					"-skip_frame",
					"nokey", // 可能ならキーフレームのみを取得してほしいとする（そうなるとは限らない）
					"-lowres",
					"3", // 元の画質でデコードする必要はないので 1/8 画質でデコードしてもよいとする（そうなるとは限らない）
				])
				.noAudio()
				.videoFilters([
					{
						filter: "select", // フレームのフィルタリング
						options: {
							e: "eq(pict_type,PICT_TYPE_I)", // I-Frame のみをフィルタする（VP9 とかはデコードしてみないとわからないっぽい）
						},
					},
					{
						filter: "blackframe", // 暗いフレームの検出
						options: {
							amount: "0", // 暗さに関わらず全てのフレームで測定値を取る
						},
					},
					{
						filter: "metadata",
						options: {
							mode: "select", // フレーム選択モード
							key: "lavfi.blackframe.pblack", // フレームにおける暗部の百分率（前のフィルタからのメタデータを参照する）
							value: "50",
							function: "less", // 50% 未満のフレームを選択する（50% 以上暗部があるフレームだと誤検知を招くかもしれないので）
						},
					},
					{
						filter: "scale",
						options: {
							w: 299,
							h: 299,
						},
					},
				])
				.format("image2")
				.output(join(outDir, "%d.png"))
				.outputOptions(["-vsync", "0"]); // 可変フレームレートにすることで穴埋めをさせない
			const results: ReturnType<typeof judgePrediction>[] = [];
			let frameIndex = 0;
			let targetIndex = 0;
			let nextIndex = 1;
			for await (const path of asyncIterateFrames(outDir, command)) {
				try {
					const index = frameIndex++;
					if (index !== targetIndex) {
						continue;
					}
					targetIndex = nextIndex;
					nextIndex += index; // fibonacci sequence によってフレーム数制限を掛ける
					const result = await detectSensitive(path);
					if (result) {
						results.push(judgePrediction(result));
					}
				} finally {
					fs.promises.unlink(path);
				}
			}
			sensitive =
				results.filter((x) => x[0]).length >=
				Math.ceil(results.length * sensitiveThreshold);
			porn =
				results.filter((x) => x[1]).length >=
				Math.ceil(results.length * sensitiveThresholdForPorn);
		} finally {
			disposeOutDir();
		}
	}

	return [sensitive, porn];
}

async function* asyncIterateFrames(
	cwd: string,
	command: FFmpeg.FfmpegCommand,
): AsyncGenerator<string, void> {
	const watcher = new FSWatcher({
		cwd,
		disableGlobbing: true,
	});
	let finished = false;
	command.once("end", () => {
		finished = true;
		watcher.close();
	});
	command.run();
	for (let i = 1; true; i++) {
		const current = `${i}.png`;
		const next = `${i + 1}.png`;
		const framePath = join(cwd, current);
		if (await exists(join(cwd, next))) {
			yield framePath;
		} else if (!finished) {
			watcher.add(next);
			await new Promise<void>((resolve, reject) => {
				watcher.on("add", function onAdd(path) {
					if (path === next) {
						// 次フレームの書き出しが始まっているなら、現在フレームの書き出しは終わっている
						watcher.unwatch(current);
						watcher.off("add", onAdd);
						resolve();
					}
				});
				command.once("end", resolve); // 全てのフレームを処理し終わったなら、最終フレームである現在フレームの書き出しは終わっている
				command.once("error", reject);
			});
			yield framePath;
		} else if (await exists(framePath)) {
			yield framePath;
		} else {
			return;
		}
	}
}

function exists(path: string): Promise<boolean> {
	return fs.promises.access(path).then(
		() => true,
		() => false,
	);
}

/**
 * Detect MIME Type and extension
 */
export async function detectType(path: string): Promise<{
	mime: string;
	ext: string | null;
}> {
	// Check 0 byte
	const fileSize = await getFileSize(path);
	if (fileSize === 0) {
		return TYPE_OCTET_STREAM;
	}

	const type = await fileTypeFromFile(path);

	if (type) {
		// XMLはSVGかもしれない
		if (type.mime === "application/xml" && (await checkSvg(path))) {
			return TYPE_SVG;
		}

		return {
			mime: type.mime,
			ext: type.ext,
		};
	}

	// 種類が不明でもSVGかもしれない
	if (await checkSvg(path)) {
		return TYPE_SVG;
	}

	// それでも種類が不明なら application/octet-stream にする
	return TYPE_OCTET_STREAM;
}

/**
 * Check the file is SVG or not
 */
export async function checkSvg(path: string) {
	try {
		const size = await getFileSize(path);
		if (size > 1 * 1024 * 1024) return false;
		return isSvg(fs.readFileSync(path));
	} catch {
		return false;
	}
}

/**
 * Get file size
 */
export async function getFileSize(path: string): Promise<number> {
	const getStat = util.promisify(fs.stat);
	return (await getStat(path)).size;
}

/**
 * Calculate MD5 hash
 */
async function calcHash(path: string): Promise<string> {
	const hash = crypto.createHash("md5").setEncoding("hex");
	await pipeline(fs.createReadStream(path), hash);
	return hash.read();
}

/**
 * Detect dimensions of image
 */
async function detectImageSize(path: string): Promise<{
	width: number;
	height: number;
	wUnits: string;
	hUnits: string;
	orientation?: number;
}> {
	const readable = fs.createReadStream(path);
	const imageSize = await probeImageSize(readable);
	readable.destroy();
	return imageSize;
}

/**
 * Calculate average color of image
 */
function getBlurhash(path: string): Promise<string> {
	return new Promise((resolve, reject) => {
		sharp(path)
			.raw()
			.ensureAlpha()
			.resize(64, 64, { fit: "inside" })
			.toBuffer((err, buffer, { width, height }) => {
				if (err) return reject(err);

				let hash;

				try {
					hash = encode(new Uint8ClampedArray(buffer), width, height, 7, 7);
				} catch (e) {
					return reject(e);
				}

				resolve(hash);
			});
	});
}
