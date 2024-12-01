import React, { useState, useContext, useEffect } from 'react';
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

    // Szállítási és fizetési költségek
    const shippingCosts = {
        futarszolgalat: 1490,
        csomagpont: 990,
    };

    const paymentCosts = {
        bankkártya: 0,
        utánvét: 490,
    };

    const [step, setStep] = useState(1); // Lépés állapot
    const [loadingUserData, setLoadingUserData] = useState(false); // Felhasználói adatok betöltése állapot
    const [orderData, setOrderData] = useState({
        userId: currentUser ? currentUser._id : null,
        contactInfo: {},
        shippingMethod: '',
        paymentMethod: '',
        shippingCost: 0,
        paymentCost: 0,
        items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: totalAmount,
    });

    // Felhasználói adatok betöltése
    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;

            try {
                setLoadingUserData(true);
                const response = await fetch('http://localhost:5000/api/auth/details', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setOrderData((prev) => ({
                        ...prev,
                        contactInfo: {
                            email: userData.email || '',
                            name: userData.name || '',
                            phone: userData.phone || '',
                            address: userData.address?.street || '',
                            city: userData.address?.city || '',
                            postalCode: userData.address?.postalCode || '',
                        },
                    }));
                }
            } catch (error) {
                console.error('Hiba a felhasználói adatok betöltésekor:', error);
            } finally {
                setLoadingUserData(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleNextStep = async (newData) => {
        const updatedItems = await Promise.all(
            cart.map(async (item) => {
                const response = await fetch(`http://localhost:5000/api/products/${item._id}`);
                const productData = await response.json();
                return {
                    product: item._id,
                    name: productData.name,
                    quantity: item.quantity,
                    price: item.price,
                };
            })
        );

        const shippingCost = shippingCosts[newData.shippingMethod] || 0;
        const paymentCost = paymentCosts[newData.paymentMethod] || 0;

        setOrderData((prevData) => ({
            ...prevData,
            ...newData,
            items: updatedItems,
            shippingCost,
            paymentCost,
            totalAmount: totalAmount + shippingCost + paymentCost,
        }));

        setStep((prevStep) => prevStep + 1);
    };

    const handlePrevStep = () => {
        setStep((prevStep) => prevStep - 1);
    };

    if (loadingUserData) {
        return <div>Felhasználói adatok betöltése...</div>;
    }

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
