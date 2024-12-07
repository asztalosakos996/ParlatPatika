import React, { useState } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ onNext, onBack, selectedMethod }) => {

    const paymentPrices = {
        'Bankkártya': 0,
        'Utánvét': 490,
    }

    const [method, setMethod] = useState(selectedMethod || '');

    const handleChange = (e) => {
        setMethod(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const paymentPrice = paymentPrices[method]; // Fizetési ár meghatározása
    
        onNext({
            method,
            price: paymentPrice,
        });
    };
    
    

    return (
        <form onSubmit={handleSubmit} className="payment-method-container">
            <h2>Fizetési mód kiválasztása</h2>
            <label>
                <input type="radio" value="Bankkártya" checked={method === 'Bankkártya'} onChange={handleChange} />
                Bankkártya - ingyenes
            </label>
            <label>
                <input type="radio" value="Utánvét" checked={method === 'Utánvét'} onChange={handleChange} />
                Utánvét - {paymentPrices['Utánvét']} Ft
            </label>
            <div className="payment-buttons">
                <button type="button" className="back-button" onClick={onBack}>Vissza</button>
                <button type="submit">Tovább</button>
            </div>
        </form>
    );
};

export default PaymentMethod;