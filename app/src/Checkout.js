import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";

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
    return (
        <>
            <div class="row">
                <div class="col-sm-6">
                    <div class="card">
                        <img src={product.images[0]} alt="product" class="card-img-top" />
                        <div class="card-body">
                            <h3 class="card-title">{product.name}</h3>
                            <p class="card-text">Stripe Amount: {product.amount}</p>
                            <a href="#" class="btn btn-primary">-</a>
                            <span>{product.quantity}</span>
                            <a href="#" class="btn btn-primary">+</a>
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
            <h1>Failed</h1>
        </>
    )
}
export function CheckoutSuccess() {
    return (
        <>
            <h1>Success</h1>
        </>
    )
}