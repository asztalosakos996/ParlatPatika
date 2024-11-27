import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageCoupons.css';

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        // Kuponok lekérdezése az API-ból
        const fetchCoupons = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/coupons');
                const data = await response.json();
                setCoupons(data);
            } catch (error) {
                console.error('Hiba a kuponok lekérésekor:', error);
            }
        };

        fetchCoupons();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Biztosan törölni szeretnéd ezt a kupont?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/coupons/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setCoupons(coupons.filter((coupon) => coupon._id !== id));
                alert('Kupon sikeresen törölve!');
            } else {
                alert('Hiba történt a kupon törlésekor.');
            }
        } catch (error) {
            console.error('Hiba a kupon törlésekor:', error);
        }
    };

    return (
        <div className="manage-coupons">
            <h1>Kuponok Kezelése</h1>
            <ul className="coupon-list">
                {coupons.map((coupon) => (
                    <li key={coupon._id} className="coupon-item">
                        <p><strong>Kód:</strong> {coupon.code}</p>
                        <p><strong>Kedvezmény:</strong> {coupon.discount} {coupon.discountType === 'percentage' ? '%' : 'HUF'}</p>
                        <p><strong>Lejárati dátum:</strong> {new Date(coupon.expirationDate).toLocaleDateString()}</p>
                        <div className="coupon-actions">
                            <Link to={`/admin/edit-coupon/${coupon._id}`} className="edit-button">Szerkesztés</Link>
                            <button onClick={() => handleDelete(coupon._id)} className="delete-button">Törlés</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageCoupons;
