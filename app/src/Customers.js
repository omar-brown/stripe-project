import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useSigninCheck } from 'reactfire';

export function SignIn() {
    const provider = new GoogleAuthProvider();
    const signIn = async () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                const credential = GoogleAuthProvider.credentialFromResult(res);
                //const token = credential.accessToken;
                const { uid, email } = res.user;
                console.log(db)
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
export function SignOut(props) {
    return (
        <>
        <p>{props.uid}</p>
        <button onClick={() => auth.signOut()}>
            Sign Out User
        </button>
        </>
    )
}
function Customers() {
    const { status, data: signInCheckResult } = useSigninCheck();
    if (status === 'loading') {
        return <span>loading...</span>
    }
    if (signInCheckResult.signedIn === true) {
        return (<SignOut uid={signInCheckResult.user.uid}/>)
    } else {
        return(<SignIn />)
    }
}

export default Customers;