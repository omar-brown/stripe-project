import { stripe } from '.';
import Stripe from 'stripe';


/**
 * Business logic for specific webhook event types
 */
const webhookHandlers = {
    'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {
        // Logic goes here
    },
    'payment_intent.payment_failed': async (data: Stripe.PaymentIntent) => {
        // Logic goes here
    }
}
/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
export const handleStripeWebhook = async (req, res) => {
    // Get the signature from the request's headers
    const sig = req.headers['stripe-signature'];
    // Get the rawBody property we assigned to our req in middleware config
    const rawBody = req['rawBody'];
    // Get secret from env
    const secret = process.env.STRIPE_WEBHOOKS_SECRET;
    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    try {
        // Call the logic for the event and pass the PI to async function
        await webhookHandlers[event.type](event.data.object);
        res.send({ recieved: true });
    } catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err}`);
    }
}