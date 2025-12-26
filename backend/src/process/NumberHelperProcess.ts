import { ChildProcess, spawn } from 'node:child_process';

export interface NumberHelperProcessOptions {
	pythonCommand: string;
	scriptPath: string;
	host: string;
	port: number;
}

export class NumberHelperProcess {
	private child?: ChildProcess;

	constructor(private readonly options: NumberHelperProcessOptions) { }

	start(): void {
		if (this.child) {
			return;
		}

		const args = [
			this.options.scriptPath,
			'--host',
			this.options.host,
			'--port',
			this.options.port.toString(),
		];

		this.child = spawn(this.options.pythonCommand, args, {
			env: {
				...process.env,
			},
			stdio: 'inherit',
		});

		this.child.on('exit', (code, signal) => {
			console.info('[NumberHelperProcess] exited', { code, signal });
			this.child = undefined;
		});

		this.child.on('error', (error) => {
			console.error('[NumberHelperProcess] failed to start helper', error);
		});
	}

	async stop(signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
		if (!this.child) {
			return;
		}

		return new Promise((resolve) => {
			const childRef = this.child;
			if (!childRef) {
				resolve();
				return;
			}
			childRef.once('exit', () => resolve());
			childRef.kill(signal);
			setTimeout(() => {
				if (!childRef.killed) {
					childRef.kill('SIGKILL');
				}
			}, 5000);
			this.child = undefined;
		});
	}
}
