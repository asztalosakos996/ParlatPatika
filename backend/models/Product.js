const mongoose = require('mongoose');

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
    alcoholContent: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    flavourNotes: {
        type: String,
        required: false,
    },
    origin: {
        type: String,
        required: true,
    },
    bottleSize: {
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
