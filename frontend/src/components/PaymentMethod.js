import React, { useState } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ onNext, onBack, selectedMethod }) => {
    const [method, setMethod] = useState(selectedMethod || '');

    const handleChange = (e) => {
        setMethod(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext(method);
    };

    return (
        <form onSubmit={handleSubmit} className="payment-method-container">
            <h2>Fizetési mód kiválasztása</h2>
            <label>
                <input type="radio" value="Bankkártya" checked={method === 'Bankkártya'} onChange={handleChange} />
                Bankkártya
            </label>
            <label>
                <input type="radio" value="Utánvét" checked={method === 'Utánvét'} onChange={handleChange} />
                Utánvét
            </label>
            <div className="payment-buttons">
                <button type="button" className="back-button" onClick={onBack}>Vissza</button>
                <button type="submit">Tovább</button>
            </div>
        </form>
    );
};

export default PaymentMethod;
