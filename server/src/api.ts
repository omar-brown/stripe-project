import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
import { auth } from './firebase';
import { createSetupIntent, listPaymentMethodes as listPaymentMethods } from './customers';
import { cancelSubscription, createSubscription, listSubscriptions } from './billing';

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
        const idToken = req.headers?.authorization?.split('Bearer ')[1];
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
 * Customer and Setup Intents
 */

// Save a card on the customer record with a SetupIntent
app.post('/wallet', runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const setupIntent = await createSetupIntent(user.uid);
    res.send(setupIntent);
}))

// Retrieve all cards attached to the customer
app.get('/wallet', runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const wallet = await listPaymentMethods(user.uid);
    res.send(wallet.data);
}))

/**
 * Throws an error if the currentUser does not exist on the Request
 */
function validateUser(req: Request) {
    const user = req['currentUser'];
    if (!user) {
        throw new Error('You must be logged in to make this request.')
    }
    return user;
}

/**
 * Billing and Recurring Subscriptions
 */

// Create and charge new subscription
app.post('/subscriptions/', runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = createSubscription(user.uid, plan, payment_method);
    res.send(subscription);
}))

// Get all subscriptions for a customer
app.get('/subscriptions/', runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const subscriptions = await listSubscriptions(user.uid);
    res.send(subscriptions.data)
}))

// Unsubscribe or cancel a subscription
app.patch('/subscriptions/:id', runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    res.send(await cancelSubscription(user.uid, req.params.id));
}))

/**
 * Catch async errors when awaiting promises
 * Express doesn't normally handle async errors, and will just cause the UI to hang
 * This function will help handle errors more gracefully
 */
function runAsync(callback: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        callback(req, res, next).catch(next)
    }
}
