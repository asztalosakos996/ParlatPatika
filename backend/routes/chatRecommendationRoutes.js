const express = require('express');
const { generateProductRecommendation } = require('../services/openaiService'); // Importálás
const router = express.Router();

router.post('/recommendation', async (req, res) => {
    const { input } = req.body; // req.body-ból kinyerjük az adatokat
    console.log("Kapott adatok:", { input });

    try {
        // Továbbítjuk az adatokat objektumként
        const recommendation = await generateProductRecommendation(input);

        // Válasz a frontendnek a generált ajánlással
        res.json({ message: recommendation });
    } catch (error) {
        console.error('Hiba történt a termék ajánlása során:', error);
        res.status(500).json({ message: 'Hiba történt a termék ajánlása során.' });
    }
});


module.exports = router;
