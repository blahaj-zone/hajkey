import * as cp___instance_info from './instance-info';
import * as cp___custom_emojis from './custom-emojis';
import { IEndpoint } from '../../endpoints';

const cps = [
	['v1/instance', cp___instance_info],
	['v1/custom-emojis', cp___custom_emojis],
];

const compatibility: IEndpoint[] = cps.map(([name, ep]) => {
	return {
		name: name,
		exec: ep.default,
		meta: ep.meta || {},
		params: ep.paramDef,
	} as IEndpoint;
});

export default compatibility;
