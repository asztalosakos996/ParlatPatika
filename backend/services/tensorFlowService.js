const tf = require('@tensorflow/tfjs');
const fs = require('fs');

// Modell betanítása és mentése
const trainModel = async (inputData, outputData) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [inputData[0].length], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    const xs = tf.tensor2d(inputData);
    const ys = tf.tensor2d(outputData);

    await model.fit(xs, ys, { epochs: 10 });

    // Modell mentése fájlrendszerbe
    await model.save('file://./model-data/model');
    console.log('Modell mentve!');
    return model;
};

// Modell betöltése
const loadModel = async () => {
    if (fs.existsSync('./model-data/model/model.json')) {
        const model = await tf.loadLayersModel('file://./model-data/model/model.json');
        console.log('Modell betöltve!');
        return model;
    } else {
        console.log('Nincs mentett modell!');
        return null;
    }
};

// Előrejelzés készítése a betöltött modellel
const predictNextPurchase = (model, input) => {
    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor);
    return prediction.arraySync();
};

module.exports = { trainModel, loadModel, predictNextPurchase };
