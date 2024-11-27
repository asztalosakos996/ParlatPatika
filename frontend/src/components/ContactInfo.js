import React, { useState, useEffect } from 'react';
import './ContactInfo.css';

const ContactInfo = ({ onNext, initialData }) => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
    });

    const [useDefaultBilling, setUseDefaultBilling] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bejelentkezett felhasználó adatainak betöltése
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:5000/api/users/details', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    const { email, name, phone, address } = data;
                    setFormData({
                        email,
                        name,
                        phone,
                        address: address?.street || '',
                        city: address?.city || '',
                        postalCode: address?.postalCode || '',
                    });
                } else {
                    setError(data.message || 'Hiba történt az adatok betöltésekor.');
                }
            } catch (error) {
                setError('Hiba történt az adatok betöltésekor.');
            } finally {
                setLoading(false);
            }
        };

        // Csak akkor hívja meg az API-t, ha nincs inicializált adat
        if (!initialData) {
            fetchUserData();
        } else {
            setFormData(initialData);
        }
    }, [initialData]);

    // Mezők értékének frissítése
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Számlázási és szállítási cím különválasztása
    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setUseDefaultBilling(!checked);

        // Ha nem használ alapértelmezett számlázási adatokat, üres mezők
        if (checked) {
            setFormData({
                email: '',
                name: '',
                address: '',
                city: '',
                postalCode: '',
                phone: '',
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext(formData); // Továbbadás a következő lépésre
    };

    if (loading) {
        return <div>Betöltés...</div>;
    }

    return (
        <form className="contact-info-container" onSubmit={handleSubmit}>
            <h2>Kapcsolattartó és számlázási adatok</h2>
            {error && <p className="error">{error}</p>}

            <div className="checkbox-container">
                <label>
                    <input
                        type="checkbox"
                        checked={!useDefaultBilling}
                        onChange={handleCheckboxChange}
                    />
                    Más számlázási adatokat adok meg
                </label>
            </div>

            <label>Email:</label>
            <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
            />
            <label>Név:</label>
            <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
            />
            <label>Utca, házszám:</label>
            <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                required
            />
            <label>Település:</label>
            <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                required
            />
            <label>Irányítószám:</label>
            <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleChange}
                required
            />
            <label>Telefonszám:</label>
            <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                required
            />
            <button type="submit">Tovább</button>
        </form>
    );
};

export default ContactInfo;
