import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { commonOptions, operationOptions, toolProperties } from './fields';
import { buildInput, friendlyApifyError } from './input';
import { TOOLS } from './tools';

const API = 'https://api.apify.com/v2';
const TERMINAL = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'];

interface ApifyRun {
	id: string;
	status: string;
	statusMessage?: string;
	defaultDatasetId: string;
	defaultKeyValueStoreId?: string;
	usageTotalUsd?: number;
}

export class Pandapi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pandapi',
		name: 'pandapi',
		icon: { light: 'file:../../icons/pandapi.svg', dark: 'file:../../icons/pandapi.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Pandapi data tools: web pages and PDFs to Markdown, PDF tables, screenshots, broken links, website contacts, public tenders, app reviews, postal codes, HTML to PDF, Hacker News and a profanity filter',
		defaults: { name: 'Pandapi' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'pandapiApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: operationOptions,
				default: 'markdown',
			},
			...toolProperties(),
			commonOptions,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		const call = async (method: IHttpRequestMethods, path: string, qs: IDataObject = {}, body?: IDataObject) => {
			try {
				return (await this.helpers.httpRequestWithAuthentication.call(this, 'pandapiApi', {
					method,
					url: `${API}${path}`,
					qs,
					body,
					json: true,
				})) as IDataObject;
			} catch (error) {
				const e = error as JsonObject & { httpCode?: string; response?: { status?: number } };
				const status = Number(e.httpCode ?? (e.response as { status?: number } | undefined)?.status) || undefined;
				const apiMessage =
					((e as { description?: string }).description as string) || ((e as { message?: string }).message as string) || 'request failed';
				throw new NodeApiError(this.getNode(), e, { message: friendlyApifyError(status, apiMessage) });
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const key = this.getNodeParameter('operation', i) as string;
				const tool = TOOLS.find((t) => t.key === key);
				if (!tool) throw new NodeOperationError(this.getNode(), `Unknown operation: ${key}`, { itemIndex: i });

				const fields: Record<string, unknown> = {};
				for (const name of tool.main) fields[name] = this.getNodeParameter(name, i, undefined);
				if (Object.keys(tool.params).some((n) => !tool.main.includes(n))) {
					Object.assign(fields, this.getNodeParameter('additionalFields', i, {}) as IDataObject);
				}
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				const built = buildInput(tool, fields, options.extraInput);
				if (built.error !== undefined) throw new NodeOperationError(this.getNode(), built.error, { itemIndex: i });
				const input = built.input;

				const maxCostUsd = (options.maxCostUsd as number | undefined) ?? 1;
				const timeoutMs = ((options.timeoutSeconds as number | undefined) ?? 300) * 1000;
				const waitForResults = (options.waitForResults as boolean | undefined) ?? true;
				const maxRows = (options.maxRows as number | undefined) ?? 1000;
				const actorPath = tool.actor.replace('/', '~');

				const started = await call(
					'POST',
					`/acts/${actorPath}/runs`,
					{ maxTotalChargeUsd: maxCostUsd, waitForFinish: waitForResults ? Math.min(60, Math.ceil(timeoutMs / 1000)) : 0 },
					input as IDataObject,
				);
				let run = started.data as unknown as ApifyRun;
				const consoleUrl = `https://console.apify.com/view/runs/${run.id}`;

				if (!waitForResults) {
					out.push({
						json: { runId: run.id, status: run.status, datasetId: run.defaultDatasetId, consoleUrl, tool: tool.key },
						pairedItem: { item: i },
					});
					continue;
				}

				const deadline = Date.now() + timeoutMs;
				while (!TERMINAL.includes(run.status) && Date.now() < deadline) {
					const left = Math.max(1, Math.min(60, Math.floor((deadline - Date.now()) / 1000)));
					run = (await call('GET', `/actor-runs/${run.id}`, { waitForFinish: left })).data as unknown as ApifyRun;
				}
				if (!TERMINAL.includes(run.status)) {
					throw new NodeOperationError(
						this.getNode(),
						`${tool.title} is still running after ${Math.round(timeoutMs / 1000)} s (run ${run.id}). It keeps going on Apify: ${consoleUrl}. Raise "Timeout (Seconds)" or turn off "Wait for Results" for big jobs.`,
						{ itemIndex: i },
					);
				}
				if (run.status !== 'SUCCEEDED') {
					throw new NodeOperationError(
						this.getNode(),
						`${tool.title} run ${run.status.toLowerCase()}: ${run.statusMessage || 'no message'} (${consoleUrl})`,
						{ itemIndex: i },
					);
				}

				const qs: IDataObject = { clean: true, format: 'json' };
				if (maxRows > 0) qs.limit = maxRows;
				const rows = (await this.helpers.httpRequestWithAuthentication.call(this, 'pandapiApi', {
					method: 'GET',
					url: `${API}/datasets/${run.defaultDatasetId}/items`,
					qs,
					json: true,
				})) as IDataObject[];

				if (!Array.isArray(rows) || rows.length === 0) {
					out.push({
						json: { noResults: true, tool: tool.key, runId: run.id, statusMessage: run.statusMessage || '', consoleUrl },
						pairedItem: { item: i },
					});
					continue;
				}
				for (const row of rows) out.push({ json: row, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}
		return [out];
	}
}
