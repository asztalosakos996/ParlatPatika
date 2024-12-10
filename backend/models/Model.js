const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    architecture: { type: Object, required: true },
    weights: { type: [Object], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Model', modelSchema);
