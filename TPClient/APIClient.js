export default class ApiClient {
	static instance;

	constructor(baseUrl, customHeaders = {}) {
		this.baseUrl = baseUrl;
		this.customHeaders = customHeaders;
	}

	static getInstance(baseUrl, customHeaders = {}) {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient(baseUrl, customHeaders);
		}
		return ApiClient.instance;
	}

	setCustomHeader(customHeaders) {
		this.customHeaders = { ...this.customHeaders, ...customHeaders };
	}

	async fetchWithToken(url, method, options = {}) {
		const headersWithAuth = {
			...this.customHeaders,
		};

		const requestOptions = {
			method,
			headers: headersWithAuth,
		};

		if (options.data) {
			requestOptions.body = JSON.stringify(options.data);
			headersWithAuth['Content-Type'] = 'application/json';
		}

		if (options.formData) {
			requestOptions.body = options.formData;
		}

		const response = await fetch(`${this.baseUrl}${url}`, requestOptions);

		return response;
	}

	async get(url) {
		const response = await this.fetchWithToken(url, 'GET');
		return this.parseResponse(response);
	}

	async post(url, options = {}) {
		const response = await this.fetchWithToken(url, 'POST', options);
		return this.parseResponse(response);
	}

	async delete(url, options = {}) {
		const response = await this.fetchWithToken(url, 'DELETE', options);
		return this.parseResponse(response);
	}

	async parseResponse(response) {
		if (response.ok) {
			const contentType = response.headers.get('Content-Type');

			if (contentType && contentType.includes('application/json')) {
				return await response.json();
			}

			if (contentType && contentType.includes('text/plain')) {
				return await response.text();
			}

			if (contentType && contentType.includes('text/csv')) {
				return await response.blob();
			}

			throw new Error(`Unsupported content type: ${contentType}`);
		} else {
			let error;

			try {
				error = await response.json();
			} catch {
				throw new Error(`Request failed: ${response.status}`);
			}

			throw new Error(
				error.error || `Request failed: ${response.status} - ${error.detail}`,
			);
		}
	}
}
