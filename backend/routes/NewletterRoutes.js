const express = require('express');
const nodemailer = require('nodemailer');
const { sendContactMessage } = require('../services/emailService');
require('dotenv').config();

const router = express.Router();

// Email cím validálása
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

router.post('/subscribe', async (req, res) => {
    const { email, firstName } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email cím megadása kötelező.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Érvénytelen email cím.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Hírlevél feliratkozás',
        text: 'Köszönjük, hogy feliratkozott a hírlevelünkre!',
        html: `
            <p>Kedves <strong>${firstName}</strong>!</p>
            <h1>Köszönjük, hogy feliratkozott!</h1>
            <p>Értesíteni fogjuk a legfrissebb ajánlatainkról.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Feliratkozás sikeres, email elküldve.' });
    } catch (error) {
        console.error('Hiba az email küldésekor:', error.message);
        res.status(500).json({ message: 'Hiba történt az email küldésekor.' });
    }
});

router.post('/contact', async (req, res) => {
    const formData = req.body;

    try {
        await sendContactMessage(formData);
        res.status(200).json({ message: 'Üzenetedet sikeresen megkaptuk és megpróbálunk minél hamarabb válaszolni neked!' });
    } catch (error) {
        console.error('Hiba az üzenet feldolgozásakor:', error);
        res.status(500).json({ message: 'Nem sikerült elküldeni az üzenetet.' });
    }
});

module.exports = router;
