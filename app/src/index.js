import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FirebaseAppProvider } from 'reactfire';

// Load stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(
  'pk_test_4nOfTg0Oc6U0lpCTW7TwFJGk'
)

export const firebaseConfig = {
  apiKey: "AIzaSyCbbKn7NxP5Mc4_xzV092qwAYmnbIcENiI",
  authDomain: "react-stripe-39c60.firebaseapp.com",
  projectId: "react-stripe-39c60",
  storageBucket: "react-stripe-39c60.appspot.com",
  messagingSenderId: "758829132730",
  appId: "1:758829132730:web:c1cc06cbc98c203102cb83"
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      {/* Makes stripe available globally */}
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </FirebaseAppProvider>
  </React.StrictMode>
);

