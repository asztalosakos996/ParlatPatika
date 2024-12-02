const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const Category = require('../models/Category');

// Multer konfiguráció a fájlfeltöltéshez
const path = require('path');

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


// Kategóriák lekérése
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a kategóriák lekérésekor.' });
    }
});

// Egy kategória lekérése az ID alapján
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'A kategória nem található.' });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Hiba a kategória lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kategória lekérésekor.' });
    }
});

// Új kategória hozzáadása
router.post('/', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const newCategory = new Category({ name, imageUrl, description });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Hiba történt a kategória hozzáadásakor:', error);
        res.status(400).json({ message: 'Hiba történt a kategória hozzáadásakor.' });
    }
});

// Kategória szerkesztése
router.put('/:id', async (req, res) => {
    console.log('Request ID:', req.params.id);
    try {
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Kategória nem található.' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Hiba a kategória frissítésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kategória frissítésekor.' });
    }
});


//Kategória törlése
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategória nem található.' });
        }

        // Ellenőrizzük, hogy van-e hozzárendelt kép, és töröljük azt a fájlrendszerből
        if (category.imageUrl) {
            const imagePath = path.join(__dirname, '../', category.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Hiba történt a kép törlésekor:', err);
                } else {
                    console.log('Kép sikeresen törölve:', category.imageUrl);
                }
            });
        }

        res.status(200).json({ message: 'Kategória és a hozzátartozó kép sikeresen törölve.' });
    } catch (error) {
        console.error('Hiba a kategória törlésekor:', error);
        res.status(500).json({ message: 'Hiba történt a kategória törlésekor.' });
    }
});

module.exports = router;
