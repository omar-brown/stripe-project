import { stripe } from "./";
import { db } from './firebase';
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customers";
import { firestore } from "firebase-admin";

/**
 * Attaches a payment method to the Stripe Customer,
 * subscribes to a Stripe plan, and saves the plan to Firestore
 */
export async function createSubscription(
    userId: string,
    priceId: string,
    payment_method: string
) {
    const customer = await getOrCreateCustomer(userId);

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(payment_method, { customer: customer.id });

    // Set it as the default payment method
    await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: payment_method }
    })

    // Create a new subscription
    const subscription: Stripe.Subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{price: priceId}],
        // Tells stripe to include the full payment intent in its response
        expand: ['latest_invoice.payment_intent']
    });

    // By default, the invoice and payment intent are not strongly typed
    // we can enforce types by casting them using 'as' keyword
    const invoice = subscription.latest_invoice as Stripe.Invoice;

    // When stripe creates this subscription, it creates the first invoice and
    // attempts to pay for that invoice using the customers card
    const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;


    // Update the user's status
    if (payment_intent.status === 'succeeded') {
        const userData = {
            stripeCustomerId: customer.id,
            activePlans: firestore.FieldValue.arrayUnion(priceId),
        }
        // Write user data to db using non-destructive write
        await db
            .collection('users')
            .doc(userId)
            .set(userData, { merge: true })
    }

    return subscription
}

/**
 * Cancel an active subscription, syncs data in Firestore
 */
export async function cancelSubscription(userId: string, subscriptionId: string) {
    const customer = await getOrCreateCustomer(userId);
    // Check that customer's metadata firebaseUID equals the userId
    // Extra validation to ensure a user can't cancel another user's subscription
    if(customer.metadata.firebaseUID !== userId){
        throw Error('Firebase UID does not match Stripe Customer');
    }
    // Option 1: Cancel Immediately
    const subscription = await stripe.subscriptions.del(subscriptionId);

    // Option 2:Cancel at end of period
    // const subscription = await stripe.subscriptions.update(subscriptionId, {cancel_at_period_end: true});
    // Set up webhook to listen to event when it is deleted

    const priceIds = subscription.items.data.map((el) => el.price.id);
    if(subscription.status === 'canceled'){
        await db
        .collection('users')
        .doc(userId)
        .update({
            activePlans: firestore.FieldValue.arrayRemove(...priceIds)
        })
    }
    return subscription;
}

/**
 * Returns all the subscriptions linked to a Firebase userId in Stripe
 */
export async function listSubscriptions(userId:string) {
    const customer = await getOrCreateCustomer(userId);
    const subscriptions = await stripe.subscriptions.list({
        customer: customer.id
    });
    return subscriptions;
}