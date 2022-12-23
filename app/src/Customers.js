import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useSigninCheck, useUser } from 'reactfire';
import { fetchFromAPI } from './helpers';
import { useEffect, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

export function SignIn() {
    const provider = new GoogleAuthProvider();
    const signIn = async () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                GoogleAuthProvider.credentialFromResult(res);
                const { uid, email } = res.user;
                setDoc(doc(db, "users", uid), {
                    email
                }, { merge: true })
            }).catch((error) => {
                console.error(`Error Code: ${error.code} Error Msg: ${error.message}`)
            })
    }
    return (
        <button className='btn btn-primary' onClick={signIn}>Sign in with Google</button>
    )
}
export function SignOut(props) {
    return (
        <>
            <p>{props.uid}</p>
            <button className='btn btn-outline-secondary' onClick={() => auth.signOut()}>
                Sign Out User
            </button>
        </>
    )
}

function CreditCard(props) {
    const { last4, brand, exp_month, exp_year } = props.card;
    return (
        <option>
            {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
        </option>
    )
}

export function Customers() {
    const stripe = useStripe();
    const { status, data: signInCheckResult } = useSigninCheck();
    const user = useUser();
    const elements = useElements();
    const [setupIntent, setSetupIntent] = useState();
    const [wallet, setWallet] = useState([]);

    useEffect(() => {
        getWallet()
    }, [user]);

    const getWallet = async () => {
        const paymentMethods = await fetchFromAPI('wallet', { method: 'GET' });
        setWallet(paymentMethods);
    }

    const createSetupIntent = async () => {
        const si = await fetchFromAPI('wallet');
        setSetupIntent(si);
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        const cardEl = elements.getElement(CardElement);
        const {
            setupIntent: updatedSetupIntent,
            error,
        } = await stripe.confirmCardSetup(setupIntent.client_secret, {
            payment_method: { card: cardEl }
        });
        if (error) {
            alert(error.message);
            console.error(error);
        } else {
            setSetupIntent(updatedSetupIntent);
            await getWallet();
            alert('Success! Card added to your wallet!')
        }
    }
    if (status === 'loading') {
        return <span>loading...</span>
    }
    if (signInCheckResult.signedIn === true) {

        return (
            <>
                <h2>Customers</h2>
                <p>
                    Save credit card details for future use.
                    Connect a Stripe Customer Id to a Firebase user id
                </p>

                <div class="well">
                    <h2>Create a Setup Intent</h2>
                    <button onClick={createSetupIntent}
                        class="btn btn-success"
                        hidden={setupIntent}>Attach A New Credit Card</button>
                </div>
                <hr />
                <div className='well'>
                    <form onSubmit={handleSubmit}>
                        <CardElement />
                        <button className='btn btn-success btn-sm'type="submit">Attach</button>
                    </form>
                </div>
                <div className="well">
                    <h2>Retrieve all Payment Sources</h2>
                    <select className='form-control'>
                        {wallet.map(src => (<CreditCard key={src.id} card={src.card} />))}
                    </select>
                </div>
                <hr />
                <div className='well'>
                <SignOut uid={signInCheckResult.user.uid} />
                </div>
            </>
        )
    } else {
        return (<SignIn />)
    }
}