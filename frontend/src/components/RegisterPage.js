import React, { useState } from 'react';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phonePrefix: '+36',
        phoneNumber: '',
        name: '',
        street: '',
        postalCode: '',
        city: '',
        taxNumber: '',
        acceptTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        number: false,
        specialChar: false,
    });

    const validatePassword = (password) => {
        setPasswordRequirements({
            length: password.length >= 8,
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*.-_]/.test(password),
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.password !== formData.confirmPassword) {
            alert('A jelszavaknak egyezniük kell!');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: `${formData.phonePrefix} ${formData.phoneNumber}`,
                    address: {
                        street: formData.street,
                        postalCode: formData.postalCode,
                        city: formData.city,
                    },
                    taxNumber: formData.taxNumber,
                }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Sikeres regisztráció! Most már bejelentkezhet.');
                window.location.href = '/login';
            } else {
                alert(`Hiba történt a regisztráció során: ${result.message}`);
            }
        } catch (error) {
            console.error('Hiba történt:', error);
            alert('Hiba történt a regisztráció során.');
        }
    };

    return (
        <div className="register-page">
            <h2>Regisztráció</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-section">
                    <h3>Regisztrációs adatok</h3>
                    <label>E-mail:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
    
                    <label>Jelszó:</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <i
                            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={() => setShowPassword((prev) => !prev)}
                        ></i>
                    </div>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        <li style={{ color: passwordRequirements.length ? "green" : "red" }}>
                            {passwordRequirements.length ? "✓" : "✗"} Legalább 8 karakter
                        </li>
                        <li style={{ color: passwordRequirements.number ? "green" : "red" }}>
                            {passwordRequirements.number ? "✓" : "✗"} Legalább egy szám
                        </li>
                        <li style={{ color: passwordRequirements.specialChar ? "green" : "red" }}>
                            {passwordRequirements.specialChar ? "✓" : "✗"} Legalább egy speciális karakter (!@#$%^&*.-_)
                        </li>
                    </ul>
    
                    <label>Jelszó megerősítése:</label>
                    <div className="password-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <i
                            className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        ></i>
                    </div>
                </div>
    
                <div className="form-section">
                    <h3>Kapcsolattartó adatok</h3>
                    <label>Előhívó:</label>
                    <input
                        type="text"
                        name="phonePrefix"
                        value={formData.phonePrefix}
                        onChange={handleChange}
                        required
                    />
    
                    <label>Mobil szám:</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
    
                <div className="form-section">
                    <h3>Számlázási adatok</h3>
                    <label>Név:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
    
                    <label>Utca, házszám:</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                    />
    
                    <label>Irányítószám:</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                    />
    
                    <label>Település:</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>
    
                <div className="form-section">
                    <label>
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            required
                        />
                        Elfogadom az Általános Szerződési Feltételeket és az Adatkezelési Tájékoztatót
                    </label>
                </div>
    
                <button
                    type="submit"
                    className="register-button"
                    disabled={!Object.values(passwordRequirements).every(Boolean)}
                >
                    Regisztráció
                </button>
            </form>
        </div>
    );
    
};

export default RegisterPage;
