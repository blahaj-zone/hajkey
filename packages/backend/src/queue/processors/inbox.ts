import { URL } from "node:url";
import type Bull from "bull";
import httpSignature from "@peertube/http-signature";
import perform from "@/remote/activitypub/perform.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import { Instances } from "@/models/index.js";
import {
	apRequestChart,
	federationChart,
	instanceChart,
} from "@/services/chart/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { toPuny, extractDbHost } from "@/misc/convert-host.js";
import { getApId } from "@/remote/activitypub/type.js";
import { fetchInstanceMetadata } from "@/services/fetch-instance-metadata.js";
import type { InboxJobData } from "../types.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import { resolvePerson } from "@/remote/activitypub/models/person.js";
import { LdSignature } from "@/remote/activitypub/misc/ld-signature.js";
import { StatusError } from "@/misc/fetch.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import type { UserPublickey } from "@/models/entities/user-publickey.js";
import { shouldBlockInstance } from "@/misc/should-block-instance.js";
import { json } from "stream/consumers";
import { JobId } from "bull";
import { queueLogger } from "../logger.js";

const logger = queueLogger.createSubLogger("inbox");
const processLog = logger.createSubLogger("process", "red");
const statsLog = logger.createSubLogger("queue-stats", "green");

export class PerformanceTimer {
	private start: number;
	private lap: number;
	private laps: {
		duration: number;
		total: number;
		message: string;
	}[] = [];

	constructor() {
		this.start = Date.now();
		this.lap = this.start;
	}

	public log(message: string | undefined): number {
		const now = Date.now();
		const duration = now - this.lap;
		this.lap = now;
		this.laps.push({
			duration: duration,
			total: now - this.start,
			message: message || "",
		});
		return duration;
	}

	public get total(): number {
		return Date.now() - this.start;
	}

	public render(): string[] {
		return this.laps.map((lap) => {
			return `@${lap.total}ms (+${lap.duration}ms): ${lap.message}`;
		});
	}
}

let times: number[] = [];
let successes: number[] = [];
let failures: number[] = [];

let totalCount = 0;
let totalTime = 0;
let prevCount = 0;
let prevTime = 0;
const startTime = Date.now();

setInterval(() => {
	totalCount += times.length;
	totalTime += times.reduce((a, b) => a + b, 0) / 1000;
	if (prevCount > 0) {
		const newCount = totalCount - prevCount;
		const newTime = totalTime - prevTime;
		const newSuccesses = successes.length;
		const newFailures = failures.length;
		const successRate = ((newSuccesses / newCount) * 100).toFixed(2);
		const successAvgTime = (
			successes.reduce((a, b) => a + b, 0) /
			1000 /
			newSuccesses
		).toFixed(2);
		const failureAvgTime = (
			failures.reduce((a, b) => a + b, 0) /
			1000 /
			newFailures
		).toFixed(2);
		const avgTotalTime = (totalTime / totalCount).toFixed(2);
		const avgTime = (newTime / newCount).toFixed(2);
		const minTime = (Math.min(...times) / 1000).toFixed(2);
		const maxTime = (Math.max(...times) / 1000).toFixed(2);
		const runTime = (Date.now() - startTime) / 1000;
		const avgPerMin = ((totalCount / runTime) * 60).toFixed(2);
		const avgPerHour = (newCount * 60).toFixed(2);
		const avgPerHourInst = ((totalCount / runTime) * 3600).toFixed(2);

		statsLog.info(
			[
				`inbox: ${newCount}(${totalCount}) in ${newTime.toFixed(
					2,
				)}s(${totalTime.toFixed(2)})s`,
				`average: ${avgTime}s(${avgTotalTime}s) / min: ${minTime}s / max: ${maxTime}s`,
				`${avgPerMin}/min ${avgPerHour}/hr (${avgPerHourInst}/hr inst)`,
				`success: ${newSuccesses}:${newFailures} (${successRate}%) ${successAvgTime}s/${failureAvgTime}s`,
			].join("\n"),
		);
	}
	times = [];
	successes = [];
	failures = [];
	prevCount = totalCount;
	prevTime = totalTime;
}, 1000 * 60);

