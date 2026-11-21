import type { PandapiParam, PandapiTool } from './types';

const isEmpty = (v: unknown): boolean =>
	v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

export const normaliseUrl = (u: string): string =>
	/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`;

/** A list field from the UI (multi-line text, comma list, JSON array text or a real array) -> array. */
export function toList(value: unknown, name: string): unknown[] {
	if (Array.isArray(value)) return value;
	if (value === undefined || value === null) return [];
	if (typeof value !== 'string') return [value];
	const s = value.trim();
	if (!s) return [];
	if (s.startsWith('[')) {
		try {
			const parsed = JSON.parse(s);
			if (Array.isArray(parsed)) return parsed;
		} catch {
			// not JSON: treat as text
		}
	}
	const lines = s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
	if (name === 'texts' || lines.length > 1) return lines;
	return s.split(',').map((x) => x.trim()).filter(Boolean);
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });

function toJson(value: unknown, name: string): Result<unknown> {
	if (typeof value !== 'string') return ok(value);
	if (!value.trim()) return ok(undefined);
	try {
		return ok(JSON.parse(value));
	} catch {
		return fail(`${name} must be valid JSON.`);
	}
}

function coerce(name: string, p: PandapiParam, value: unknown): Result<unknown> {
	if (p.type === 'array' && p.itemsType === 'object') {
		const v = toJson(value, name);
		if (!v.ok || v.value === undefined) return v;
		return Array.isArray(v.value) ? v : fail(`${name} must be a JSON array.`);
	}
	if (p.type === 'object') return toJson(value, name);
	if (p.type === 'array') {
		const list = toList(value, name);
		if (!p.urlList) return ok(list);
		const urls: Array<{ url: string }> = [];
		for (const v of list) {
			if (v && typeof v === 'object' && typeof (v as { url?: unknown }).url === 'string') {
				urls.push({ url: normaliseUrl((v as { url: string }).url) });
			} else if (typeof v === 'string' && v.trim()) {
				urls.push({ url: normaliseUrl(v.trim()) });
			} else {
				return fail(`${name} must be a list of URLs.`);
			}
		}
		return ok(urls);
	}
	return ok(value);
}

/**
 * Field values from the node -> Apify actor input.
 * baseInput is always sent so the actor's sample defaults never sneak into a run,
 * tool defaults fill fields the user left out, extraInput overrides last.
 * Returns { input } or { error } (a message for the user).
 */
export function buildInput(
	tool: PandapiTool,
	fields: Record<string, unknown>,
	extraInput?: unknown,
): { input: Record<string, unknown>; error?: undefined } | { input?: undefined; error: string } {
	const input: Record<string, unknown> = JSON.parse(JSON.stringify(tool.baseInput || {}));
	const values: Record<string, unknown> = {};
	for (const [name, p] of Object.entries(tool.params)) {
		const raw = fields[name] !== undefined && !isEmpty(fields[name]) ? fields[name] : tool.defaults[name];
		if (raw === undefined) continue;
		const v = coerce(name, p, raw);
		if (!v.ok) return { error: `${tool.title}: ${v.error}` };
		if (isEmpty(v.value)) continue;
		values[name] = v.value;
		input[p.actorField || name] = v.value;
	}
	for (const r of tool.required) {
		if (isEmpty(values[r])) return { error: `${tool.title}: "${r}" is required.` };
	}
	const extra = typeof extraInput === 'string' ? toJson(extraInput, 'Extra Input') : ok(extraInput);
	if (!extra.ok) return { error: extra.error };
	if (extra.value !== undefined && extra.value !== null) {
		if (typeof extra.value !== 'object' || Array.isArray(extra.value)) return { error: 'Extra Input must be a JSON object.' };
		Object.assign(input, extra.value);
	}
	if (tool.anyOf && !tool.anyOf.some((group) => group.every((k) => !isEmpty(input[tool.params[k]?.actorField || k])))) {
		return { error: `${tool.title}: fill at least one of: ${tool.anyOf.map((g) => g.join(' + ')).join(', ')}.` };
	}
	return { input };
}

/** Plain-language message for an Apify API error status. */
export function friendlyApifyError(status: number | undefined, message: string): string {
	switch (status) {
		case 401:
			return 'Apify rejected the token (401). Check the Apify API Token in the Pandapi credential: https://console.apify.com/settings/integrations';
		case 402:
			return `Your Apify account has no credit left for this run (402): ${message}. The free Apify plan includes monthly credit: https://console.apify.com/billing`;
		case 403:
			return `Apify refused the request (403): ${message}`;
		case 404:
			return `Not found on Apify (404): ${message}`;
		case 429:
			return 'Apify rate limit reached (429). Wait a few seconds and try again, or lower the batch size.';
		default:
			return `Apify API error${status ? ` ${status}` : ''}: ${message}`;
	}
}
