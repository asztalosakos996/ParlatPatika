const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon'); // Feltételezzük, hogy van egy Coupon modell

// Új kupon létrehozása
router.post('/', async (req, res) => {
    const { code, discount, discountType, expirationDate } = req.body;
    try {
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Ez a kuponkód már létezik.' });
        }

        const newCoupon = new Coupon({ code, discount, discountType, expirationDate });
        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        console.error('Hiba a kupon létrehozásakor:', error);
        res.status(500).json({ message: 'Hiba történt a kupon létrehozásakor.' });
    }
});

// Kuponok listázása
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Hiba a kuponok lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kuponok lekérésekor.' });
    }
});

// Egy adott kupon lekérése ID alapján
router.get('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id); // Keresés az ID alapján
        if (!coupon) {
            return res.status(404).json({ message: 'A kupon nem található.' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        console.error('Hiba történt a kupon lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kupon lekérésekor.' });
    }
});


// Egy kupon törlése
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: 'A kupon nem található.' });
        }
        res.status(200).json({ message: 'A kupon sikeresen törölve.' });
    } catch (error) {
        console.error('Hiba a kupon törlésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kupon törlésekor.' });
    }
});

// Kuponkód ellenőrzése
router.post('/validate', async (req, res) => {
    const { code, totalAmount } = req.body;
    try {
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) {
            return res.status(400).json({ message: 'A kupon nem érvényes vagy lejárt.' });
        }

        // Ellenőrizd a lejárati dátumot
        if (coupon.expirationDate < new Date()) {
            return res.status(400).json({ message: 'A kupon lejárt.' });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (totalAmount * coupon.discount) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discount;
        }

        res.status(200).json({ discount: discountAmount });
    } catch (error) {
        console.error('Hiba a kupon érvényesítésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kupon érvényesítésekor.' });
    }
});

// Egy kupon frissítése
router.put('/:couponId', async (req, res) => {
    console.log('Requested Coupon ID:', req.params.id);
    const { couponId } = req.params;
    const { code, discount, discountType, expirationDate } = req.body;
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { code, discount, discountType, expirationDate },
            { new: true }
        );
        if (!updatedCoupon) {
            return res.status(404).json({ message: 'A kupon nem található.' });
        }
        res.status(200).json(updatedCoupon);
    } catch (error) {
        console.error('Hiba a kupon frissítésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kupon frissítésekor.' });
    }
});

module.exports = router;
