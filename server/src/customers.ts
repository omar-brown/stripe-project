import { stripe } from "./";;
import { db } from "./firebase";
import Stripe from "stripe";

/**
 * Gets the existing Stripe customer or creates a new record
 */
export async function getOrCreateCustomer(userId: string, params?: Stripe.CustomerCreateParams) {
    // Pull the firestore document and check for a stripe customer id
    const userSnapshot = await db.collection('users').doc(userId).get();
    const { stripeCustomerId, email } = userSnapshot.data();

    // If missing customerID, create it
    if (!stripeCustomerId) {
        // Include the firebase uid in the customer's metadata to link everything up
        const customer = await stripe.customers.create({
            email,
            metadata: {
                firebaseUID: userId
            },
            ...params
        });
        // Update firestore with stripeCustomerId
        await userSnapshot.ref.update({ stripeCustomerId: customer.id });
        return customer;
    } else {
        // If the customer does exist, retrieve it from stripe and return it
        return await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer
    }
}

/**
 * Creates a SetupIntent used to save a credit card for later use
 */
export async function createSetupIntent(userId: string) {
    // Get stripe customer using userId
    const customer = await getOrCreateCustomer(userId);
    return stripe.setupIntents.create({ customer: customer.id })
}

/**
 * Returns all payment sources associated to the user
 */
export async function listPaymentMethodes(userId: string) {
    const customer = await getOrCreateCustomer(userId);
    return stripe.paymentMethods.list({ customer: customer.id, type: 'card' });
}