const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const Model = require('../models/Model');
const { generateProductRecommendation } = require('../services/openaiService');
const { trainModel, loadModel, predictNextPurchase, updateModelWithFeedback } = require('../services/tensorFlowService');
const { saveFeedbackToDatabase } = require('../services/feedbackService');
const router = express.Router();

let purchaseData = []; // Adatok gyűjtése tanításhoz
let trainedModel = null; // Betanított modell tárolása

// Termékajánlás és visszajelzés kezelése
router.post('/recommendation', async (req, res) => {
    const { input, feedback, productId } = req.body;
    console.log("Kapott adatok:", { input, feedback, productId });

    try {
        // Ha van visszajelzés, mentjük az adatokat és tanítjuk a modellt
        if (feedback && productId) {
            purchaseData.push({ input, feedback, productId });

            // Modell újratanítása
            const { inputs, outputs } = prepareTrainingData(purchaseData);
            trainedModel = await trainModel(inputs, outputs);
            console.log('Modell sikeresen újratanítva!');
        }

        // Új termékajánlás generálása
        const recommendation = await generateProductRecommendation(input);

        // Ha van betanított modell, előrejelzést készítünk
        if (trainedModel) {
            const prediction = predictNextPurchase(trainedModel, [input.length]);
            console.log('Predikció alapján ajánlott termék ID:', prediction);
        }

        // Válasz a frontendnek
        res.json({ message: recommendation });
    } catch (error) {
        console.error('Hiba történt a termék ajánlása során:', error);
        res.status(500).json({ message: 'Hiba történt a termék ajánlása során.' });
    }
});

router.post('/feedback', async (req, res) => {
    const { feedback, productId, userId } = req.body;

    console.log('Visszajelzés érkezett:', { feedback, productId, userId });

    if (!feedback || !productId || !userId) {
        return res.status(400).json({ message: 'Hiányzó adatok: feedback, productId vagy userId.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Helytelen userId formátum.' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    try {
        // Visszajelzés mentése
        await saveFeedbackToDatabase(feedback, productId, objectId);
        console.log('Visszajelzés elmentve az adatbázisba.');

        // Modell egyszeri frissítése
        console.log('Modell frissítése visszajelzések alapján...');
        await updateModelWithFeedback(objectId);

        res.status(200).json({ message: 'Visszajelzés elmentve, és a modell frissítve!' });
    } catch (error) {
        console.error('Hiba történt a visszajelzés feldolgozása során:', error);
        res.status(500).json({ message: 'Hiba történt a visszajelzés feldolgozása során.' });
    }
});



// Adatok előkészítése a modell betanításához
const prepareTrainingData = (data) => {
    const inputs = data.map(entry => [entry.input.length]);
    const outputs = data.map(entry => [entry.productId]);
    return { inputs, outputs };
};

module.exports = router;
