import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NumberHelperClient } from '../services/NumberHelperClient';

export const buildNumberRouter = (client: NumberHelperClient): Router => {
	const router = Router();

	router.get('/health', async (_req, res, next) => {
		try {
			const status = await client.health();
			res.status(StatusCodes.OK).json(status);
		} catch (error) {
			next(error);
		}
	});

	router.post('/aggregate', async (req, res, next) => {
		try {
			const numbers = Array.isArray(req.body?.numbers)
				? (req.body.numbers as number[])
				: [];
			if (!numbers.length) {
				res.status(StatusCodes.BAD_REQUEST).json({ message: 'numbers array is required' });
				return;
			}
			const invalidValue = numbers.find((value) => typeof value !== 'number');
			if (typeof invalidValue !== 'undefined') {
				res.status(StatusCodes.BAD_REQUEST).json({ message: 'numbers array must contain only numbers' });
				return;
			}

			const result = await client.aggregate({ numbers });
			res.status(StatusCodes.OK).json(result);
		} catch (error) {
			next(error);
		}
	});

	return router;
};
