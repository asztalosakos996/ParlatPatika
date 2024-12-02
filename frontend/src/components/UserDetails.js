import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDetails.css';

const UserDetails = () => {
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Felhasználói adatok lekérése
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/details', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setUserData(data);
                    setFormData({
                        name: data.name,
                        phone: data.phone,
                        street: data.address?.street,
                        city: data.address?.city,
                        postalCode: data.address?.postalCode,
                    });
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Hiba történt az adatok lekérésekor.');
            }
        };

        fetchUserData();
    }, []);

    // Adatok módosítása (Név, telefonszám, cím)
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        postalCode: formData.postalCode,
                    },
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Adatok sikeresen frissítve.');
                setUserData(data.user);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Hiba történt az adatok frissítésekor.');
        }
    };
    

    // Jelszó módosítása
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError('A jelszavak nem egyeznek meg.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(passwordData),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Jelszó sikeresen módosítva.');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Hiba történt a jelszó módosítása során.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd a fiókod?')) return;
    
        try {
            const response = await fetch('http://localhost:5000/api/users/delete', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            const data = await response.json();
            if (response.ok) {
                alert('A fiókod sikeresen törölve.');
                localStorage.removeItem('token');
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Hiba történt a fiók törlésekor.');
        }
    };
    

    return (
        <div className="user-details-container">
            <h2>Felhasználói adatok</h2>
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}

            <form onSubmit={handleUpdate} className="user-details-form">
                <label>
                    Telefonszám:
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Utca, házszám:
                    <input
                        type="text"
                        name="street"
                        value={formData.street || ''}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Város:
                    <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Irányítószám:
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode || ''}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">Adatok frissítése</button>
            </form>

            <form onSubmit={handlePasswordChange} className="user-password-form">
                <label>
                    Jelenlegi jelszó:
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                    />
                </label>
                <label>
                    Új jelszó:
                    <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                    />
                </label>
                <label>
                    Új jelszó megerősítése:
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordInputChange}
                        required
                    />
                </label>
                <button type="submit">Jelszó módosítása</button>
            </form>

            <button className="delete-account-button" onClick={() => handleDeleteAccount()}>
                Fiók törlése
            </button>
        </div>
    );
};

export default UserDetails;
