const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // createdAt, updatedAt mezők automatikusan generálva
    }
);

module.exports = mongoose.model('Blog', blogSchema);
