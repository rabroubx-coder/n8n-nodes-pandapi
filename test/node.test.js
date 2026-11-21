const test = require('node:test');
const assert = require('node:assert/strict');
const { Pandapi, makeContext, run } = require('./helpers');
const { TOOLS } = require('../dist/nodes/Pandapi/tools.js');

test('description: one operation per tool, usable as an AI tool, every field scoped to its operation', () => {
	const d = new Pandapi().description;
	assert.equal(d.usableAsTool, true);
	const op = d.properties.find((p) => p.name === 'operation');
	assert.deepEqual(op.options.map((o) => o.value), TOOLS.map((t) => t.key));
	for (const p of d.properties) {
		if (p.name === 'operation' || p.name === 'options') continue;
		assert.ok(p.displayOptions?.show?.operation?.length === 1, `${p.name} has no operation scope`);
	}
	for (const t of TOOLS) {
		const names = d.properties.filter((p) => p.displayOptions?.show?.operation?.[0] === t.key).flatMap((p) => (p.type === 'collection' ? p.options.map((o) => o.name) : [p.name]));
		assert.deepEqual(names.sort(), Object.keys(t.params).sort(), t.key);
	}
});

const okRun = { id: 'run1', status: 'SUCCEEDED', defaultDatasetId: 'ds1' };

test('execute: starts the actor with cap, returns one item per row, paired to input', async () => {
	const ctx = makeContext({
		params: { operation: 'markdown', urls: 'example.com', additionalFields: { contentMode: 'full' }, options: { maxCostUsd: 0.2, maxRows: 5 } },
		request: (o) => (o.method === 'POST' ? { data: okRun } : [{ url: 'https://example.com', markdown: '# Hi' }, { url: 'b' }]),
	});
	const [out] = await run(ctx);
	assert.equal(out.length, 2);
	assert.equal(out[0].json.markdown, '# Hi');
	assert.deepEqual(out[0].pairedItem, { item: 0 });
	const post = ctx.calls[0];
	assert.equal(post.cred, 'pandapiApi');
	assert.match(post.url, /\/acts\/blueberry_rainstorm~web-page-to-markdown\/runs$/);
	assert.equal(post.qs.maxTotalChargeUsd, 0.2);
	assert.deepEqual(post.body.urls, [{ url: 'https://example.com' }]);
	assert.equal(post.body.contentMode, 'full');
	assert.equal(ctx.calls[1].qs.limit, 5);
});

test('execute: polls a running run until it finishes', async () => {
	let polls = 0;
	const ctx = makeContext({
		params: { operation: 'hn', additionalFields: { searchQuery: 'mcp' }, options: {} },
		request: (o) => {
			if (o.method === 'POST') return { data: { ...okRun, status: 'RUNNING' } };
			if (o.url.includes('/actor-runs/')) return { data: { ...okRun, status: ++polls < 2 ? 'RUNNING' : 'SUCCEEDED' } };
			return [{ title: 'x' }];
		},
	});
	const [out] = await run(ctx);
	assert.equal(polls, 2);
	assert.equal(out[0].json.title, 'x');
});

test('execute: empty dataset returns one clear noResults item (never silent)', async () => {
	const ctx = makeContext({ params: { operation: 'profanity', texts: 'hello', options: {} }, request: (o) => (o.method === 'POST' ? { data: okRun } : []) });
	const [out] = await run(ctx);
	assert.equal(out.length, 1);
	assert.equal(out[0].json.noResults, true);
});

test('execute: failed run and bad input throw clear errors; continueOnFail returns error items', async () => {
	const failed = makeContext({ params: { operation: 'profanity', texts: 'x', options: {} }, request: () => ({ data: { ...okRun, status: 'FAILED', statusMessage: 'boom' } }) });
	await assert.rejects(run(failed), /run failed: boom/);
	const bad = makeContext({ params: { operation: 'profanity', texts: '', options: {} }, request: () => assert.fail('no call') });
	await assert.rejects(run(bad), /"texts" is required/);
	const cof = makeContext({ params: { operation: 'profanity', texts: '', options: {} }, request: () => ({}), continueOnFail: true });
	const [out] = await run(cof);
	assert.match(out[0].json.error, /required/);
});

test('execute: Wait for Results off returns the run id at once', async () => {
	const ctx = makeContext({ params: { operation: 'links', urls: 'example.com', options: { waitForResults: false } }, request: () => ({ data: { ...okRun, status: 'READY' } }) });
	const [out] = await run(ctx);
	assert.equal(out[0].json.runId, 'run1');
	assert.equal(ctx.calls[0].qs.waitForFinish, 0);
	assert.equal(ctx.calls.length, 1);
});

test('execute: Apify 401 becomes a friendly token message', async () => {
	const ctx = makeContext({
		params: { operation: 'profanity', texts: 'x', options: {} },
		request: () => {
			const e = new Error('Request failed with status code 401');
			e.httpCode = '401';
			throw e;
		},
	});
	await assert.rejects(run(ctx), /rejected the token/);
});

test('example templates: every Pandapi node has valid input', () => {
	const fs = require('node:fs');
	const path = require('node:path');
	const { buildInput } = require('../dist/nodes/Pandapi/input.js');
	const dir = path.join(__dirname, '..', 'templates');
	for (const f of fs.readdirSync(dir)) {
		const wf = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
		const nodes = wf.nodes.filter((n) => n.type === 'n8n-nodes-pandapi.pandapi');
		assert.ok(nodes.length, f);
		for (const n of nodes) {
			const t = TOOLS.find((x) => x.key === n.parameters.operation);
			const fields = { ...n.parameters, ...(n.parameters.additionalFields || {}) };
			const r = buildInput(t, fields);
			assert.equal(r.error, undefined, `${f}: ${r.error}`);
		}
	}
});
