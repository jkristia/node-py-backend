import axios, { AxiosInstance } from 'axios';

export interface AggregateRequest {
	numbers: number[];
}

export interface AggregateResponse {
	count: number;
	sum: number;
	mean: number;
	median: number;
	min: number;
	max: number;
}

export interface NumberHelperHealthResponse {
	status: string;
	uptime_seconds: number;
}

export class NumberHelperClient {
	private readonly http: AxiosInstance;

	constructor(baseURL: string, timeoutMs: number) {
		this.http = axios.create({
			baseURL,
			timeout: timeoutMs,
		});
	}

	async health(): Promise<NumberHelperHealthResponse> {
		const { data } = await this.http.get<NumberHelperHealthResponse>('/health');
		return data;
	}

	async aggregate(payload: AggregateRequest): Promise<AggregateResponse> {
		const { data } = await this.http.post<AggregateResponse>('/aggregate', payload);
		return data;
	}

	async waitUntilHealthy(timeoutMs: number, intervalMs: number): Promise<void> {
		const startedAt = Date.now();
		// simple polling loop to wait for FastAPI readiness
		while (Date.now() - startedAt < timeoutMs) {
			try {
				await this.health();
				return;
			} catch (error) {
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
			}
		}
		throw new Error('Timed out waiting for NumberHelper to become healthy');
	}
}
