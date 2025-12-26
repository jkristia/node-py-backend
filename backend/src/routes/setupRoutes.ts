import express, { Express, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NumberHelperClient, NumberHelperHealthResponse } from '../services/NumberHelperClient';
import { buildNumberRouter } from './buildNumberRouter';

export interface BackendHealthResponse {
	status: string;
	helper: NumberHelperHealthResponse;
}

export class Routes {
	constructor(private readonly app: Express, private readonly helperClient: NumberHelperClient) { }

	setup(): void {
		this.registerHealthRoute();
		this.registerNumberRoutes();
		this.registerErrorHandler();
	}

	private registerHealthRoute(): void {
		this.app.get('/health', async (_req, res, next) => {
			try {
				const helper = await this.helperClient.health();
				const response: BackendHealthResponse = {
					status: 'ok',
					helper,
				};
				res.status(StatusCodes.OK).json(response);
			} catch (error) {
				next(error);
			}
		});
	}

	private registerNumberRoutes(): void {
		this.app.use('/numbers', buildNumberRouter(this.helperClient));
	}

	private registerErrorHandler(): void {
		this.app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
			console.error('[Routes] Unhandled error', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
		});
	}
}

export const setupRoutes = (app: Express, helperClient: NumberHelperClient): void => {
	new Routes(app, helperClient).setup();
};
