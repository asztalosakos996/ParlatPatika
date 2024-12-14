const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    console.log('Authorization fejléc:', req.headers.authorization);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('Nincs token a kérésben. A felhasználó nem bejelentkezett.');
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Token dekódolva:', decoded);
        req.user = decoded;
    } catch (error) {
        console.log('Érvénytelen token:', error.message);
        req.user = null;
    }

    next();
};

module.exports = { verifyUser };
