const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Nem kötelező
    contactInfo: {
        email: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        phone: { type: String, required: true },
    },
    shippingMethod: {
        method: { type: String, required: true },
        deliveryDetails: {
            email: { type: String },
            name: { type: String },
            address: { type: String },
            city: { type: String },
            postalCode: { type: String },
            phone: { type: String },
        },
    },
    paymentMethod: { type: String, required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
