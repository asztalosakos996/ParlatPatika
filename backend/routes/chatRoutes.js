const express = require('express');
const router = express.Router();
const { generateProductRecommendation } = require('../services/openaiService');

router.post('/recommendation', async (req, res) => {
    const { message } = req.body;

    try {
        const recommendation = await generateProductRecommendation(message);
        res.status(200).json({ recommendation });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt az ajánlás generálása során.' });
    }
});

module.exports = router;
