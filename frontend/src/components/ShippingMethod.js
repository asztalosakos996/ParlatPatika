import React, { useState, useEffect } from 'react';
import './ShippingMethod.css';

const ShippingMethod = ({ onNext, onBack, selectedMethod, billingData }) => {
    const [method, setMethod] = useState(selectedMethod || '');
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
    });
    const [lockerLocation, setLockerLocation] = useState('');
    const [isLoadingLockers, setIsLoadingLockers] = useState(false);
    const [availableLockers, setAvailableLockers] = useState([]);
    const [useBillingData, setUseBillingData] = useState(false); // Jelölőnégyzet állapota

    const handleChange = (e) => {
        setMethod(e.target.value);
    };

    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleLockerChange = (e) => {
        setLockerLocation(e.target.value);
    };

    const fetchLockers = async () => {
        setIsLoadingLockers(true);
        try {
            const response = await fetch('http://localhost:5000/api/lockers');
            const data = await response.json();
            setAvailableLockers(data);
        } catch (error) {
            console.error('Hiba történt a csomagautomaták lekérésekor:', error);
        } finally {
            setIsLoadingLockers(false);
        }
    };

    const handleUseBillingDataChange = (e) => {
        const isChecked = e.target.checked;
        setUseBillingData(isChecked);

        if (isChecked) {
            setDeliveryDetails(billingData);
        } else {
            setDeliveryDetails({
                name: '',
                address: '',
                city: '',
                postalCode: '',
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (method === 'futarszolgalat') {
            onNext({ shippingMethod: method, deliveryDetails });
        } else if (method === 'csomagpont') {
            onNext({ shippingMethod: method, lockerLocation });
        } else {
            onNext(method);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="shipping-method-container">
            <h2>Szállítási mód kiválasztása</h2>
            <label>
                <input
                    type="radio"
                    value="futarszolgalat"
                    checked={method === 'futarszolgalat'}
                    onChange={handleChange}
                />
                Futárszolgálat (+1490 Ft)
            </label>
            <label>
                <input
                    type="radio"
                    value="csomagpont"
                    checked={method === 'csomagpont'}
                    onChange={(e) => {
                        handleChange(e);
                        if (!availableLockers.length) fetchLockers();
                    }}
                />
                Csomagpont (+990 Ft)
            </label>

            {method === 'futarszolgalat' && (
                <div className="delivery-form">
                    <h3>Szállítási adatok</h3>
                    <label>
                        <input
                            type="checkbox"
                            checked={useBillingData}
                            onChange={handleUseBillingDataChange}
                        />
                        Megegyezik a számlázási adatokkal
                    </label>
                    <label>
                        Név:
                        <input
                            type="text"
                            name="name"
                            value={deliveryDetails.name}
                            onChange={handleDeliveryChange}
                            required
                            disabled={useBillingData}
                        />
                    </label>
                    <label>
                        Cím:
                        <input
                            type="text"
                            name="address"
                            value={deliveryDetails.address}
                            onChange={handleDeliveryChange}
                            required
                            disabled={useBillingData}
                        />
                    </label>
                    <label>
                        Város:
                        <input
                            type="text"
                            name="city"
                            value={deliveryDetails.city}
                            onChange={handleDeliveryChange}
                            required
                            disabled={useBillingData}
                        />
                    </label>
                    <label>
                        Irányítószám:
                        <input
                            type="text"
                            name="postalCode"
                            value={deliveryDetails.postalCode}
                            onChange={handleDeliveryChange}
                            required
                            disabled={useBillingData}
                        />
                    </label>
                </div>
            )}

            {method === 'csomagpont' && (
                <div className="locker-form">
                    <h3>Válassz egy csomagautomatát</h3>
                    {isLoadingLockers ? (
                        <p>Betöltés...</p>
                    ) : (
                        <select
                            value={lockerLocation}
                            onChange={handleLockerChange}
                            required
                        >
                            <option value="">Válassz egy csomagautomatát</option>
                            {availableLockers.map((locker) => (
                                <option key={locker.id} value={locker.id}>
                                    {locker.location} - {locker.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            <div className="shipping-buttons">
                <button type="button" className="back-button" onClick={onBack}>
                    Vissza
                </button>
                <button type="submit">Tovább</button>
            </div>
        </form>
    );
};

export default ShippingMethod;
