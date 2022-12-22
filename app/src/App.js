import React from 'react';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { Checkout, CheckoutSuccess, CheckoutFail } from './Checkout';
import Payments from './Payments';
import {Customers} from './Customers';
import Subscriptions from './Subscriptions';
import { auth } from './firebase';
import { AuthProvider } from 'reactfire';

function App() {
  
  return (
    <AuthProvider sdk={auth}>
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg bg-dark">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/checkout">
                <span aria-label="emoji" role="img">
                  🛒
                </span>{' '}
                Checkout
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/payments">
                <span aria-label="emoji" role="img">
                  💸
                </span>{' '}
                Payments
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/customers">
                <span aria-label="emoji" role="img">
                  🧑🏿‍🤝‍🧑🏻
                </span>{' '}
                Customers
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/subscriptions">
                <span aria-label="emoji" role="img">
                  🔄
                </span>{' '}
                Subscriptions
              </Link>
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/success" element={<CheckoutSuccess />} />
            <Route path="/failed" element={<CheckoutFail />} />
            <Route path="/" element={<Home />} />
            </Routes>
        </main>
      </div>
    </Router>
    </AuthProvider>
  );
}

export function Home() {
  return (
    <>
      <h2>Stripe React + Node.js</h2>
    </>
  );
}

export default App;