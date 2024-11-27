const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    discount: {
        type: Number, // A kedvezmény százalékban vagy fix összegben
        required: true,
        min: 0
    },
    discountType: {
        type: String,
        enum: ['fixed', 'percentage'], // Meghatározza a kedvezmény típusát
        required: true
    },
    expirationDate: {
        type: Date, // Kupon lejárati dátuma
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number, // A kupon maximális felhasználási száma
        default: null // Ha nincs limit, lehet null
    },
    timesUsed: {
        type: Number,
        default: 0 // Kezdetben nulla
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
