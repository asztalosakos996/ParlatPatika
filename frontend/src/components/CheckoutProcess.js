import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ContactInfo from './ContactInfo';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import ReviewOrder from './ReviewOrder';
import './CheckoutProcess.css';

const CheckoutProcess = () => {
    const { currentUser } = useContext(AuthContext);
    const { cart, totalAmount } = useCart();

    const [step, setStep] = useState(1);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [orderData, setOrderData] = useState({
        user: currentUser ? currentUser._id : null,
        contactInfo: {
            email: '',
            name: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
        },
        shippingMethod: '',
        paymentMethod: '',
        items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: 0,
    });

    // Felhasználói adatok betöltése, ha a felhasználó be van jelentkezve
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
                    setOrderData((prevData) => ({
                        ...prevData,
                        contactInfo: {
                            email: userData.email || '',
                            name: userData.name || '',
                            address: userData.address?.street || '',
                            city: userData.address?.city || '',
                            postalCode: userData.address?.postalCode || '',
                            phone: userData.phone || '',
                        },
                    }));
                } else {
                    console.error('Felhasználói adatok betöltése sikertelen.');
                }
            } catch (error) {
                console.error('Hiba történt a felhasználói adatok betöltésekor:', error);
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

        setOrderData((prevData) => ({
            ...prevData,
            ...newData,
            user: currentUser ? currentUser._id : null,
            items: updatedItems,
            totalAmount: totalAmount,
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
