const express = require('express');
const { generateProductRecommendation } = require('../services/openaiService'); // Importálás
const router = express.Router();

router.post('/recommendation', async (req, res) => {
    const { category } = req.body;

    try {
        // Meghívja a termékajánló függvényt a megadott kategóriával
        const recommendation = await generateProductRecommendation(category);

        // Válasz a frontendnek a generált ajánlással
        res.json({ message: recommendation });
    } catch (error) {
        console.error('Hiba történt a termék ajánlása során:', error);
        res.status(500).json({ message: 'Hiba történt a termék ajánlása során.' });
    }
});

module.exports = router;
