const tf = require('@tensorflow/tfjs');
const mongoose = require('mongoose');
const Model = require('../models/Model'); // Modell adatbázis-séma

// Modell betanítása és mentése az adatbázisba
const trainModel = async (userId, inputData, outputData) => {
    if (!inputData.length || !outputData.length) {
        console.error('Üres bemenet vagy kimenet.');
        return null;
    }
    if (inputData.length !== outputData.length) {
        console.error('A bemenetek és kimenetek hossza nem egyezik meg.');
        return null;
    }

    // Bemeneti jellemzők száma (pl. 5 jellemző)
    const inputFeatures = inputData[0].length;

    // Modell létrehozása
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [inputFeatures], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    // Adatok tensor formátumra alakítása
    const xs = tf.tensor2d(inputData, [inputData.length, inputFeatures]);
    const ys = tf.tensor2d(outputData, [outputData.length, 1]);

    await model.fit(xs, ys, { epochs: 10 });

    const architecture = model.toJSON(null, 2);
    const weights = model.getWeights().map(weight => weight.arraySync());

    await Model.updateOne(
        { userId },
        { architecture, weights },
        { upsert: true, runValidators: true }
    );
    console.log('Modell architektúra és súlyok mentve az adatbázisba!');
    return model;
};


// Modell betöltése az adatbázisból
const loadModel = async (userId) => {
    try {
        const savedModel = await Model.findOne({ userId });
        if (!savedModel) {
            console.log('Nincs mentett modell az adatbázisban!');
            return null;
        }

        const { architecture, weights } = savedModel;
        const model = tf.models.modelFromJSON(architecture);
        model.setWeights(weights.map(weight => tf.tensor(weight)));
        console.log('Modell betöltve az adatbázisból!');
        return model;
    } catch (error) {
        console.error('Hiba a modell betöltése közben:', error);
        return null;
    }
};

// Előrejelzés készítése
const predictNextPurchase = (model, product) => {
    try {
        const input = [
            product.price,
            product.alcoholContent,
            product.origin.length,
            product.bottleSize.replace(/\D/g, '') || 0,
            ...product.flavorNotes.map(note => note.length || 0)
        ];

        const inputTensor = tf.tensor2d([input]);
        const prediction = model.predict(inputTensor);
        return prediction.arraySync();
    } catch (error) {
        console.error('Hiba a predikció készítése közben:', error);
        return null;
    }
};


// Felhasználói visszajelzések alapján modell frissítése
const updateModelWithFeedback = async (userId) => {
    const feedbacks = await Feedback.find({ userId });

    // Érvényes visszajelzések szűrése
    const validFeedbacks = feedbacks.filter(f => f.productId && f.feedback);

    // Termékek lekérése a visszajelzések alapján
    const productIds = validFeedbacks.map(f => f.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Input adatok előkészítése
    const inputData = validFeedbacks.map(f => {
        const product = products.find(p => p._id.toString() === f.productId.toString());
        return [
            product.price,                      // Ár
            product.alcoholContent,             // Alkohol-tartalom
            product.origin.length,              // Származási hely hossza
            product.bottleSize.replace(/\D/g, '') || 0, // Palack méret (csak számok)
            ...product.flavorNotes.map(note => note.length || 0) // Ízjegyek hossza
        ];
    });

    // Output adatok előkészítése
    const outputData = validFeedbacks.map(f => (f.feedback === 'like' ? 1 : 0));

    // Ellenőrzés
    if (!inputData.length || !outputData.length) {
        console.log('Nincs elég érvényes visszajelzés a modell frissítéséhez.');
        return null;
    }

    console.log('Feedbacks:', validFeedbacks);
    console.log('inputData:', inputData);
    console.log('outputData:', outputData);

    // Modell tanítása
    return await trainModel(userId, inputData, outputData);
};


module.exports = { trainModel, loadModel, predictNextPurchase, updateModelWithFeedback };
