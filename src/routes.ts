import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

// define routes that not served to API gateways
export function healthRoutes(): Router {
    router.get('/notifications-health', (_req: Request, res: Response) => {
        res.status(StatusCodes.OK).send('Notifications Server is healthy');
    });
    return router;
}