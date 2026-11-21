// Real runs of the compiled node against Apify (needs APIFY_TOKEN; costs a few cents at most).
// Usage: npm run build && APIFY_TOKEN=... node scripts/live-test.mjs [toolKey ...]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { makeContext, run } = require('../test/helpers.js');

const token = process.env.APIFY_TOKEN;
if (!token) { console.error('APIFY_TOKEN is not set'); process.exit(1); }

const SAMPLES = {
	markdown: { urls: 'https://example.com' },
	profanity: { texts: 'What the hell is this?\nA perfectly clean sentence.' },
	hn: { additionalFields: { searchQuery: 'n8n', maxItems: 3 } },
	postal: { postalCodes: 'US 10001\nCA M5V 3L9' },
	links: { urls: 'https://www.iana.org/help/example-domains', additionalFields: { maxPagesToCrawl: 1, checkExternalLinks: true, onlyBroken: false } },
	tenders: { additionalFields: { keywords: 'software', maxResults: 3, sources: ['ted'] } },
};

const only = process.argv.slice(2);
let failed = 0;
for (const [key, fields] of Object.entries(SAMPLES)) {
	if (only.length && !only.includes(key)) continue;
	const ctx = makeContext({
		params: { operation: key, options: { maxCostUsd: 0.05, maxRows: 5, timeoutSeconds: 240 }, ...fields },
		request: async (o) => {
			const url = new URL(o.url);
			for (const [k, v] of Object.entries(o.qs || {})) url.searchParams.set(k, String(v));
			const res = await fetch(url, {
				method: o.method,
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: o.body ? JSON.stringify(o.body) : undefined,
			});
			const text = await res.text();
			if (!res.ok) { const e = new Error(text.slice(0, 200)); e.httpCode = String(res.status); throw e; }
			return JSON.parse(text);
		},
	});
	const t0 = Date.now();
	try {
		const [out] = await run(ctx);
		const first = JSON.stringify(out[0]?.json || {}).slice(0, 160);
		console.log(`ok   ${key.padEnd(10)} ${out.length} item(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s  ${first}`);
		if (out[0]?.json?.noResults) { failed++; console.log('     ^ no results'); }
	} catch (e) {
		failed++;
		console.log(`FAIL ${key.padEnd(10)} ${e.message}`);
	}
}
process.exit(failed ? 1 : 0);
