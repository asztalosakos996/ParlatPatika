import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ContactInfo from './ContactInfo';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import ReviewOrder from './ReviewOrder';
import './CheckoutProcess.css';

const CheckoutProcess = () => {
    const { currentUser } = useContext(AuthContext); // Hozzáférés az aktuális felhasználóhoz
    const { cart, totalAmount } = useCart();

    const [step, setStep] = useState(1);
    const [orderData, setOrderData] = useState({
        userId: currentUser ? currentUser._id : null, // Beállítjuk a currentUser alapján
        contactInfo: {},
        shippingMethod: '',
        paymentMethod: '',
        items: cart.map((item) => ({
            product: item._id, // Csak az `id`-t küldd el
            quantity: item.quantity,
            price: item.price,
        })), // Kosár tartalma
        totalAmount: 0, // Teljes ár
    });

    const handleNextStep = async (newData) => {
        const updatedItems = await Promise.all(
            cart.map(async (item) => {
                const response = await fetch(`http://localhost:5000/api/products/${item._id}`);
                const productData = await response.json();
                return {
                    product: item._id, // Termék ID
                    name: productData.name, // Termék neve
                    quantity: item.quantity,
                    price: item.price,
                };
            })
        );
    
        setOrderData((prevData) => ({
            ...prevData,
            ...newData,
            items: updatedItems,
            totalAmount: totalAmount,
        }));
        setStep((prevStep) => prevStep + 1);
    };
    

    const handlePrevStep = () => {
        setStep((prevStep) => prevStep - 1);
    };

    return (
        <div className="checkout-process">
            <div className="progress-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Adatok Megadása</div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Szállítási mód</div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Fizetési mód</div>
                <div className={`step ${step === 4 ? 'active' : ''}`}>4. Rendelés ellenőrzése</div>
            </div>
    
            {step === 1 && (
                <ContactInfo
                    onNext={(data) => handleNextStep({ contactInfo: data })}
                    initialData={orderData.contactInfo}
                />
            )}
            {step === 2 && (
                <ShippingMethod
                    selectedMethod={orderData.shippingMethod}
                    onNext={(data) => handleNextStep({ shippingMethod: data })}
                    onBack={handlePrevStep}
                    billingData={orderData.contactInfo}
                />
            )}
            {step === 3 && (
                <PaymentMethod
                    selectedMethod={orderData.paymentMethod}
                    onNext={(data) => handleNextStep({ paymentMethod: data })}
                    onBack={handlePrevStep}
                />
            )}
            {step === 4 && <ReviewOrder orderData={orderData} onBack={handlePrevStep} />}
        </div>
    );
};

export default CheckoutProcess;
