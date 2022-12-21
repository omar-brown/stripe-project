import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useSigninCheck, useUser } from 'reactfire';
import { fetchFromAPI } from './helpers';
import { useEffect, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

function SignIn() {
    const provider = new GoogleAuthProvider();
    const signIn = async () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                const credential = GoogleAuthProvider.credentialFromResult(res);
                const { uid, email } = res.user;
                setDoc(doc(db, "users", uid), {
                    email
                }, { merge: true })
            }).catch((error) => {
                console.error(`Error Code: ${error.code} Error Msg: ${error.message}`)
            })
    }
    return (
        <button onClick={signIn}>Sign in with Google</button>
    )
}
function SignOut(props) {
    return (
        <>
            <p>{props.uid}</p>
            <button onClick={() => auth.signOut()}>
                Sign Out User
            </button>
        </>
    )
}
function SaveCard(props) {
    return (
        <>

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
    const elements = useElements();
    const [setupIntent, setSetupIntent] = useState();
    const [wallet, setWallet] = useState([]);
    const { status, data: signInCheckResult } = useSigninCheck();
    const user = useUser();
 
    useEffect(() => {
        getWallet();
    }, [user])

    const getWallet = async () => {
        const paymentMethods = await fetchFromAPI('wallet', { method: 'GET' });
        setWallet(paymentMethods);
    }
    const createSetupIntent = async() => {
        const si = await fetchFromAPI('wallet');
        setSetupIntent(si);
    }
    const handleSubmit = async(event) => {
        event.preventDefault();
        const cardEl = elements.getElement(CardElement);
        const {
            setupIntent: updatedSetupIntent,
            error,
        } = await stripe.confirmCardSetup(setupIntent.client_secret, {
            payment_method: {card: cardEl}
        });
        if(error){
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
                <div class="well">
                    <h2>Create a Setup Intent</h2>
                    <button onClick={createSetupIntent}
                     class="btn btn-success"
                     hidden={setupIntent}>Attach A New Credit Card</button>
                </div>
                <hr />
                <form onSubmit={handleSubmit}>
                    <CardElement />
                    <button type="submit">Attach</button>
                </form>

                <div class="well">
                    <h2>Retrieve all Payment Sources</h2>
                    <select className='form-control'>
                      {wallet.map(src => (<CreditCard key={src.id} card={src.card} />))}
                    </select>
                </div>
                <hr />
                <SignOut uid={signInCheckResult.user.uid} />
            </>
        )
    } else {
        return (<SignIn />)
    }
}