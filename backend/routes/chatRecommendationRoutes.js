const express = require('express');
const mongoose = require('mongoose');
const tf = require('@tensorflow/tfjs');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const Model = require('../models/Model');
const { generateProductRecommendation, generateContextualResponse, extractDetailsFromInput, fetchTopProductByCategory } = require('../services/openaiService');
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

const userConversations = new Map(); // Felhasználói beszélgetési kontextus tárolása

router.post('/', async (req, res) => {
    const { userId, message, feedback, productId } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ message: 'Hiányzó adatok: userId vagy message.' });
    }

    try {
        // 1. Ellenőrizzük, hogy a felhasználónak volt-e korábbi ajánlása
        if (userConversations.has(userId)) {
            const previousRecommendation = userConversations.get(userId);

            // Ellenőrizzük, hogy az üzenet általános kérdés-e
            const isGeneralQuery = message.toLowerCase().includes('miért') || message.toLowerCase().includes('jó ajándék');

            if (isGeneralQuery) {
                const response = await generateContextualResponse(previousRecommendation.description, message);
                return res.status(200).json({ message: response });
            }
        }

        // 2. Modell betöltése vagy létrehozása
        let model;
        try {
            model = await loadModel(userId);
            console.log('Modell sikeresen betöltve!');
        } catch (error) {
            console.log('Modell nem található, új modell létrehozása...');
            const { inputs, outputs } = prepareTrainingData([]); // Kezdeti üres adatok
            model = await trainModel(inputs, outputs);
            console.log('Új modell sikeresen létrehozva.');
        }

        // 3. Felhasználói üzenet feldolgozása (pl. kategória, ízjegyek, ár stb.)
        const details = await extractDetailsFromInput(message);

        if (Object.keys(details).length === 0) {
            return res.status(200).json({
                message: 'Nem találtam keresési feltételeket az input alapján. Kérlek, adj meg konkrétabb információkat (pl. ár, kategória, ízjegyek).',
            });
        }

        console.log("Keresési feltételek:", details);

        // 4. Termék keresése az adatbázisból
        const product = await fetchTopProductByCategory(details);

        if (!product) {
            return res.status(200).json({
                message: 'Nem találtam megfelelő terméket a megadott feltételek alapján. Próbálj meg más keresési szempontokat!',
            });
        }

        // 5. Predikció és hasonló termékek kezelése
        let recommendedProduct = product; // Alapértelmezett termék, ha nincs predikció

        if (model) {
            const flavourNotesArray = product.flavourNotes
                .split(',')
                .map(note => note.trim().toLowerCase());

            const similarProducts = await Product.find({
                flavourNotes: { $regex: flavourNotesArray.join('|'), $options: 'i' },
            });

            console.log('Hasonló termékek száma:', similarProducts.length);

            const predictionsWithProducts = [];

            for (const product of similarProducts) {
                const input = [
                    product.price || 0,
                    product.alcoholContent || 0,
                    (product.origin || '').length || 0,
                    parseInt(product.bottleSize.replace(/\D/g, '') || 0),
                    ...product.flavourNotes.split(',').map(note => note.trim().length || 0),
                ];

                const inputTensor = tf.tensor2d([input], [1, input.length]);
                const prediction = model.predict(inputTensor);
                const predictionArray = prediction.arraySync();

                predictionsWithProducts.push({
                    product: product,
                    prediction: predictionArray[0][0],
                });

                console.log(
                    `Termék: ${product.name}, Predikciós érték: ${predictionArray[0][0]}`
                );
            }

            predictionsWithProducts.sort((a, b) => b.prediction - a.prediction);

            if (predictionsWithProducts.length > 0) {
                recommendedProduct = predictionsWithProducts[0].product;
                console.log('Legmagasabb predikciós értékű termék:', recommendedProduct.name);
            }
        }

        // Tároljuk az ajánlott terméket a felhasználóhoz
        userConversations.set(userId, recommendedProduct);

        // 6. Modell újratanítása visszajelzés alapján
        if (feedback && productId) {
            await saveFeedbackToDatabase(feedback, productId, userId);
            console.log('Visszajelzés elmentve.');

            const feedbackData = await getFeedbackData(userId);
            const { inputs, outputs } = prepareTrainingData(feedbackData);
            model = await trainModel(inputs, outputs);
            console.log('Modell sikeresen frissítve.');
        }

        // 7. Válasz összeállítása
        return res.status(200).json({
            message: `Ajánlom neked a következő terméket: ${recommendedProduct.name} (${recommendedProduct.price} Ft). ${recommendedProduct.description}`,
            productId: recommendedProduct._id,
            productName: recommendedProduct.name,
            productPrice: recommendedProduct.price,
            followUp: {
                question: 'Tetszik ez a termék? Ha igen, szeretnéd hozzáadni a kosaradhoz?',
                actions: [
                    { label: 'Igen, tedd a kosárba!', action: 'addToCart', payload: { productId: recommendedProduct._id } },
                    { label: 'Nem, keress mást.', action: 'searchAgain' },
                ],
            },
        });
    } catch (error) {
        console.error('Hiba történt az ajánlás folyamatában:', error);
        return res.status(500).json({ message: 'Hiba történt a kérés feldolgozása során.' });
    }
});

// Adatok előkészítése a modell betanításához
const prepareTrainingData = (data) => {
    const inputs = data.map(entry => [
        entry.price || 0,
        entry.alcoholContent || 0,
        (entry.origin || '').length || 0,
        parseInt(entry.bottleSize.replace(/\D/g, '') || 0),
        ...entry.flavourNotes.split(',').map(note => note.trim().length || 0),
    ]);
    const outputs = data.map(entry => entry.feedback || 0);
    return { inputs, outputs };
};

// Adatok előkészítése a modell betanításához
/*const prepareTrainingData = (data) => {
    const inputs = data.map(entry => [entry.input.length]);
    const outputs = data.map(entry => [entry.productId]);
    return { inputs, outputs };
}; */

module.exports = router;