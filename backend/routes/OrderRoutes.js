const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');

const router = express.Router();

// Új rendelés létrehozása
router.post('/', async (req, res) => {
    console.log('Received order data:', req.body);

    const { userId, contactInfo, shippingMethod, paymentMethod, items, totalAmount } = req.body;

    try {
        const newOrder = new Order({
            user: userId || null,
            contactInfo,
            shippingMethod,
            paymentMethod,
            items,
            totalAmount,
        });

        const savedOrder = await newOrder.save();

        // Rendelési visszaigazolás e-mail küldése
        if (contactInfo.email) {
            try {
                await sendOrderConfirmation(contactInfo.email, {
                    items,
                    contactInfo,
                    totalAmount,
                });
                console.log('Rendelési visszaigazolás elküldve.');
            } catch (emailError) {
                console.error('Hiba az e-mail küldésekor:', emailError.message);
            }
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Hiba történt a rendelés mentése során:', error);
        res.status(500).json({ message: 'Hiba történt a rendelés mentése során.', error: error.message });
    }
});

// Rendelések listázása
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'email'); // Felhasználó adatokkal együtt
        res.status(200).json(orders);
    } catch (error) {
        console.error('Hiba a rendelések lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a rendelések lekérésekor.' });
    }
});

router.get('/api/orders/stats', async (req, res) => {
    try {
        const orders = await Order.find(); // Lekérdezed az összes rendelést
        
        // Rendelési statisztikák összegzése havi bontásban
        const monthlyStats = Array(12).fill(0);
        orders.forEach(order => {
            const month = new Date(order.createdAt).getMonth(); // Hónap index 0-11
            monthlyStats[month] += 1; // Rendelésszám növelése
        });

        res.json(monthlyStats);
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a rendelési statisztikák lekérésekor.' });
    }
});

// Fizetési módok lekérése
router.get('/payment-methods', async (req, res) => {
    try {
        const paymentMethods = await Order.distinct('paymentMethod');
        res.status(200).json(paymentMethods);
    } catch (err) {
        console.error('Hiba a fizetési módok lekérésekor:', err);
        res.status(500).json({ message: 'Hiba történt a fizetési módok lekérésekor.' });
    }
});

// Szállítási módok lekérése
router.get('/shipping-methods', async (req, res) => {
    try {
        const shippingMethods = await Order.distinct('shippingMethod');
        res.status(200).json(shippingMethods);
    } catch (err) {
        console.error('Hiba a szállítási módok lekérésekor:', err);
        res.status(500).json({ message: 'Hiba történt a szállítási módok lekérésekor.' });
    }
});




module.exports = router;
