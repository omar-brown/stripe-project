import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyCbbKn7NxP5Mc4_xzV092qwAYmnbIcENiI",
    authDomain: "react-stripe-39c60.firebaseapp.com",
    projectId: "react-stripe-39c60",
    storageBucket: "react-stripe-39c60.appspot.com",
    messagingSenderId: "758829132730",
    appId: "1:758829132730:web:c1cc06cbc98c203102cb83"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app);
  export const auth = getAuth(app);