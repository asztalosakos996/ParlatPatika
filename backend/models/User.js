const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        street: { type: String, required: true },
        postalCode: { type: String, required: true },
        city: { type: String, required: true },
    },
    taxNumber: {
        type: String,
        required: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

// Jelszó hash-elése regisztrációkor
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        console.log('Jelszó hash-elése előtt:', this.password);
        this.password = await argon2.hash(this.password);
        console.log('Hashelt jelszó:', this.password);
        next();
    } catch (err) {
        console.error('Hiba történt a jelszó hash-elése során:', err);
        next(err);
    }
});

// Jelszó ellenőrzése belépéskor
userSchema.methods.comparePassword = async function (password) {
    try {
        console.log('Beérkező jelszó ellenőrzéshez:', password);
        console.log('Adatbázisban tárolt jelszó:', this.password);
        const isMatch = await argon2.verify(this.password, password);
        console.log('Jelszó egyezés:', isMatch);
        return isMatch;
    } catch (err) {
        console.error('Hiba történt a jelszó ellenőrzése során:', err);
        throw new Error('Jelszó ellenőrzése során hiba történt.');
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
