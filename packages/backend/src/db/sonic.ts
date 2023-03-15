import * as SonicChannel from "sonic-channel";

import config from "@/config/index.js";

const search = config.sonic
	? new SonicChannel.Search({
			host: config.sonic.host ?? "localhost",
			port: config.sonic.port ?? 1491,
			auth: config.sonic.auth ?? "SecretPassword",
		}).connect({})
	: null;

const ingest = config.sonic
	? new SonicChannel.Ingest({
			host: config.sonic.host ?? "localhost",
			port: config.sonic.port ?? 1491,
			auth: config.sonic.auth ?? "SecretPassword",
		}).connect({})
	: null;

export default search && ingest
	? {
			search,
			ingest,
		}
	: null;
