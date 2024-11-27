import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState(''); // Új állapot a keresztnév tárolására
    const [message, setMessage] = useState('');

    const handleSubscribe = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, firstName }) // Keresztnév is elküldve a backendnek
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage('Hiba történt: ' + data.message);
            }
        } catch (error) {
            setMessage('Hiba történt a kérés során.');
        }
    };

    return (
        <div className="newsletter">
            <h2>Hírlevél Feliratkozás</h2>
            <p>Iratkozzon fel hírlevelünkre a legfrissebb ajánlatokért!</p>
            <input
                type="text"
                placeholder="Keresztnév"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)} // Keresztnév állapot frissítése
            />
            <input
                type="email"
                placeholder="Email cím"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Email állapot frissítése
            />
            <button onClick={handleSubscribe}>Feliratkozás</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Newsletter;
