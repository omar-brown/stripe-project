import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';

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
    function Customers() {
        return (
            <SignIn />
        )
    }

    export default Customers;