import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NumberHelperClient, AggregateRequest, AggregateResponse, NumberHelperHealthResponse } from '../services/NumberHelperClient';

interface HttpRequest<T> extends Request {
	body: T;
}

interface HttpErrorResponse {
	message: string;
}

interface HttpResponse<T> extends Response {
	json: (body: T | HttpErrorResponse) => this;
}

export const buildNumberRouter = (client: NumberHelperClient): Router => {
	const router = Router();

	router.get('/health', async (_req: Request, res: HttpResponse<NumberHelperHealthResponse>, next: NextFunction) => {
		try {
			const status = await client.health();
			res.status(StatusCodes.OK).json(status);
		} catch (error) {
			next(error);
		}
	});

	router.post(
		'/aggregate',
		async (
			req: HttpRequest<AggregateRequest>,
			res: HttpResponse<AggregateResponse>,
			next: NextFunction,
		) => {
			try {
				const numbers = Array.isArray(req.body?.numbers)
					? req.body.numbers
					: [];
				if (!numbers.length) {
					res.status(StatusCodes.BAD_REQUEST).json({ message: 'numbers array is required' });
					return;
				}
				const invalidValue = numbers.find((value) => typeof value !== 'number');
				if (typeof invalidValue !== 'undefined') {
					res
						.status(StatusCodes.BAD_REQUEST)
						.json({ message: 'numbers array must contain only numbers' });
					return;
				}

				const result = await client.aggregate({ numbers });
				res.status(StatusCodes.OK).json(result);
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
};
