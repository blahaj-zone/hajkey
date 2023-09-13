import Redis from "ioredis";
import config from "@/config/index.js";

export function createConnection() {
	let source = config.redis;
	if (config.cacheServer) {
		source = config.cacheServer;
	}

	const cfg = {
		port: source.port,
		host: source.host,
		family: source.family ?? 0,
		password: source.pass,
		username: source.user,
		keyPrefix: `${source.prefix}:`,
		db: source.db || 0,
		tls: source.tls,
	};
	console.log("Connecting to redis", cfg);
	const redis = new Redis(cfg);
	return redis;
}

export const subscriber = createConnection();
subscriber.subscribe(config.host);

export const redisClient = createConnection();
