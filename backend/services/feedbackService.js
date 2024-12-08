const Feedback = require('../models/Feedback');

// Visszajelzés mentése adatbázisba
const saveFeedbackToDatabase = async (feedback, productId, userId) => {
    const feedbackEntry = new Feedback({
        userId,
        productId,
        feedback,
    });
    await feedbackEntry.save();
    console.log('Visszajelzés elmentve az adatbázisba:', feedbackEntry);
};

module.exports = { saveFeedbackToDatabase };
