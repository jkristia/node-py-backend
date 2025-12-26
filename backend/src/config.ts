import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

export type AppConfig = {
	port: number;
	host: string;
	helper: {
		host: string;
		port: number;
		healthPath: string;
		pythonCommand: string;
		scriptPath: string;
		readinessTimeoutMs: number;
		readinessPollIntervalMs: number;
	};
};

const parseNumber = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const resolvePythonCommand = (): string => {
	if (process.env.PYTHON_CMD) {
		return process.env.PYTHON_CMD;
	}

	const repoRoot = path.resolve(process.cwd(), '..');
	const venvPython = path.join(repoRoot, '.venv', 'bin', 'python');
	if (fs.existsSync(venvPython)) {
		return venvPython;
	}

	return 'python3';
};

export const loadConfig = (): AppConfig => {
	const backendHost = process.env.HOST ?? '0.0.0.0';
	const backendPort = parseNumber(process.env.PORT, 3000);
	const helperHost = process.env.NUMBER_HELPER_HOST ?? '127.0.0.1';
	const helperPort = parseNumber(process.env.NUMBER_HELPER_PORT, 8001);
	const helperScript =
		process.env.NUMBER_HELPER_SCRIPT ??
		path.resolve(process.cwd(), '..', 'numberhelper', 'src', 'number_helper_service.py');

	return {
		port: backendPort,
		host: backendHost,
		helper: {
			host: helperHost,
			port: helperPort,
			healthPath: process.env.NUMBER_HELPER_HEALTH_PATH ?? '/health',
			pythonCommand: resolvePythonCommand(),
			scriptPath: helperScript,
			readinessTimeoutMs: parseNumber(process.env.NUMBER_HELPER_READY_TIMEOUT_MS, 15_000),
			readinessPollIntervalMs: parseNumber(process.env.NUMBER_HELPER_READY_POLL_MS, 500),
		},
	};
};
