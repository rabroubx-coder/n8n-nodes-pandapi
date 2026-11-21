export interface PandapiParam {
	type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';
	description: string;
	enum?: string[];
	itemsEnum?: string[];
	itemsType?: string;
	minimum?: number;
	maximum?: number;
	urlList?: boolean;
	actorField?: string;
}

export interface PandapiTool {
	key: string;
	actor: string;
	title: string;
	action: string;
	description: string;
	baseInput: Record<string, unknown>;
	defaults: Record<string, unknown>;
	required: string[];
	anyOf: string[][] | null;
	main: string[];
	params: Record<string, PandapiParam>;
}
