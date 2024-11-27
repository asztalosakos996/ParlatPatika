const mongoose = require('mongoose');

// Termék séma
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    alcoholContent: {  // Alkohol tartalom
        type: Number,
        required: true,
    },
    type: {  // Ital típusa
        type: String,
        required: true,
    },
    origin: {  // Származási hely
        type: String,
        required: true,
    },
    bottleSize: {  // Palack méret
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    ratings: [{  // Értékelések referenciái
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
});

// Termék modell létrehozása
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
