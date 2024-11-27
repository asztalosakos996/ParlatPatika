import React, { useState } from 'react';
import './NewCoupon.css';

const NewCoupon = () => {
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed'); // Alapértelmezett érték
    const [expirationDate, setExpirationDate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, discount, discountType, expirationDate }),
            });
            if (response.ok) {
                setSuccessMessage('Kupon sikeresen létrehozva!');
                setErrorMessage('');
                setCode('');
                setDiscount(0);
                setDiscountType('fixed');
                setExpirationDate('');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Hiba történt a kupon létrehozásakor.');
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('Hiba történt a kupon létrehozásakor.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="new-coupon-form">
            <h2>Új Kupon Létrehozása</h2>
            <form onSubmit={handleSubmit}>
                <label>Kuponkód:</label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Írd be a kuponkódot"
                />
                <label>Kedvezmény:</label>
                <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    required
                    placeholder="Írd be a kedvezmény mértékét"
                />
                <label>Kedvezmény típusa:</label>
                <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    required
                >
                    <option value="fixed">Fix összeg</option>
                    <option value="percentage">Százalékos</option>
                </select>
                <label>Lejárati dátum:</label>
                <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    required
                />
                <button type="submit">Kupon létrehozása</button>
            </form>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default NewCoupon;
