import type { IEndpoint } from "./endpoints";

import * as cp___instanceInfo from "./endpoints/compatibility/instance-info.js";
import * as cp___customEmojis from "./endpoints/compatibility/custom-emojis.js";

const cps = [
	["v1/instance", cp___instanceInfo],
	["v1/custom_emojis", cp___customEmojis],
];

const compatibility: IEndpoint[] = cps.map(([name, cp]) => {
	return {
		name: name,
		exec: cp.default,
		meta: cp.meta || {},
		params: cp.paramDef,
	} as IEndpoint;
});

export default compatibility;
