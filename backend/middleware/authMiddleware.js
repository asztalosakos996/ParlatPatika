const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    console.log('Authorization fejléc:', req.headers.authorization);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('Nincs token a kérésben. A felhasználó nem bejelentkezett.');
        req.user = null; // Token hiányában a req.user legyen null
        return next(); // Engedjük tovább a kérést
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Token dekódolva:', decoded);
        req.user = decoded; // Token érvényes, req.user beállítva
        console.log('Felhasználó azonosítója:', req.user?.id);
    } catch (error) {
        console.log('Érvénytelen token:', error.message);
        req.user = null; // Érvénytelen token esetén is null a req.user
    }

    next(); // Mindig engedjük tovább a kérést
};

module.exports = { verifyUser };
