import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyCbbKn7NxP5Mc4_xzV092qwAYmnbIcENiI",
    authDomain: "react-stripe-39c60.firebaseapp.com",
    projectId: "react-stripe-39c60",
    storageBucket: "react-stripe-39c60.appspot.com",
    messagingSenderId: "758829132730",
    appId: "1:758829132730:web:c1cc06cbc98c203102cb83"
  };

  firebase.initializeApp(firebaseConfig);

  export const db = firebase.firestore();
  export const auth = firebase.auth();