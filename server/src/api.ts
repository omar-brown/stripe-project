import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

export const app = express();

////// Middleware //////


// Allows cross origin requests
app.use(cors({ origin: true }));

// sets rawBody for webhook handling
app.use(express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
})
);

/**
 * Handle api endpoint for checkout
 */
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
app.post(
    '/checkouts', runAsync(async ({ body }: Request, res: Response) => {
        res.send(
            //Await result of helper function, pass line items from body
            await createStripeCheckoutSession(body.line_items)
        )
    })
)

/**
 * Payment Intents API
 */

// Create a PaymentIntent
app.post(
    '/payments', runAsync(async ({ body }: Request, res: Response) => {
        res.send(
            await createPaymentIntent(body.amount)
        )
    })
)

/**
 * Handle Webhooks
 */
app.post('/hooks', runAsync(handleStripeWebhook));

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
