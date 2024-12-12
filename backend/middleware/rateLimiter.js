const rateLimit = require('express-rate-limit');

// Egyedi hibaüzenet a limiterhez
const limiterHandler = (req, res, next, options) => {
    res.status(options.statusCode).json({
        message: 'Túl sok próbálkozás történt. Próbálja újra később!',
    });
};

// Regisztráció limiter
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 óra
    max: 5, // Maximum 5 próbálkozás óránként
    handler: limiterHandler,
});

// Bejelentkezés limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 perc
    max: 10, // Maximum 10 próbálkozás
    handler: limiterHandler,
});

module.exports = { registerLimiter, loginLimiter };
