const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    console.log('Authorization fejléc:', req.headers.authorization);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('Nincs token a kérésben');
        return res.status(401).json({ message: 'Hozzáférés megtagadva. Nincs token.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Token dekódolva:', decoded);
        req.user = decoded;
        console.log('Felhasználó azonosítója:', req.user?.id);
        next();
    } catch (error) {
        console.log('Érvénytelen token:', error.message);
        return res.status(400).json({ message: 'Érvénytelen token.' });
    }
};

module.exports = { verifyUser };
