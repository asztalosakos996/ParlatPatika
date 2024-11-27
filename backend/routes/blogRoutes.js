const express = require('express');
const multer = require('multer');
const router = express.Router();
const Blog = require('../models/Blog'); // Blog modell
const { generateBlogContent } = require('../services/openaiService');

// Multer konfiguráció (opcionális, ha képet is feltöltesz a bloghoz)
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
const upload = multer({ storage });

// Blogok listázása
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }); // Legfrissebbek elöl
        res.status(200).json(blogs);
    } catch (error) {
        console.error('Hiba a blogok lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a blogok lekérésekor.' });
    }
});

// Egy blog lekérése ID alapján
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog nem található.' });
        }
        res.status(200).json(blog);
    } catch (error) {
        console.error('Hiba a blog lekérésekor:', error);
        res.status(500).json({ message: 'Hiba történt a blog lekérésekor.' });
    }
});

// Új blog létrehozása
router.post('/', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const newBlog = new Blog({ title, content, imageUrl });
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        console.error('Hiba a blog létrehozásakor:', error);
        res.status(400).json({ message: 'Hiba történt a blog létrehozásakor.' });
    }
});

// Blog szerkesztése
router.put('/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog nem található.' });
        }

        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error('Hiba a blog frissítésekor:', error);
        res.status(500).json({ message: 'Hiba történt a blog frissítésekor.' });
    }
});

// Blog törlése
router.delete('/:id', async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog nem található.' });
        }
        res.status(200).json({ message: 'Blog sikeresen törölve.' });
    } catch (error) {
        console.error('Hiba a blog törlésekor:', error);
        res.status(500).json({ message: 'Hiba történt a blog törlésekor.' });
    }
});

// Blog tartalom generálása
router.post('/generate-content', async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'A blog címét meg kell adni.' });
    }

    try {
        const content = await generateBlogContent(title);
        res.status(200).json({ content });
    } catch (error) {
        console.error('Hiba történt a blog tartalom generálása során:', error);
        res.status(500).json({ message: 'Nem sikerült legenerálni a blog tartalmát.' });
    }
});

module.exports = router;
