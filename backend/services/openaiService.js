const OpenAI = require('openai');
const Product = require('../models/Product');
const Category = require('../models/Category');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API kulcs a környezeti változóból
});

async function generateProductDescription(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: `Írj egy termékleírást magyarul a következő termékről, de úgy, hogy beleférjen a 200 tokenbe: ${prompt}` }],
            max_tokens: 200,
            temperature: 0.7,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Hiba történt a leírás generálása során:", error);
        throw new Error("Nem sikerült legenerálni a termékleírást.");
    }
}

async function generateBlogContent(title) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: `Írj egy magyar nyelvű blogtartalmat a következő cím alapján: "${title}". A szöveg legyen informatív, jól strukturált, és ne haladja meg az 500 tokent.` }],
            max_tokens: 500,
            temperature: 0.7,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Hiba történt a blog tartalmának generálása során:", error);
        throw new Error("Nem sikerült legenerálni a blog tartalmát.");
    }
}

async function getCategoriesFromDatabase() {
    try {
        const categories = await Category.find({}, 'name');
        return categories.map(category => category.name);
    } catch (error) {
        console.error("Hiba történt a kategóriák lekérése során:", error);
        return [];
    }
}

async function extractCategoryFromInput(input) {
    const categoryNames = await getCategoriesFromDatabase(); // Dinamikusan lekért kategóriák
    input = input.toLowerCase();

    for (let category of categoryNames) {
        if (input.includes(category.toLowerCase())) {
            return category; // Visszaadja az adatbázisban használt kategória nevét
        }
    }
    return null;
}

async function generateProductRecommendation(userInput) {
    const categoryName = await extractCategoryFromInput(userInput);
    if (!categoryName) {
        try {
            const response = await client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: 'user', content: `Nem találtam ilyen kategóriát az adatbázisban a következő kérdés alapján: "${userInput}". Kérlek, generálj egy természetes választ magyarul, amely elmondja a felhasználónak, hogy sajnos nem tudok ilyen terméket ajánlani.` }],
                max_tokens: 100,
                temperature: 0.7,
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("Hiba történt az AI válasz generálása során:", error);
            throw new Error("Nem sikerült legenerálni a természetes választ.");
        }
    }

    try {
        const cleanedCategoryName = categoryName.trim().toLowerCase();
        const category = await Category.findOne({ name: new RegExp(`^${cleanedCategoryName}$`, 'i') });

        if (!category) {
            throw new Error(`Nem található kategória a következő névvel: ${categoryName}`);
        }

        const product = await Product.findOne({ category: category._id }).sort({ popularity: -1 }).limit(1);

        if (!product) {
            throw new Error(`Nem található termék a ${categoryName} kategóriában.`);
        }

        // Természetes nyelvű válasz generálása a termékadatokkal
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: `Ajánlj egy terméket természetes szövegkörnyezetben a következő adatok alapján: 
                Név: ${product.name}, 
                Leírás: ${product.description}, 
                Ár: ${product.price} Ft.` }],
            max_tokens: 150,
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Hiba történt a termék ajánlása során:", error);
        throw new Error("Nem sikerült legenerálni a termékajánlást.");
    }
}


module.exports = { generateProductDescription, generateProductRecommendation, generateBlogContent };
