const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Token az Authorization headerből

    if (!token) {
        console.log('Nincs token a kérésben');
        return res.status(401).json({ message: 'Hozzáférés megtagadva. Nincs token.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Titkos kulcs
        console.log('Token dekódolva:', decoded); // Dekódolt token logolása
        req.user = decoded; // A dekódolt felhasználói információk
        next(); // Folytatódhat a kérés
    } catch (error) {
        console.log('Érvénytelen token:', error.message); // Hibaüzenet logolása
        return res.status(400).json({ message: 'Érvénytelen token.' });
    }
};

module.exports = { verifyUser };
