const tf = require('@tensorflow/tfjs');
const mongoose = require('mongoose');
const Model = require('../models/Model'); // Modell adatbázis-séma
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');

const getArchitectureAndWeights = async (userId) => {
    try {
        console.log("Kapott userId:", userId);

        // Ha nem ObjectId, akkor konvertáljuk
        const objectId = userId instanceof mongoose.Types.ObjectId
            ? userId
            : new mongoose.Types.ObjectId(userId);

        console.log("ObjectId:", objectId);

        // Lekérdezés az adatbázisból
        const modelData = await Model.findOne({ userId: objectId }, { architecture: 1, weights: 1, _id: 0 });
        if (!modelData) {
            throw new Error(`Nem található modell a megadott userId-hoz: ${userId}`);
        }
        return modelData;
    } catch (error) {
        console.error("Hiba történt az architektúra és súlyok lekérdezése során:", error);
        throw error;
    }
};

// Modell betanítása és mentése az adatbázisba
const trainModel = async (userId, inputData, outputData) => {
    // Ha nincs adat, dummy adatok használata az alapmodell létrehozásához
    if (!inputData.length || !outputData.length) {
        console.warn('Üres bemenet vagy kimenet. Dummy adatokkal hozunk létre egy alapmodellt...');
        inputData = [[0, 0, 0, 0, 0, 0, 0]]; // Dummy bemenet (például 7 feature értékkel)
        outputData = [0]; // Dummy kimenet
    }

    if (inputData.length !== outputData.length) {
        console.error('A bemenetek és kimenetek hossza nem egyezik meg.');
        return null;
    }

    const inputFeatures = inputData[0].length;

    // Modell létrehozása
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [inputFeatures], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    const xs = tf.tensor2d(inputData, [inputData.length, inputFeatures]);
    const ys = tf.tensor2d(outputData, [outputData.length, 1]);

    console.log('Modell tanítása...');
    await model.fit(xs, ys, { epochs: 10 });

    // Modell architektúra és súlyok mentése kompatibilis formátumban
    const modelJSON = model.toJSON();
    const weights = model.getWeights().map(weight => ({
        values: weight.arraySync(),
        shape: weight.shape
    }));

    try {
        await Model.updateOne(
            { userId },
            { architecture: { modelTopology: modelJSON }, weights },
            { upsert: true, runValidators: true }
        );
        console.log('Modell architektúra és súlyok sikeresen mentve!');
    } catch (error) {
        console.error('Hiba történt az adatbázisba mentés során:', error.message);
        throw error;
    }

    return model;
};



// Modell betöltése az adatbázisból
const loadModel = async (userId) => {
    try {
        console.log("Kapott userId:", userId);

        // Ha nem ObjectId, akkor konvertáljuk
        const objectId = userId instanceof mongoose.Types.ObjectId
            ? userId
            : new mongoose.Types.ObjectId(userId);

        const { architecture, weights } = await getArchitectureAndWeights(objectId);

        if (!architecture || !architecture.modelTopology) {
            throw new Error("Hiányzó vagy hibás modell architektúra (nincs modelTopology).");
        }

        console.log("Modell betöltése folyamatban... Architecture:", architecture);
        const model = await tf.models.modelFromJSON(JSON.parse(architecture.modelTopology));

        // Súlyok betöltése
        if (weights) {
            console.log("Súlyok betöltése...");
            model.setWeights(weights.map(w => tf.tensor(w.values, w.shape)));
        } else {
            console.log("Nincsenek súlyok a modellhez.");
        }

        console.log("Modell sikeresen betöltve!");
        return model;
    } catch (error) {
        console.error("Hiba történt a modell betöltése során:", error);
        throw error;
    }
};


// Előrejelzés készítése
const predictNextPurchase = (model, product) => {
    console.log('Beléptünk a predictNextPurchase-be');
    try {
        const input = [
            product.price || 0,
            product.alcoholContent || 0,
            (product.origin || '').length || 0,
            parseInt((product.bottleSize || '').replace(/\D/g, '')) || 0,
            ...product.flavourNotes.split(',').map(note => note.trim().length || 0)
        ];

        const inputTensor = tf.tensor2d([input], [1, input.length]);
        const prediction = model.predict(inputTensor);

        const predictionArray = prediction.arraySync();
        console.log('Előrejelzés eredménye:', predictionArray);

        return predictionArray;
    } catch (error) {
        console.error('Hiba a predikció készítése közben:', error);
        return null;
    }
};


// Felhasználói visszajelzések alapján modell frissítése
const updateModelWithFeedback = async (userId) => {
    console.log('updateModelWithFeedback meghívva a következő userId-vel:', userId);
    const feedbacks = await Feedback.find({ userId });
    console.log('Lekérdezett visszajelzések:', feedbacks);

    const validFeedbacks = feedbacks.filter(f => f.productId && f.feedback);

    const productIds = validFeedbacks.map(f => f.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    console.log('Lekérdezett termékek:', products);

    const inputData = validFeedbacks.map(f => {
        const product = products.find(p => p._id.toString() === f.productId.toString());
        if (!product) {
            console.error(`Nem található termék az adott productId-hoz: ${f.productId}`);
            return [];
        }
        const flavourNotesArray = (product.flavourNotes || '').split(',').map(note => note.trim());
        console.log('Feldolgozott termék:', {
            price: product.price,
            alcoholContent: product.alcoholContent,
            origin: product.origin,
            bottleSize: product.bottleSize,
            flavourNotesArray
        });
        return [
            product.price || 0,
            product.alcoholContent || 0,
            (product.origin || '').length || 0,
            parseInt((product.bottleSize || '').replace(/\D/g, '')) || 0,
            ...flavourNotesArray.map(note => note.length || 0)
        ];
    }).filter(data => data.length > 0);

    const outputData = validFeedbacks.map(f => (f.feedback === 'like' ? 1 : 0));

    if (!inputData.length || !outputData.length) {
        console.log('Nincs elég érvényes visszajelzés a modell frissítéséhez.');
        return null;
    }

    console.log('Valid Feedbacks:', validFeedbacks);
    console.log('InputData:', inputData);
    console.log('OutputData:', outputData);

    // Modell tanítása
    return await trainModel(userId, inputData, outputData);
};


module.exports = { trainModel, loadModel, predictNextPurchase, updateModelWithFeedback };
