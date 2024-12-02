import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/newsletter/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMessage(data.message);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setResponseMessage(data.message);
            }
        } catch (error) {
            setResponseMessage('Hiba történt az üzenet küldésekor.');
        }
    };

    return (
        <div className="contact-container">
            <div className="form-section">
                <h2>Kapcsolat</h2>
                <p>Bármikor szívesen várjuk megkeresését. Amint tudunk, válaszolunk!</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Név"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Üzenet"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    ></textarea>
                    <button type="submit">Küldés</button>
                </form>
                {responseMessage && <p className="response-message">{responseMessage}</p>}
            </div>
            <div className="info-section">
                <h3>Info</h3>
                <ul>
                    <li>
                        <i className="fas fa-envelope"></i> parlatpatika@gmail.com
                    </li>
                    <li>
                        <i className="fas fa-phone"></i> +36 30 123 4567
                    </li>
                    <li>
                        <i className="fas fa-map-marker-alt"></i> 1234 Budapest, Fő utca 1.
                    </li>
                    <li>
                        <i className="fas fa-clock"></i> H-P: 9:00 - 18:00
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Contact;
