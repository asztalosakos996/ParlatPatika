const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { generateProductDescription } = require('../services/openaiService'); // Új: AI szolgáltatás importálása

const router = express.Router();
const fs = require('fs');
const path = require('path');
const ObjectId = mongoose.Types.ObjectId;

// Multer konfiguráció a fájlok tárolásához
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Új termék létrehozása
router.post('/', upload.single('image'), async (req, res) => {
    // Console.log a kérés adatainak naplózásához
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { name, description, price, alcoholContent, type, origin, bottleSize, category } = req.body;
    console.log('Category ID received:', category); // Külön naplózás a category ID-hoz

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
            console.log('Category not found');
            return res.status(400).json({ message: 'A kategória nem található.' });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            image: imageUrl,
            alcoholContent,
            type,
            origin,
            bottleSize,
            category: categoryDoc._id,
        });

        const savedProduct = await newProduct.save();
        console.log('Product saved successfully:', savedProduct);
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error while saving product:', err);
        res.status(500).json({ message: err.message });
    }
});

// Termék törlése ID alapján
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Termék nem található.' });
        }

        // Ellenőrizzük, hogy van-e kép a termékhez, és töröljük azt a fájlrendszerből
        if (product.image) {
            const imagePath = path.join(__dirname, '../', product.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Hiba történt a kép törlésekor:', err);
                } else {
                    console.log('Kép sikeresen törölve:', product.image);
                }
            });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Termék és a hozzátartozó kép sikeresen törölve.' });
    } catch (error) {
        console.error('Hiba a termék törlésekor:', error);
        res.status(500).json({ message: 'Hiba történt a termék törlésekor.' });
    }
});

// Termék módosítása ID alapján
// PUT kérés a termék frissítéséhez
router.put('/:id', upload.single('image'), async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);

    try {
        const { id } = req.params;
        const { name, description, price, alcoholContent, type, origin, bottleSize, category } = req.body;

        const updatedProduct = {
            name,
            description,
            price,
            alcoholContent,
            type,
            origin,
            bottleSize,
        };

        // Ellenőrzés és átalakítás a megfelelő formátumra
        if (category && typeof category === 'string') {
            updatedProduct.category = new mongoose.Types.ObjectId(category);
        } else if (category && category._id) {
            updatedProduct.category = new mongoose.Types.ObjectId(category._id);
        }

        if (req.file) {
            updatedProduct.image = `/uploads/${req.file.filename}`;
        }

        const result = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });

        if (!result) {
            return res.status(404).json({ message: 'Termék nem található.' });
        }

        console.log('Product updated data:', result);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: err.message });
    }
});

// Termékek lekérése kategória szerint
router.get('/', async (req, res) => {
    const { category } = req.query;

    try {
        let query = {};
        if (category) {
            const categoryDoc = await Category.findOne({ name: category });
            if (!categoryDoc) {
                return res.status(404).json({ message: 'Kategória nem található' });
            }
            query.category = categoryDoc._id;
        }

        const products = await Product.find(query).populate('category');
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Termék lekérése ID alapján
// Termék lekérése ID alapján, értékelésekkel együtt
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate({
                path: 'ratings', // Feltételezve, hogy a termék modellben van egy `ratings` mező, ami a kapcsolódó értékeléseket tartalmazza
                populate: { path: 'user', select: 'username' } // Feltételezve, hogy az értékelés tartalmaz user ID-t
            });
        if (!product) {
            return res.status(404).json({ message: 'Termék nem található' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Keresési API
router.post('/search', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Keresési kifejezés szükséges' });
    }

    try {
        const results = await Product.find({ name: { $regex: query, $options: 'i' } }).limit(10); // Max 10 találat
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Hiba történt a keresés során', error: err.message });
    }
});


// Új: AI által generált leírás végpont
router.post('/generate-description', async (req, res) => {
    const { productPrompt } = req.body;
    try {
        const description = await generateProductDescription(productPrompt);
        res.status(200).json({ description });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
