import React from 'react';
import { useNavigate } from 'react-router-dom';
import './orderSuccess.css';

const OrderSuccess = () => {
    const navigate = useNavigate(); // Navigációs hook

    const handleGoHome = () => {
        navigate('/'); // Navigáció a főoldalra
    };

    return (
        <div className="order-success-container">
            <h1>Sikeres rendelés!</h1>
            <p>Köszönjük a rendelésed! Hamarosan értesítjünk a szállítás részleteiről.</p>
            <button onClick={handleGoHome}>Vissza a főoldalra</button>
        </div>
    );
};

export default OrderSuccess;
