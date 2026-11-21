// Minimal IExecuteFunctions stand-in for running the compiled node outside n8n.
const { Pandapi } = require('../dist/nodes/Pandapi/Pandapi.node.js');

function makeContext({ params, items = [{ json: {} }], request, continueOnFail = false }) {
	const calls = [];
	const ctx = {
		calls,
		getInputData: () => items,
		getNodeParameter: (name, i, fallback) => {
			const p = typeof params === 'function' ? params(i) : params;
			return p[name] !== undefined ? p[name] : fallback;
		},
		getNode: () => ({ name: 'Pandapi', type: 'n8n-nodes-pandapi.pandapi', typeVersion: 1, parameters: {} }),
		continueOnFail: () => continueOnFail,
		helpers: {
			httpRequestWithAuthentication: async function (cred, opts) {
				calls.push({ cred, ...opts });
				return request(opts);
			},
		},
	};
	return ctx;
}

async function run(ctx) {
	const node = new Pandapi();
	return node.execute.call(ctx);
}

module.exports = { Pandapi, makeContext, run };
