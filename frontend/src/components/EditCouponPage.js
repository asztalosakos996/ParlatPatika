import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import './EditCouponPage.css';

const EditCouponPage = () => {
    const { couponId } = useParams(); // URL-ből kapott kupon ID
    console.log('Coupon ID:', couponId);
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState({
        code: '',
        discount: '',
        discountType: 'fixed', // Alapértelmezett érték
        expirationDate: ''
    });
    const [error, setError] = useState(null);

    // Kupon adatok betöltése
    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/coupons/${couponId}`);
                if (!response.ok) {
                    throw new Error('Nem sikerült betölteni a kupont.');
                }
                const data = await response.json();
                setCoupon(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchCoupon();
    }, [couponId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCoupon((prevCoupon) => ({
            ...prevCoupon,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/coupons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coupon),
            });
            if (!response.ok) {
                throw new Error('Nem sikerült frissíteni a kupont.');
            }
            alert('Kupon sikeresen frissítve.');
            navigate('/admin/manage-coupons'); // Vissza a kuponkezeléshez
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="edit-coupon-page">
            <h1>Kupon módosítása</h1>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="edit-coupon-form">
                <label>
                    Kuponkód:
                    <input
                        type="text"
                        name="code"
                        value={coupon.code}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Kedvezmény:
                    <input
                        type="number"
                        name="discount"
                        value={coupon.discount}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Kedvezmény típusa:
                    <select
                        name="discountType"
                        value={coupon.discountType}
                        onChange={handleChange}
                        required
                    >
                        <option value="fixed">Fix összeg</option>
                        <option value="percentage">Százalékos</option>
                    </select>
                </label>
                <label>
                    Lejárati dátum:
                    <input
                        type="date"
                        name="expirationDate"
                        value={coupon.expirationDate.split('T')[0]} // Csak a dátumot jeleníti meg
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit" className="save-button">Mentés</button>
            </form>
        </div>
    );
};

export default EditCouponPage;
