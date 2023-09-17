import { URL } from "node:url";
import type Bull from "bull";
import httpSignature from "@peertube/http-signature";
import perform from "@/remote/activitypub/perform.js";
import Logger from "@/services/logger.js";
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

const logger = new Logger("inbox");
const processLog = logger.createSubLogger("process", "red");

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

	public log(message: string|undefined): number {
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

	public render(): string {
		this.log("render");
		return this.laps.map((lap) => {
			return `@${lap.total}ms (+${lap.duration}ms): ${lap.message}`;
		}).join("  ");
	}
};

// Processing when an activity arrives in the user's inbox
export default async (job: Bull.Job<InboxJobData>): Promise<string> => {
	const timer = new PerformanceTimer();	
	try {
	processLog.info(`processing inbox: ${JSON.stringify({
		id: job.id,
		attempts: job.attemptsMade,
	})}`);

	const signature = job.data.signature; // HTTP-signature
	const activity = job.data.activity;

	//#region Log
	const info = Object.assign({}, activity) as any;
	info["@context"] = undefined;
	logger.info(JSON.stringify(info, null, 2));

	if (!signature?.keyId) {
		const err = `Invalid signature: ${signature}`;
		processLog.info(`invalid signature: ${JSON.stringify({
			id: job.id,
			timer: timer.render(),
		})}`);
		job.moveToFailed({ message: err }, true);
		return err;
	}
	//#endregion
	const host = toPuny(new URL(signature.keyId).hostname);

	// interrupt if blocked
	timer.log("before shouldBlockInstance fetchMeta");
	const meta = await fetchMeta();
	if (await shouldBlockInstance(host, meta)) {
		processLog.info(`blacklisted instance: ${JSON.stringify({
			id: job.id,
			host,
			timer: timer.render(),
		})}`);
		return `Blocked request: ${host}`;
	}

	// only whitelisted instances in private mode
	if (meta.privateMode && !meta.allowedHosts.includes(host)) {
		processLog.info(`non-whitelisted instance: ${JSON.stringify({
			id: job.id,
			host,
			timer: timer.render(),
		})}`);
		return `Blocked request: ${host}`;
	}

	const keyIdLower = signature.keyId.toLowerCase();
	if (keyIdLower.startsWith("acct:")) {
		processLog.info(`old keyId: ${JSON.stringify({
			id: job.id,
			keyId: signature.keyId,
			timer: timer.render(),
		})}`);
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
			authUser = await dbResolver.getAuthUserFromApId(getApId(activity.actor));
		} catch (e) {
			// Skip if target is 4xx
			if (e instanceof StatusError) {
				if (e.isClientError) {
					processLog.info(`skip clientError: ${JSON.stringify({
						id: job.id,
						error: e,
						actor: activity.actor,
						timer: timer.render(),
					})}`);
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
		processLog.info(`no auth user: ${JSON.stringify({
			id: job.id,
			timer: timer.render(),
		})}`);
		return "skip: failed to resolve user";
	}

	// publicKey がなくても終了
	if (authUser.key == null) {
		processLog.info(`no auth user key: ${JSON.stringify({
			id: job.id,
			authUser,
			timer: timer.render(),
		})}`);
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
				processLog.info(`unsupported sig type: ${JSON.stringify({
					id: job.id,
					sig: activity.signature,
					timer: timer.render(),
				})}`);
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
				processLog.info(`creator cannot be retrieved: ${JSON.stringify({
					id: job.id,
					creator: activity.signature.creator,
					timer: timer.render(),
				})}`);		
				return "skip: LD-Signatureのユーザーが取得できませんでした";
			}

			if (authUser.key == null) {
				processLog.info(`creator key cannot be retrieved: ${JSON.stringify({
					id: job.id,
					authUser,
					timer: timer.render(),
				})}`);		
				return "skip: LD-SignatureのユーザーはpublicKeyを持っていませんでした";
			}

			// LD-Signature検証
			timer.log("before ldSignature.verifyRsaSignature2017");
			const ldSignature = new LdSignature();
			const verified = await ldSignature
				.verifyRsaSignature2017(activity, authUser.key.keyPem)
				.catch(() => false);
			if (!verified) {
				processLog.info(`creator cannot be validated: ${JSON.stringify({
					id: job.id,
					authUser,
					timer: timer.render(),
				})}`);		
				return "skip: LD-Signatureの検証に失敗しました";
			}

			// もう一度actorチェック
			if (authUser.user.uri !== activity.actor) {
				processLog.info(`authUser not creator: ${JSON.stringify({
					id: job.id,
					authUser,
					creator: activity.signature.creator,
					timer: timer.render(),
				})}`);		
				return `skip: LD-Signature user(${authUser.user.uri}) !== activity.actor(${activity.actor})`;
			}

			// ブロックしてたら中断
			timer.log("before shouldBlockInstance");
			const ldHost = extractDbHost(authUser.user.uri);
			if (await shouldBlockInstance(ldHost, meta)) {
				processLog.info(`blocked request: ${JSON.stringify({
					id: job.id,
					ldHost,
					timer: timer.render(),
				})}`);
				return `Blocked request: ${ldHost}`;
			}
		} else {
			processLog.info(`no activity verification: ${JSON.stringify({
				id: job.id,
				signature,
				authUser,
				timer: timer.render(),
			})}`);		
			return `skip: http-signature verification failed and no LD-Signature. keyId=${signature.keyId}`;
		}
	}

	// activity.idがあればホストが署名者のホストであることを確認する
	if (typeof activity.id === "string") {
		timer.log("before activity.id check");
		const signerHost = extractDbHost(authUser.user.uri!);
		const activityIdHost = extractDbHost(activity.id);
		if (signerHost !== activityIdHost) {
			processLog.info(`signer mismatch: ${JSON.stringify({
				id: job.id,
				signerHost,
				activityIdHost,
				timer: timer.render(),
			})}`);
			return `skip: signerHost(${signerHost}) !== activity.id host(${activityIdHost}`;
		}
	}

	// Update stats
	timer.log("before update stats")
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
	await perform(authUser.user, activity, timer);
	processLog.info(`performed activity okay: ${JSON.stringify({
		id: job.id,
		timer: timer.render(),
	})}`);
	return "ok";
	} catch (e) {
	processLog.info(`failed to process: ${JSON.stringify({
		id: job.id,
		error: e,
		timer: timer.render(),
	})}`);
	throw e;
	}
};
