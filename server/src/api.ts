import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
import { auth } from './firebase';

export const app = express();

////// Middleware //////

// Allows cross origin requests
app.use(cors({ origin: true }));

// sets rawBody for webhook handling
app.use(express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
})
);

// Decodes the Firebase JSON Web Token
app.use(decodeJWT)


/**
 * Handle api endpoint for checkout
 */

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
 * Decodes the JSON Web Token sent via the frontend app
 * Makes the currentUser (firebase) data available on the body
 */
async function decodeJWT(req: Request, res: Response, next: NextFunction) {
    // Look to see if the headers: Auth starts with bearer
    if (req.headers?.authorization?.startsWith('Bearer')) {
        // Split the token off the string
        const idToken = req.headers?.authorization?.startsWith('Bearer')[1];
        try {

            const decodedToken = await auth.verifyIdToken(idToken);
            // Add the user to the request
            req['currentUser'] = decodedToken;
        } catch (err) {
            console.error(`Auth Error: ${err}`)
        }
    }
    // Call next() so express knows to move on to the next step in the process
    next();
}

/**
 * Throws an error if the currentUser does not exist on the Request
 */
function validateUser(req: Request){
    const user = req['currentUser'];
    if (!user){
        throw new Error('You must be logged in to make this request.')
    }
    return user;
}

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
