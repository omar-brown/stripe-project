import { stripe } from '.';
import Stripe from 'stripe';
import { db } from './firebase';
import { firestore } from 'firebase-admin';


/**
 * Business logic for specific webhook event types
 */
const webhookHandlers = {
    'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {
        // Logic goes here
    },
    'payment_intent.payment_failed': async (data: Stripe.PaymentIntent) => {
        // Logic goes here
    },
    'customer.subscription.created': async(data: Stripe.Subscription) => {
        const customer = await stripe.customers.retrieve(data.customer as string) as Stripe.Customer;
        const userId = customer.metadata.firebaseUID;
        const userRef = db.collection('users').doc(userId);
        const priceIds = data.items.data.map(el => el.id);
        await userRef.update({
            activePlans: firestore.FieldValue.arrayUnion(priceIds)
        })

    },
    'invoice.payment_succeeded': async(data: Stripe.Invoice) => {
        
    },
    'invoice.payment_failed': async(data: Stripe.Invoice) => {
        const customer = await stripe.customers.retrieve(data.customer as string) as Stripe.Customer;
        const userSnapshot = await db.collection('users').doc(customer.metadata.firebaseUID).get();
        await userSnapshot.ref.update({status: 'PAST_DUE'});
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