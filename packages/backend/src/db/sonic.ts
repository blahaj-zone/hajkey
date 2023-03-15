import * as SonicChannel from "sonic-channel";

import config from "@/config/index.js";

const search = config.sonic
	? new SonicChannel.Search({
			host: config.sonic.host ?? "localhost",
			port: config.sonic.port ?? 1491,
			auth: config.sonic.auth ?? "SecretPassword",
		}).connect({
			connected: () => {
				console.log("Connected to Sonic search");
			},
			disconnected: (error) => {
				console.error("Disconnected from Sonic search", error);
			},
			error: (error) => {
				console.error("Sonic search error", error);
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
				console.log("Connected to Sonic ingest");
			},
			disconnected: (error) => {
				console.error("Disconnected from Sonic ingest", error);
			},
			error: (error) => {
				console.error("Sonic ingest error", error);
			}
		})
	: null;

export default search && ingest
	? {
			search,
			ingest,
		}
	: null;
