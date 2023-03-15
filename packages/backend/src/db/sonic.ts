import * as SonicChannel from "sonic-channel";

import config from "@/config/index.js";

const search = config.sonic
	? new SonicChannel.Search({
			host: config.sonic.host,
			port: config.sonic.port,
			auth: config.sonic.auth,
		}).connect({})
	: null;

const ingest = config.sonic
	? new SonicChannel.Ingest({
			host: config.sonic.host,
			port: config.sonic.port,
			auth: config.sonic.auth,
		}).connect({})
	: null;

export default search && ingest
	? {
			search,
			ingest,
		}
	: null;
