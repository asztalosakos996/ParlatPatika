const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');

dotenv.config(); // Betölti a .env fájlt a backend mappában

const productRoutes = require('./routes/productRoutes'); // Termék útvonalak importálása
const authRoutes = require('./routes/auth'); // Felhasználói útvonalak importálása
const orderRoutes = require('./routes/OrderRoutes'); // Rendelés útvonalak importálása
const categoryRoutes = require('./routes/CategoryRoutes'); // Kategória útvonalak importálása
const chatRecommendationRoutes = require('./routes/chatRecommendationRoutes');
const couponRoutes = require('./routes/couponRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const blogRoutes = require('./routes/blogRoutes');
const newsletterRoutes = require('./routes/NewletterRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware-ek
app.use(cors());
app.use(express.json()); // JSON kérések kezelése

// Helmet használata a Content Security Policy beállításához
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
        },
    })
);

// Alap útvonalak
app.get('/', (req, res) => {
    res.send('Webshop API működik!');
});

// MongoDB kapcsolat
console.log("MongoDB URL:", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB kapcsolat létrejött'))
    .catch((error) => {
        console.error('Hiba a MongoDB kapcsolódáskor:', error);
        process.exit(1); // Leállítja a szervert, ha nincs kapcsolat
    });

// Útvonalak
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRecommendationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', authRoutes);
app.use('/api/newsletter', newsletterRoutes);


// Szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut a következő porton: ${PORT}`);
});
