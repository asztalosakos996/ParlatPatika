const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Product = require('../models/Product');
const { verifyUser } = require('../middleware/authMiddleware');

// Új értékelés mentése
router.post('/:productId/reviews/add', verifyUser, async (req, res) => {
    try {
        const { productId } = req.params;
        const { text, rating } = req.body;

        if (!productId || !text || !rating) {
            return res.status(400).json({ message: 'Minden mezőt ki kell tölteni!' });
        }

        const newRating = new Rating({
            user: req.user.id,
            product: productId,
            text,
            rating,
        });

        const savedRating = await newRating.save();

        await Product.findByIdAndUpdate(productId, { $push: { ratings: savedRating._id } });

        res.status(201).json(savedRating);
    } catch (error) {
        console.error('Hiba az értékelés mentésekor:', error);
        res.status(500).json({ message: 'Hiba történt az értékelés mentésekor.' });
    }
});

// Egy adott termékhez tartozó értékelések listázása
router.get('/:productId/reviews', async (req, res) => {
    try {
        const { productId } = req.params;

    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'A termék nem található.' });
        }

        const reviews = await Rating.find({ product: productId }).populate('user', 'name');
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Hiba az értékelések lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt az értékelések lekérésekor.' });
    }
});


module.exports = router;