const logResult = (
	message: string,
	id: JobId,
	data?: Record<string, any>,
	timer?: PerformanceTimer,
) => {
	processLog.info(
		`[${id}] ${message}${data ? `: ${JSON.stringify(data)}` : ""}`,
	);
	if (timer) {
		timer.log(message);
		const taken = timer.total;
		times.push(taken);
		if (message === "success") {
			successes.push(taken);
		} else {
			failures.push(taken);
		}
		if (timer.total > 3000) {
			processLog.warn(
				[`[${id}] slow request: ${taken}ms`, ...timer.render()].join("\n"),
			);
		}
	}
};

// Processing when an activity arrives in the user's inbox
export default async (job: Bull.Job<InboxJobData>): Promise<string> => {
	const timer = new PerformanceTimer();
	try {
		logResult("processing inbox", job.id, {
			attempts: job.attemptsMade,
		});

		const signature = job.data.signature; // HTTP-signature
		const activity = job.data.activity;

		if (!signature && !activity) {
			const err = `Empty job data`;
			logResult("job data empty", job.id, undefined, timer);
			return err;
		}

		//#region Log
		const info = Object.assign({}, activity) as any;
		info["@context"] = undefined;
		logger.info(JSON.stringify(info, null, 2));

		if (!signature?.keyId) {
			const err = `Invalid signature: ${signature}`;
			logResult("invalid signature", job.id, undefined, timer);
			//job.moveToFailed({ message: err }, true);
			return err;
		}
		//#endregion
		const host = toPuny(new URL(signature.keyId).hostname);

		// interrupt if blocked
		timer.log("before shouldBlockInstance fetchMeta");
		const meta = await fetchMeta();
		if (await shouldBlockInstance(host, meta)) {
			logResult(
				"blacklisted instance",
				job.id,
				{
					host,
				},
				timer,
			);
			return `Blocked request: ${host}`;
		}

		// only whitelisted instances in private mode
		if (meta.privateMode && !meta.allowedHosts.includes(host)) {
			logResult(
				"non-whitelisted instance",
				job.id,
				{
					host,
				},
				timer,
			);
			return `Blocked request: ${host}`;
		}

		const keyIdLower = signature.keyId.toLowerCase();
		if (keyIdLower.startsWith("acct:")) {
			logResult(
				"old keyId",
				job.id,
				{
					keyId: signature.keyId,
				},
				timer,
			);
			return `Old keyId is no longer supported. ${keyIdLower}`;
		}

		const dbResolver = new DbResolver();

		// HTTP-Signature keyId from DB
		timer.log("before getAuthUserFromKeyId signer");
		let authUser: {
			user: CacheableRemoteUser;
			key: UserPublickey | null;
		} | null = await dbResolver.getAuthUserFromKeyId(signature.keyId);

		// keyIdでわからなければ、activity.actorを元にDBから取得 || activity.actorを元にリモートから取得
		if (authUser == null) {
			try {
				timer.log("before getAuthUserFromApId");
				authUser = await dbResolver.getAuthUserFromApId(
					getApId(activity.actor),
				);
			} catch (e) {
				// Skip if target is 4xx
				if (e instanceof StatusError) {
					if (e.isClientError) {
						logResult(
							"skip clientError",
							job.id,
							{
								error: e,
								actor: activity.actor,
							},
							timer,
						);
						return `skip: Ignored deleted actors on both ends ${activity.actor} - ${e.statusCode}`;
					}
					throw new Error(
						`Error in actor ${activity.actor} - ${e.statusCode || e}`,
					);
				}
			}
		}

		// それでもわからなければ終了
		if (authUser == null) {
			logResult("no auth user", job.id, undefined, timer);
			return "skip: failed to resolve user";
		}

		// publicKey がなくても終了
		if (authUser.key == null) {
			logResult(
				"no auth user key",
				job.id,
				{
					authUser,
				},
				timer,
			);
			return "skip: failed to resolve user publicKey";
		}

		// HTTP-Signatureの検証
		timer.log("before httpSignature.verifySignature");
		const httpSignatureValidated = httpSignature.verifySignature(
			signature,
			authUser.key.keyPem,
		);

		// また、signatureのsignerは、activity.actorと一致する必要がある
		if (!httpSignatureValidated || authUser.user.uri !== activity.actor) {
			// 一致しなくても、でもLD-Signatureがありそうならそっちも見る
			if (activity.signature) {
				if (activity.signature.type !== "RsaSignature2017") {
					logResult(
						"unsupported sig type",
						job.id,
						{
							sig: activity.signature,
						},
						timer,
					);
					return `skip: unsupported LD-signature type ${activity.signature.type}`;
				}

				// activity.signature.creator: https://example.oom/users/user#main-key
				// みたいになっててUserを引っ張れば公開キーも入ることを期待する
				if (activity.signature.creator) {
					timer.log("before resolvePerson creator");
					const candicate = activity.signature.creator.replace(/#.*/, "");
					await resolvePerson(candicate).catch(() => null);
				}

				// keyIdからLD-Signatureのユーザーを取得
				timer.log("before getAuthUserFromKeyId creator");
				authUser = await dbResolver.getAuthUserFromKeyId(
					activity.signature.creator,
				);
				if (authUser == null) {
					logResult(
						"creator cannot be retrieved",
						job.id,
						{
							creator: activity.signature.creator,
						},
						timer,
					);
					return "skip: LD-Signatureのユーザーが取得できませんでした";
				}

				if (authUser.key == null) {
					logResult(
						"creator key cannot be retrieved",
						job.id,
						{
							authUser,
						},
						timer,
					);
					return "skip: LD-SignatureのユーザーはpublicKeyを持っていませんでした";
				}

				// LD-Signature検証
				timer.log("before ldSignature.verifyRsaSignature2017");
				const ldSignature = new LdSignature();
				const verified = await ldSignature
					.verifyRsaSignature2017(activity, authUser.key.keyPem)
					.catch(() => false);
				if (!verified) {
					logResult(
						"creator cannot be validated",
						job.id,
						{
							authUser,
						},
						timer,
					);
					return "skip: LD-Signatureの検証に失敗しました";
				}

				// もう一度actorチェック
				if (authUser.user.uri !== activity.actor) {
					logResult(
						"authUser not creator",
						job.id,
						{
							authUser,
							creator: activity.signature.creator,
						},
						timer,
					);
					return `skip: LD-Signature user(${authUser.user.uri}) !== activity.actor(${activity.actor})`;
				}

				// ブロックしてたら中断
				timer.log("before shouldBlockInstance");
				const ldHost = extractDbHost(authUser.user.uri);
				if (await shouldBlockInstance(ldHost, meta)) {
					logResult(
						"blocked request",
						job.id,
						{
							ldHost,
						},
						timer,
					);
					return `Blocked request: ${ldHost}`;
				}
			} else {
				logResult(
					"no activity verification",
					job.id,
					{
						signature,
						authUser,
					},
					timer,
				);
				return `skip: http-signature verification failed and no LD-Signature. keyId=${signature.keyId}`;
			}
		}

		// activity.idがあればホストが署名者のホストであることを確認する
		if (typeof activity.id === "string") {
			timer.log("before activity.id check");
			const signerHost = extractDbHost(authUser.user.uri!);
			const activityIdHost = extractDbHost(activity.id);
			if (signerHost !== activityIdHost) {
				logResult(
					"signer mismatch",
					job.id,
					{
						signerHost,
						activityIdHost,
					},
					timer,
				);
				return `skip: signerHost(${signerHost}) !== activity.id host(${activityIdHost}`;
			}
		}

		// Update stats
		timer.log("before update stats");
		registerOrFetchInstanceDoc(authUser.user.host).then((i) => {
			Instances.update(i.id, {
				latestRequestReceivedAt: new Date(),
				lastCommunicatedAt: new Date(),
				isNotResponding: false,
			});

			fetchInstanceMetadata(i);

			instanceChart.requestReceived(i.host);
			apRequestChart.inbox();
			federationChart.inbox(i.host);
		});

		// アクティビティを処理
		timer.log("before perform");
		const success = await perform(authUser.user, activity, timer);
		if (success) {
			logResult("success", job.id, undefined, timer);
		} else {
			logResult("failed perform", job.id, undefined, timer);
		}
		return "ok";
	} catch (e) {
		logResult(
			"failed to process",
			job.id,
			{
				error: e,
			},
			timer,
		);
		throw e;
	}
};
