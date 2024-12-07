const express = require('express');
const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { verifyUser } = require('../middleware/authMiddleware');


const router = express.Router();

// Regisztráció
router.post('/register', async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*._-])(?=.*[A-Za-z]).{8,}$/;
        if (!passwordRegex.test(password)) {
        return res.status(400).json({
      message:
        'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell legalább egy számot, egy speciális karaktert (!@#$%^&*)',
        });
    } 

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Ez az email cím már használatban van.' });
        }

        const user = new User({
            name,
            email,
            password,
            phone,
            address,
        });

        await user.save();
        return res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (error) {
        console.error('Hiba történt a regisztráció során:', error);
        return res.status(500).json({ message: 'Hiba történt a regisztráció során.', error: error.message });
    }
});




// Bejelentkezés
router.post('/login', async (req, res) => {
    console.log("Belépett a bejelentkezési funkcióba");
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'A megadott email cím nem létezik.' });
        }

        const isMatch = await user.comparePassword(password.trim());
        if (!isMatch) {
            console.log('Bejelentkezési kérés jelszó:', password);
            console.log('Adatbázisból hashelt jelszó:', user.password);

            console.error('A megadott jelszó nem egyezik az adatbázisban találhatóval.');
            return res.status(400).json({ message: 'Helytelen jelszó.' });
        }

        // JWT token generálás a isAdmin mezővel együtt
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, email: user.email, name: user.name },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token, message: 'Sikeres bejelentkezés!' });
    } catch (error) {
        console.error('Hiba a bejelentkezés során:', error);
        return res.status(500).json({ message: 'Hiba történt a bejelentkezés során.', error: error.message });
    }
});

// Felhasználói adatok lekérése
router.get('/details', verifyUser, async (req, res) => {
    console.log('Token dekódolt tartalma:', req.user);
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.log('Felhasználó nem található.');
            return res.status(404).json({ message: 'Felhasználó nem található.' });
        }

        console.log('Visszaküldött felhasználói adatok:', user);
        res.status(200).json(user);
    } catch (error) {
        console.error('Hiba történt a /details végpontnál:', error);
        res.status(500).json({ message: 'Hiba történt.' });
    }
});


// Felhasználói adatok módosítása
router.put('/update', verifyUser, async (req, res) => {
    const { name, phoneNumber, address } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'A felhasználó nem található.' });
        }

        // Adatok frissítése
        user.name = name || user.name;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        if (address) {
            user.address = {
                street: address.street || user.address.street,
                city: address.city || user.address.city,
                postalCode: address.postalCode || user.address.postalCode,
            };
        }

        await user.save();
        res.status(200).json({ message: 'Adatok sikeresen frissítve.', user });
    } catch (error) {
        console.error('Hiba történt az adatok frissítésekor:', error);
        res.status(500).json({ message: 'Hiba történt az adatok frissítésekor.' });
    }
});


// Felhasználói fiók törlése
router.delete('/delete', verifyUser, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'A felhasználó nem található.' });
        }

        res.status(200).json({ message: 'A fiók sikeresen törölve.' });
    } catch (error) {
        console.error('Hiba történt a fiók törlésekor:', error);
        res.status(500).json({ message: 'Hiba történt a fiók törlésekor.' });
    }
});

router.put('/change-password', verifyUser, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Felhasználó nem található.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'A jelenlegi jelszó helytelen.' });
        }

        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Jelszó sikeresen módosítva.' });
    } catch (error) {
        console.error('Hiba történt a jelszó módosítása során:', error);
        res.status(500).json({ message: 'Hiba történt a jelszó módosítása során.' });
    }
});

// Aktuális felhasználói adatok lekérdezése
router.get('/me', verifyUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Felhasználó nem található' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hiba történt a felhasználó adatainak lekérdezésekor' });
    }
});


module.exports = router;
