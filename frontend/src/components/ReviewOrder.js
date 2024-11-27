import React from 'react';
import { useCart } from '../context/CartContext'; // Kosár kezeléséhez szükséges hook
import './ReviewOrder.css';

const ReviewOrder = ({ onBack, orderData }) => {
    const { clearCart } = useCart(); // Kosár kiürítésének függvénye

    const handleSubmit = async () => {
        console.log(orderData);
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Rendelés sikeresen véglegesítve!');
                clearCart(); // Kosár kiürítése a rendelés sikeres leadása után
            } else {
                alert(`Hiba történt a rendelés véglegesítése során: ${result.message}`);
            }
        } catch (error) {
            alert(`Hiba történt: ${error.message}`);
        }
    };

    return (
        <div className="review-order-container">
            <h2>Adatok ellenőrzése</h2>
            <div className="order-summary">
                <h3>Számlázási adatok:</h3>
                <p><strong>Email:</strong> {orderData.contactInfo?.email || 'Nincs megadva'}</p>
                <p><strong>Név:</strong> {orderData.contactInfo?.name || 'Nincs megadva'}</p>
                <p><strong>Cím:</strong> {orderData.contactInfo?.address || 'Nincs megadva'}, {orderData.contactInfo?.city || ''}, {orderData.contactInfo?.postalCode || ''}</p>
                <p><strong>Telefonszám:</strong> {orderData.contactInfo?.phone || 'Nincs megadva'}</p>
                
                <h3>Szállítási és fizetési mód:</h3>
                <p><strong>Szállítási mód:</strong> {orderData.shippingMethod?.method || 'Nincs kiválasztva'}</p>
                {orderData.shippingMethod.deliveryDetails && (
                    <>
                        <p><strong>Szállítási név:</strong> {orderData.shippingMethod.deliveryDetails.name}</p>
                        <p><strong>Szállítási cím:</strong> {orderData.shippingMethod.deliveryDetails.address}, {orderData.shippingMethod.deliveryDetails.city}, {orderData.shippingMethod.deliveryDetails.postalCode}</p>
                    </>
                )}
                {orderData.shippingMethod.lockerLocation && (
                    <p><strong>Csomagpont:</strong> {orderData.shippingMethod.lockerLocation}</p>
                )}
                <p><strong>Fizetési mód:</strong> {orderData.paymentMethod || 'Nincs kiválasztva'}</p>

                <h3>Termékek:</h3>
                <ul>
                    {orderData.items?.map((item, index) => (
                        <li key={index}>
                            {item.name || 'Ismeretlen termék'} - {item.quantity} db - Összesen: {(item.price * item.quantity).toLocaleString()} Ft
                        </li>
                    ))}
                </ul>

                <h3>Végösszeg:</h3>
                <p><strong>{orderData.totalAmount?.toLocaleString() || '0'} Ft</strong></p>
            </div>
            
            <div className="review-buttons">
                <button type="button" onClick={onBack}>Vissza</button>
                <button onClick={handleSubmit}>Rendelés véglegesítése</button>
            </div>
        </div>
    );
};

export default ReviewOrder;
