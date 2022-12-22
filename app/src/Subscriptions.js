import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from './helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser, useSigninCheck } from 'reactfire';
import { db } from './firebase';
import { SignIn, SignOut } from './Customers';
import { doc, onSnapshot } from 'firebase/firestore';

// // Contains user data as state
function UserData(props) {
    const [data, setData] = useState({});

    // Subscribe to the user's data in Firestore
    useEffect(
        () => {
            const unsubscribe = onSnapshot(doc(db, 'users', props.user.uid), (doc) => {
                setData(doc.data())
            })
            return () => unsubscribe();
        }, [props.user]
    )
    return (
        <pre>
            Stripe Customer ID: {data.stripeCustomerId} <br />
            Subscriptions: {JSON.stringify(data.activePlans || [])}
        </pre>
    )
}
function SubscribeToPlan(props) {
    const stripe = useStripe();
    const elements = useElements();
    const user = useUser();
    const { status, data: signInCheckResult } = useSigninCheck();

    const [priceId, setPriceId] = useState();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current subscriptions on mount
    useEffect(() => {
        getSubscriptions();
    }, [user])

    // Fetch current subscriptions from the API
    const getSubscriptions = async () => {
        if (user) {
            const subs = await fetchFromAPI('subscriptions', { method: 'GET' });
            setSubscriptions(subs);
        }
    }

    // Cancel a subscription
    const cancel = async (id) => {
        setLoading(true);
        await fetchFromAPI('subscriptions/' + id, { method: 'PATCH' });
        alert('canceled!')
        await getSubscriptions();
        setLoading(false)

    }

    const handleSubmit = async (event) => {
        setLoading(true);
        event.preventDefault();
        const cardElement = elements.getElement(CardElement);
        // Create Payment Method
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });
        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }
        const subscription = await fetchFromAPI('subscriptions', {
            body: {
                priceId,
                payment_method: paymentMethod.id,
            }
        });
        // The subscription contains an invoice
        // If the invoice's payment succeeded then you're good
        // otherwise, the payment intent must be confirmed

        const { latest_invoice } = subscription;

        if (latest_invoice.payment_intent) {
            const { client_secret, status } = latest_invoice.payment_intent;
            if (status === 'requires_action') {
                const { error: confirmationError } = await stripe.confirmCardPayment(
                    client_secret
                )
            
            if (confirmationError) {
                console.error(confirmationError);
                alert('unable to confirm card')
                return;
            }
        }
            // Success
            alert('You are subscribed!')
            getSubscriptions()
        }
        setLoading(false);
        setPriceId(null);
    }

    if (status === 'loading') {
        return <span>loading...</span>
    }
    if (signInCheckResult.signedIn === true) {

        return (
            <>
                {subscriptions.map(sub => (
                    <div key={sub.id}>
                        {sub.id}. Next payment of {sub.items.data[0].price.unit_amount} due {' '}
                        {new Date(sub.current_period_end * 1000).toUTCString()}
                        <button
                            onClick={() => cancel(sub.id)}
                            disabled={loading}>
                            Cancel
                        </button>
                    </div>
                ))}
                <hr />
                <div>
                    <button onClick={() => setPriceId('price_1MHXKhEeZnAv92igv1WJRlHI')}>
                        Choose Monthly $30/m
                    </button>
                    <button onClick={() => setPriceId('price_1MHXP8EeZnAv92igZyEHYiYC')}>
                        Choose Quarterly $60/q
                    </button>
                    <p>
                        Selected Plan: <strong>{priceId}</strong>
                    </p>
                </div>
                <form onSubmit={handleSubmit} hidden={!priceId}>
                    <CardElement />
                    <button
                        type="submit"
                        disabled={loading}>
                        Subscribe & Pay
                    </button>
                </form>
                <div>
                    <SignOut uid={signInCheckResult.user.uid} />
                </div>

            </>
        )
    } else {
        return (<SignIn />)
    }

}

export default function Subscriptions() {
    const { status, data: signInCheckResult } = useSigninCheck();
    if(status === 'loading' || undefined){
        return(<p>loading...</p>)
    }
    if(signInCheckResult.signedIn === true){
        return (
            // <Suspense fallback={'loading user'}>
            <>
            <h2>Subscriptions</h2>
            <p>Subscribe a user to a recurring plan, process the payment, and sync with Firestore</p>
            <div className='well'>
                <h2>Firestore Data</h2>
                <p>User's Data in Firestore.</p>
                {signInCheckResult.user.uid && <UserData user={signInCheckResult.user}/>}
            </div>
            <SubscribeToPlan />
            
            </>
            // </Suspense>
    )
}
}