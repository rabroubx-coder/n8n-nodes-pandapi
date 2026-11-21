import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { TOOLS } from './tools';
import type { PandapiParam, PandapiTool } from './types';

/** "maxPagesPerSite" -> "Max Pages Per Site", "urls" -> "URLs". */
export function labelFor(name: string): string {
	const words = name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/_/g, ' ')
		.split(' ');
	return words
		.map((w) => {
			const lw = w.toLowerCase();
			if (lw === 'urls') return 'URLs';
			if (lw === 'url') return 'URL';
			if (lw === 'usd') return 'USD';
			if (lw === 'html') return 'HTML';
			if (lw === 'ocr') return 'OCR';
			if (lw === 'cpv' || lw === 'naics') return w.toUpperCase();
			return lw.charAt(0).toUpperCase() + lw.slice(1);
		})
		.join(' ');
}

const LIST_HINT = 'One per line (or comma-separated). An expression returning an array also works.';

function isTextList(name: string): boolean {
	// Free text items may contain commas, so only newlines split them.
	return name === 'texts';
}

/** n8n property for one actor parameter (without displayOptions). */
export function propertyFor(name: string, p: PandapiParam, tool: PandapiTool, inCollection: boolean): INodeProperties {
	const displayName = labelFor(name);
	const fallback = tool.defaults[name];
	let description = p.description;
	const base = { displayName, name, description } as INodeProperties;

	if (p.type === 'array' && p.itemsEnum) {
		return {
			...base,
			type: 'multiOptions',
			options: p.itemsEnum.map((v) => ({ name: labelFor(v), value: v })),
			default: Array.isArray(fallback) ? fallback : [],
		};
	}
	if (p.type === 'array' && (p.itemsType === 'object' || p.type === ('object' as string))) {
		return { ...base, type: 'json', default: '[]' };
	}
	if (p.type === 'array') {
		description = `${p.description} ${isTextList(name) ? 'One per line. An expression returning an array also works.' : LIST_HINT}`.trim();
		return {
			...base,
			description,
			type: 'string',
			typeOptions: { rows: p.urlList || isTextList(name) ? 4 : 2 },
			default: '',
			placeholder: p.urlList ? 'https://example.com' : '',
			required: !inCollection && tool.required.includes(name),
		};
	}
	if (p.type === 'object') {
		return { ...base, type: 'json', default: '{}' };
	}
	if (p.type === 'boolean') {
		return { ...base, type: 'boolean', default: typeof fallback === 'boolean' ? fallback : false };
	}
	if (p.type === 'integer' || p.type === 'number') {
		const typeOptions: INodeProperties['typeOptions'] = {};
		if (p.minimum !== undefined) typeOptions.minValue = p.minimum;
		if (p.maximum !== undefined) typeOptions.maxValue = p.maximum;
		if (p.type === 'integer') typeOptions.numberPrecision = 0;
		return {
			...base,
			type: 'number',
			typeOptions,
			default: typeof fallback === 'number' ? fallback : p.minimum !== undefined && p.minimum > 0 ? p.minimum : 0,
		};
	}
	if (p.enum) {
		return {
			...base,
			type: 'options',
			options: p.enum.map((v) => ({ name: labelFor(v), value: v })),
			default: typeof fallback === 'string' ? fallback : p.enum[0],
		};
	}
	return {
		...base,
		type: 'string',
		typeOptions: name === 'html' || name === 'template' ? { rows: 6 } : name === 'password' ? { password: true } : undefined,
		default: typeof fallback === 'string' ? fallback : '',
		required: !inCollection && tool.required.includes(name),
	};
}

export const operationOptions: INodePropertyOptions[] = TOOLS.map((t) => ({
	name: t.title,
	value: t.key,
	action: t.action,
	description: t.description.split(/(?<=\.)\s/)[0],
}));

/** All per-tool properties: main fields, then an "Additional Fields" collection. */
export function toolProperties(): INodeProperties[] {
	const props: INodeProperties[] = [];
	for (const t of TOOLS) {
		const show = { displayOptions: { show: { operation: [t.key] } } };
		for (const name of t.main) {
			props.push({ ...propertyFor(name, t.params[name], t, false), ...show });
		}
		const rest = Object.keys(t.params).filter((n) => !t.main.includes(n));
		if (rest.length) {
			props.push({
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				...show,
				options: rest
					.map((n) => propertyFor(n, t.params[n], t, true))
					.sort((a, b) => a.displayName.localeCompare(b.displayName)),
			});
		}
	}
	return props;
}

export const commonOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Extra Input (JSON)',
			name: 'extraInput',
			type: 'json',
			default: '{}',
			description: 'Advanced: other fields of the Apify actor input, passed as-is. They override the fields above.',
		},
		{
			displayName: 'Max Cost per Run (USD)',
			name: 'maxCostUsd',
			type: 'number',
			typeOptions: { minValue: 0.01, numberPrecision: 2 },
			default: 1,
			description: 'Spending cap for each run, charged to your Apify account. The run stops once it reaches it.',
		},
		{
			displayName: 'Max Rows',
			name: 'maxRows',
			type: 'number',
			typeOptions: { minValue: 0, numberPrecision: 0 },
			default: 1000,
			description: 'Most result rows to return per input item. 0 returns all rows.',
		},
		{
			displayName: 'Timeout (Seconds)',
			name: 'timeoutSeconds',
			type: 'number',
			typeOptions: { minValue: 10, maxValue: 3600, numberPrecision: 0 },
			default: 300,
			description: 'How long to wait for the run to finish. The run keeps going on Apify if this is reached.',
		},
		{
			displayName: 'Wait for Results',
			name: 'waitForResults',
			type: 'boolean',
			default: true,
			description:
				'Whether to wait for the run and return its rows. Turn off to only start the run and return its ID (use for very large jobs).',
		},
	],
};
