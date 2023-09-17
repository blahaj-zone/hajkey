import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { toArray } from "@/prelude/array.js";
import {
	isCreate,
	isDelete,
	isUpdate,
	isRead,
	isFollow,
	isAccept,
	isReject,
	isAdd,
	isRemove,
	isAnnounce,
	isLike,
	isUndo,
	isBlock,
	isCollectionOrOrderedCollection,
	isCollection,
	isFlag,
	isMove,
	getApId,
} from "../type.js";
import { apLogger } from "../logger.js";
import Resolver from "../resolver.js";
import create from "./create/index.js";
import performDeleteActivity from "./delete/index.js";
import performUpdateActivity from "./update/index.js";
import { performReadActivity } from "./read.js";
import follow from "./follow.js";
import undo from "./undo/index.js";
import like from "./like.js";
import announce from "./announce/index.js";
import accept from "./accept/index.js";
import reject from "./reject/index.js";
import add from "./add/index.js";
import remove from "./remove/index.js";
import block from "./block/index.js";
import flag from "./flag/index.js";
import move from "./move/index.js";
import type { IObject } from "../type.js";
import { extractDbHost } from "@/misc/convert-host.js";
import { shouldBlockInstance } from "@/misc/should-block-instance.js";
import { PerformanceTimer } from "@/queue/processors/inbox.js";

export async function performActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
	timer?: PerformanceTimer,
) {
	timer?.log("performActivity");
	if (isCollectionOrOrderedCollection(activity)) {
		const resolver = new Resolver();
		for (const item of toArray(
			isCollection(activity) ? activity.items : activity.orderedItems,
		)) {
			const act = await resolver.resolve(item);
			try {
				await performOneActivity(actor, act, timer);
			} catch (err) {
				if (err instanceof Error || typeof err === "string") {
					apLogger.error(err);
				}
			}
		}
	} else {
		await performOneActivity(actor, activity, timer);
	}
}

async function performOneActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
	timer?: PerformanceTimer,
): Promise<void> {
	timer?.log("performOneActivity");
	if (actor.isSuspended) return;

	if (typeof activity.id !== "undefined") {
		timer?.log("performOneActivity: extractDbHost from apId");
		const host = extractDbHost(getApId(activity));
		timer?.log("performOneActivity: shouldBlockInstance");
		if (await shouldBlockInstance(host)) return;
	}

	if (isCreate(activity)) {
		timer?.log("performOneActivity: create");
		await create(actor, activity);
	} else if (isDelete(activity)) {
		timer?.log("performOneActivity: performDeleteActivity");
		await performDeleteActivity(actor, activity);
	} else if (isUpdate(activity)) {
		timer?.log("performOneActivity: performUpdateActivity");
		await performUpdateActivity(actor, activity);
	} else if (isRead(activity)) {
		timer?.log("performOneActivity: performReadActivity");
		await performReadActivity(actor, activity);
	} else if (isFollow(activity)) {
		timer?.log("performOneActivity: follow");
		await follow(actor, activity);
	} else if (isAccept(activity)) {
		timer?.log("performOneActivity: accept");
		await accept(actor, activity);
	} else if (isReject(activity)) {
		timer?.log("performOneActivity: reject");
		await reject(actor, activity);
	} else if (isAdd(activity)) {
		timer?.log("performOneActivity: add");
		await add(actor, activity).catch((err) => apLogger.error(err));
	} else if (isRemove(activity)) {
		timer?.log("performOneActivity: remove");
		await remove(actor, activity).catch((err) => apLogger.error(err));
	} else if (isAnnounce(activity)) {
		timer?.log("performOneActivity: announce");
		await announce(actor, activity);
	} else if (isLike(activity)) {
		timer?.log("performOneActivity: like");
		await like(actor, activity);
	} else if (isUndo(activity)) {
		timer?.log("performOneActivity: undo");
		await undo(actor, activity);
	} else if (isBlock(activity)) {
		timer?.log("performOneActivity: block");
		await block(actor, activity);
	} else if (isFlag(activity)) {
		timer?.log("performOneActivity: flag");
		await flag(actor, activity);
	} else if (isMove(activity)) {
		timer?.log("performOneActivity: move");
		await move(actor, activity);
	} else {
		apLogger.warn(`unrecognized activity type: ${(activity as any).type}`);
	}
}
