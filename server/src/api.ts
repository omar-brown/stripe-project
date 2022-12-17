import express, { NextFunction, Request, Response } from 'express';
export const app = express();

// Middleware
app.use(express.json());

import cors from 'cors';
app.use(cors({ origin: true }));


/**
 * Handle api endpoint for checkout
 */
import { createStripeCheckoutSession } from './checkout';

app.post(
    '/checkouts', runAsync(async ({ body }: Request, res: Response) => {
        res.send(
            //Await result of helper function, pass line items from body
            await createStripeCheckoutSession(body.line_items)
        )
    })
)

/**
 * Catch async errors when awaiting promises
 * Express doesn't normally handle async errors, and will just cause the UI to hang
 * This function will help handle errors more gracefully
 */

function runAsync(callback: Function) {
    console.log(callback)
    return (req: Request, res: Response, next: NextFunction) => {
        callback(req, res, next).catch(next)
    }
}