const express = require('express');
const Feedback = require('../models/Feedback');
const { generateProductRecommendation } = require('../services/openaiService');
const { trainModel, loadModel, predictNextPurchase } = require('../services/tensorFlowService');
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

    // Ellenőrzés: Hiányzó adatok
    if (!feedback || !productId || !userId) {
        return res.status(400).json({ message: 'Hiányzó adatok: feedback, productId vagy userId.' });
    }

    try {
        // 1. Visszajelzés mentése az adatbázisba
        await saveFeedbackToDatabase(feedback, productId, userId);
        console.log('Visszajelzés elmentve az adatbázisba.');

        // 2. Felhasználói visszajelzések lekérése
        const feedbacks = await Feedback.find({ userId });

        if (!feedbacks || feedbacks.length === 0) {
            console.log('Nincs elérhető visszajelzés a felhasználótól.');
            return res.status(200).json({ message: 'Visszajelzés elmentve, de nincs elég adat a modell frissítéséhez.' });
        }

        // 3. TensorFlow adatok előkészítése
        const inputData = feedbacks.map((f) => [parseInt(f.productId.toString().slice(-6), 16)]); // Numerikus termék ID-k
        const outputData = feedbacks.map((f) => (f.feedback === 'like' ? 1 : 0)); // Like -> 1, Dislike -> 0

        if (inputData.length === 0 || outputData.length === 0) {
            console.log('Nincs elég adat a modell tanításához.');
            return res.status(200).json({ message: 'Visszajelzés elmentve, de nincs elég adat a modell frissítéséhez.' });
        }

        // 4. TensorFlow modell betöltése az adatbázisból
        let model = await loadModel(userId);
        if (!model) {
            console.log('Új modell létrehozása...');
            model = await trainModel(userId, [], []);
        }

        // 5. TensorFlow modell frissítése
        await trainModel(userId, inputData, outputData);
        console.log('TensorFlow modell frissítve a felhasználói visszajelzések alapján.');

        // 6. Válasz küldése
        res.status(200).json({ message: 'Visszajelzés elmentve, és a modell frissítve!' });
    } catch (error) {
        console.error('Hiba történt a visszajelzés feldolgozása során:', error);
        res.status(500).json({ message: 'Hiba történt a visszajelzés mentése során.' });
    }
});



// Adatok előkészítése a modell betanításához
const prepareTrainingData = (data) => {
    const inputs = data.map(entry => [entry.input.length]);
    const outputs = data.map(entry => [entry.productId]);
    return { inputs, outputs };
};

module.exports = router;
