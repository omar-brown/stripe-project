import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import {fetchFromAPI} from './helpers'

export function Checkout() {
    const stripe = useStripe();
    const [product, setProduct] = useState({
        name: 'Hat',
        description: 'A hat',
        images: ['https://images.pexels.com/photos/9136194/pexels-photo-9136194.jpeg'],
        amount: 799,
        currency: 'usd',
        quantity: 0,
    });
    const changeQuantity = (val) => setProduct(
        { ...product, quantity: Math.max(0, product.quantity + val) }
    )
    const handleClick = async (event) => {
        const body = { line_items: [product] }
        const { id: sessionId } = await fetchFromAPI('checkouts', { body });
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
            console.log(error);
        }
    }
    return (
        <>
         <h2>Stripe Checkout</h2>
      <p>
        Shopping-cart scenario. Change the quantity
        of the products below, then click checkout to open the Stripe Checkout
        window.
      </p>

      <div className="product">
        <h3>{product.name}</h3>
        <h4>Stripe Amount: {product.amount}</h4>

        <img src={product.images[0]} width="250px" alt="product" />

        <button
          className="btn btn-sm btn-warning"
          onClick={() => changeQuantity(-1)}>
          -
        </button>
        <span style={{ margin: '20px', fontSize: '2em' }}>
          {product.quantity}
        </span>
        <button
          className="btn btn-sm btn-success"
          onClick={() => changeQuantity(1)}>
          +
        </button>
      </div>

      <hr />

      <button
        className="btn btn-primary"
        onClick={handleClick}
        disabled={product.quantity < 1}>
        Start Checkout
      </button>
    </>
    )
}

export function CheckoutFail() {
    return (
        <>
            <h1>Checkout Failed 😭</h1>
        </>
    )
}
export function CheckoutSuccess() {
    const url = window.location.href;
    const sessionId = new URL(url).searchParams.get('session_id')
    return (
        <>
            <h1>Success! {sessionId} </h1>
        </>
    )
}