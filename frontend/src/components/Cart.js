import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateItemQuantity } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const discountedTotal = totalAmount - discount;

    const handleApplyCoupon = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: couponCode, totalAmount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setCouponError(errorData.message);
                setDiscount(0);
                return;
            }

            const data = await response.json();
            setDiscount(data.discount);
            setCouponError('');
        } catch (error) {
            console.error('Hiba történt a kupon érvényesítése során:', error);
            setCouponError('Hiba történt a kupon érvényesítése során.');
            setDiscount(0);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="cart-container">
            <h2 className="cart-title">Kosár</h2>
            <div className="cart-layout">
                <div className="cart-main">
                    {/* Kosár elemek */}
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart-message">
                                <p>A kosár üres.</p>
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <p className="cart-item-price">{item.price.toLocaleString()} Ft / db</p>
                                        <div className="cart-item-quantity">
                                            <button onClick={() => updateItemQuantity(index, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                            <span>{item.quantity} db</span>
                                            <button onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</button>
                                        </div>
                                        <p className="cart-item-total">Összesen: {(item.price * item.quantity).toLocaleString()} Ft</p>
                                    </div>
                                    <button className="cart-item-remove" onClick={() => removeFromCart(index)}>Törlés</button>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Csak akkor jelenítjük meg, ha a kosár nem üres */}
                    {cart.length > 0 && (
                        <>
                            <div className="cart-summary">
                                <h3>Összesen:</h3>
                                <p>{totalAmount.toLocaleString()} Ft</p>
                                {discount > 0 && (
                                    <>
                                        <p className="discount-amount">Kedvezmény: -{discount.toLocaleString()} Ft</p>
                                        <h3>Fizetendő összeg:</h3>
                                        <p>{discountedTotal.toLocaleString()} Ft</p>
                                    </>
                                )}
                                <button className="checkout-button" onClick={handleCheckout}>Tovább a pénztárhoz</button>
                            </div>
                            {/* Kuponkód konténer */}
                            <div className="coupon-card">
                                <h4>Van egy kuponkódod? Ne tartsd magadban!</h4>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Írja be a kuponkódot"
                                />
                                <button className="apply-coupon-button" onClick={handleApplyCoupon}>Érvényesítés</button>
                                {couponError && <p className="error-message">{couponError}</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Cart;
