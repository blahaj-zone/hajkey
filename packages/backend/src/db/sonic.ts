import * as SonicChannel from "sonic-channel";
import { dbLogger } from "./logger.js";

import config from "@/config/index.js";

const logger = dbLogger.createSubLogger("sonic", "gray", false);

logger.info("Connecting to Sonic");

const search = config.sonic
	? new SonicChannel.Search({
			host: config.sonic.host ?? "localhost",
			port: config.sonic.port ?? 1491,
			auth: config.sonic.auth ?? "SecretPassword",
		}).connect({
			connected: () => {
				logger.succ("Connected to Sonic search");
			},
			disconnected: (error) => {
				logger.warn("Disconnected from Sonic search", error);
			},
			error: (error) => {
				logger.warn("Sonic search error", error);
			},
		})
	: null;

const ingest = config.sonic
	? new SonicChannel.Ingest({
			host: config.sonic.host ?? "localhost",
			port: config.sonic.port ?? 1491,
			auth: config.sonic.auth ?? "SecretPassword",
		}).connect({
			connected: () => {
				logger.succ("Connected to Sonic ingest");
			},
			disconnected: (error) => {
				logger.warn("Disconnected from Sonic ingest", error);
			},
			error: (error) => {
				logger.warn("Sonic ingest error", error);
			}
		})
	: null;

export default search && ingest
	? {
			search,
			ingest,
		}
	: null;
