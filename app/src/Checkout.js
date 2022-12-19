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
            <div class="row">
                <div class="col-sm-6">
                    <div class="card">
                        <img src={product.images[0]} alt="product" class="card-img-top" />
                        <div class="card-body">
                            <h3 class="card-title">{product.name}</h3>
                            <p class="card-text">Stripe Amount: {product.amount}</p>
                            <div class="container">
                                <button class="btn btn-primary" onClick={() => changeQuantity(-1)}>-</button>
                                <span>{product.quantity}</span>
                                <button class="btn btn-primary" onClick={() => changeQuantity(1)}>+</button>
                            </div>
                            <button
                                onClick={handleClick}
                                disabled={product.quantity < 1}
                                class="btn btn-primary">
                                Start Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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