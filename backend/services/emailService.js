const nodemailer = require('nodemailer');

// Nodemailer konfiguráció
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Rendelési visszaigazolás e-mail küldése
const sendOrderConfirmation = async (email, orderDetails) => {
    const mailOptions = {
        from: '"Prémium Ital Webáruház" <your-email@gmail.com>',
        to: email,
        subject: 'Sikeres rendelés visszaigazolás',
        html: `
            <h1>Köszönjük a rendelésed!</h1>
            <p>Kedves Vásárló,</p>
            <p>Sikeresen leadtad a rendelésed. Az alábbiakban megtalálod a rendelési információkat:</p>
            <ul>
                ${orderDetails.items.map(item => `
                    <li>${item.name} - ${item.quantity} db - ${item.price} HUF</li>
                `).join('')}
            </ul>
            <p><strong>Összesen:</strong> ${orderDetails.totalAmount} HUF</p>
            <p>Számlázási cím: ${orderDetails.contactInfo.address}</p>
            <p>Köszönjük, hogy a Prémium Ital Webáruházat választottad!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail elküldve: ${email}`);
    } catch (error) {
        console.error('Hiba az e-mail küldésekor:', error.message);
        throw new Error('Nem sikerült elküldeni a rendelési visszaigazolást.');
    }
};

// Kapcsolati űrlap üzenet e-mail küldése
const sendContactMessage = async (formData) => {
    const mailOptions = {
        from: `"Kapcsolati Üzenet" <${formData.email}>`,
        to: process.env.EMAIL_USER, 
        subject: `Kapcsolati üzenet: ${formData.subject}`,
        html: `
            <h1>Új üzenet a kapcsolati űrlapról</h1>
            <p><strong>Név:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Téma:</strong> ${formData.subject}</p>
            <p><strong>Üzenet:</strong></p>
            <p>${formData.message}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Kapcsolati üzenet elküldve: ${formData.email}`);
    } catch (error) {
        console.error('Hiba az üzenet küldésekor:', error.message);
        throw new Error('Nem sikerült elküldeni az üzenetet.');
    }
};

module.exports = { sendOrderConfirmation, sendContactMessage };
