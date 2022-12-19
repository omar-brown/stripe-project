import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Load stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(
  'pk_test_4nOfTg0Oc6U0lpCTW7TwFJGk' 
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Makes stripe available globally */}
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);

