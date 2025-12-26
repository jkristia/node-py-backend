import express from 'express';
import http from 'node:http';
import { loadConfig, AppConfig } from './config';
import { NumberHelperProcess } from './process/NumberHelperProcess';
import { setupRoutes } from './routes/setupRoutes';
import { NumberHelperClient } from './services/NumberHelperClient';

class Main {
	private server?: http.Server;
	private readonly app = express();
	private readonly helperClient: NumberHelperClient;
	private readonly helperProcess: NumberHelperProcess;

	constructor(private readonly config: AppConfig) {
		this.helperClient = new NumberHelperClient(
			`http://${config.helper.host}:${config.helper.port}`,
			config.helper.readinessTimeoutMs,
		);
		this.helperProcess = new NumberHelperProcess({
			pythonCommand: config.helper.pythonCommand,
			scriptPath: config.helper.scriptPath,
			host: config.helper.host,
			port: config.helper.port,
		});

		this.setupMiddleware();
		setupRoutes(this.app, this.helperClient);
	}

	async start(): Promise<void> {
		this.helperProcess.start();
		await this.helperClient.waitUntilHealthy(
			this.config.helper.readinessTimeoutMs,
			this.config.helper.readinessPollIntervalMs,
		);

		this.server = this.app.listen(this.config.port, this.config.host, () => {
			console.info(
				`[Main] Backend listening on http://${this.config.host}:${this.config.port} (helper on ${this.config.helper.host}:${this.config.helper.port})`,
			);
		});

		const handleSignal = async (signal: NodeJS.Signals) => {
			console.info('[Main] Shutdown requested by', signal);
			// only send SIGTERM to helper to allow it to cleanup properly
			const helperSignal: NodeJS.Signals = signal === 'SIGINT' ? 'SIGTERM' : signal;
			await this.stop(helperSignal);
			process.exit(0);
		};

		process.on('SIGTERM', handleSignal);
		process.on('SIGINT', handleSignal);
	}

	async stop(signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
		await this.helperProcess.stop(signal);
		if (this.server) {
			await new Promise<void>((resolve, reject) => {
				this.server?.close((error) => (error ? reject(error) : resolve()));
			});
			this.server = undefined;
		}
	}

	private setupMiddleware(): void {
		this.app.use(express.json());
	}
}

const bootstrap = async () => {
	const config = loadConfig();
	const main = new Main(config);
	await main.start();
};

void bootstrap().catch((error) => {
	console.error('[Bootstrap] Failed to start application', error);
	process.exit(1);
});
