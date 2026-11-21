const test = require('node:test');
const assert = require('node:assert/strict');
const { buildInput, toList, friendlyApifyError } = require('../dist/nodes/Pandapi/input.js');
const { TOOLS } = require('../dist/nodes/Pandapi/tools.js');

const tool = (k) => TOOLS.find((t) => t.key === k);

test('every registry tool is present with an actor and action', () => {
	assert.equal(TOOLS.length >= 12, true);
	for (const t of TOOLS) {
		assert.match(t.actor, /^blueberry_rainstorm\//);
		assert.ok(t.action.length > 5, t.key);
	}
});

test('toList splits lines, commas, JSON arrays and keeps arrays', () => {
	assert.deepEqual(toList('a.com\nb.com', 'urls'), ['a.com', 'b.com']);
	assert.deepEqual(toList('a.com, b.com', 'urls'), ['a.com', 'b.com']);
	assert.deepEqual(toList('["x","y"]', 'keywords'), ['x', 'y']);
	assert.deepEqual(toList(['x'], 'keywords'), ['x']);
	assert.deepEqual(toList('hello, world', 'texts'), ['hello, world']);
	assert.deepEqual(toList('', 'urls'), []);
});

test('URL lists become [{url}] with https added, defaults applied, base input kept', () => {
	const r = buildInput(tool('markdown'), { urls: 'example.com\nhttps://apify.com/x' });
	assert.equal(r.error, undefined);
	assert.deepEqual(r.input.urls, [{ url: 'https://example.com' }, { url: 'https://apify.com/x' }]);
	assert.equal(r.input.maxPages, 10);
});

test('anyOf: markdown needs urls or sitemapUrls', () => {
	const r = buildInput(tool('markdown'), { urls: '' });
	assert.match(r.error, /at least one of/);
	const ok = buildInput(tool('markdown'), { sitemapUrls: 'https://example.com/sitemap.xml' });
	assert.equal(ok.error, undefined);
	assert.deepEqual(ok.input.urls, []);
});

test('required field missing gives a clear error', () => {
	const r = buildInput(tool('profanity'), {});
	assert.match(r.error, /"texts" is required/);
});

test('extraInput overrides and must be an object', () => {
	const r = buildInput(tool('hn'), { searchQuery: 'mcp' }, '{"maxItems": 5}');
	assert.equal(r.input.maxItems, 5);
	assert.equal(r.input.searchQuery, 'mcp');
	assert.match(buildInput(tool('hn'), {}, '[1]').error, /JSON object/);
	assert.match(buildInput(tool('hn'), {}, '{bad').error, /valid JSON/);
});

test('JSON array param (html-to-pdf data) parses and validates', () => {
	const t = tool('htmlpdf');
	const r = buildInput(t, { template: '<h1>{{name}}</h1>', data: '[{"name":"A"}]' });
	assert.equal(r.error, undefined);
	assert.deepEqual(r.input.data, [{ name: 'A' }]);
	assert.match(buildInput(t, { template: 'x', data: '{"a":1}' }).error, /JSON array/);
});

test('friendly errors explain 401 and 402', () => {
	assert.match(friendlyApifyError(401, 'x'), /token/);
	assert.match(friendlyApifyError(402, 'x'), /credit/);
});
