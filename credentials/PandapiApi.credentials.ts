import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PandapiApi implements ICredentialType {
	name = 'pandapiApi';

	displayName = 'Pandapi (Apify) API';

	icon: Icon = { light: 'file:../icons/pandapi.svg', dark: 'file:../icons/pandapi.dark.svg' };

	documentationUrl = 'https://github.com/rabroubx-coder/n8n-nodes-pandapi#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Apify API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your own Apify API token (free account): https://console.apify.com/settings/integrations. Pandapi tools run on your Apify account and are billed per result from its free monthly credit first.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.apify.com/v2',
			url: '/users/me',
			method: 'GET',
		},
	};
}
