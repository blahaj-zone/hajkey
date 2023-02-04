import type { KVs } from "../core.js";
import Chart from "../core.js";
import { name, schema } from "./entities/test.js";

/**
 * For testing
 */

export default class TestChart extends Chart<typeof schema> {
	public total = 0; // publicにするのはテストのため

	constructor() {
		super(name, schema);
	}

	protected async tickMajor(): Promise<Partial<KVs<typeof schema>>> {
		return {
			"foo.total": this.total,
		};
	}

	protected async tickMinor(): Promise<Partial<KVs<typeof schema>>> {
		return {};
	}

	public async increment(): Promise<void> {
		this.total++;

		await this.commit({
			"foo.total": 1,
			"foo.inc": 1,
		});
	}

	public async decrement(): Promise<void> {
		this.total--;

		await this.commit({
			"foo.total": -1,
			"foo.dec": 1,
		});
	}
}
