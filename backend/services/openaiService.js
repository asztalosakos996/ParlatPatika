const OpenAI = require('openai');
const Product = require('../models/Product');
const Category = require('../models/Category');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Közös AI válasz generáló függvény
async function generateAIResponse(prompt, maxTokens, temperature = 0.7) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Hiba történt az AI válasz generálása során:", error);
        throw new Error("Nem sikerült legenerálni az AI választ.");
    }
}

// Kategóriák lekérdezése
async function fetchCategories() {
    try {
        const categories = await Category.find({}, 'name');
        return categories.map(category => category.name.toLowerCase());
    } catch (error) {
        console.error("Hiba történt a kategóriák lekérése során:", error);
        return [];
    }
}

// Termékek lekérdezése
async function fetchTopProductByCategory(categoryName) {
    try {
        const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
        if (!category) {
            throw new Error(`Nem található kategória a következő névvel: ${categoryName}`);
        }

        const product = await Product.findOne({ category: category._id }).sort({ popularity: -1 }).limit(1);
        if (!product) {
            throw new Error(`Nem található termék a ${categoryName} kategóriában.`);
        }

        return product;
    } catch (error) {
        console.error("Hiba történt a termék lekérése során:", error);
        throw error;
    }
}

// Termékleírás generálása
async function generateProductDescription(prompt) {
    const aiPrompt = `Írj egy termékleírást magyarul a következő termékről, de úgy, hogy beleférjen a 200 tokenbe: ${prompt}`;
    return await generateAIResponse(aiPrompt, 200);
}

// Blogtartalom generálása
async function generateBlogContent(title) {
    const aiPrompt = `Írj egy magyar nyelvű blogtartalmat a következő cím alapján: "${title}". A szöveg legyen informatív, jól strukturált, és ne haladja meg az 500 tokent.`;
    return await generateAIResponse(aiPrompt, 500);
}

// Kategória kivonása bemenetből
async function extractCategoryFromInput(input) {
    const categoryNames = await fetchCategories();
    input = input.toLowerCase();

    for (let category of categoryNames) {
        if (input.includes(category)) {
            return category;
        }
    }
    return null;
}

// Termékajánló generálása
async function generateProductRecommendation(userInput) {
    const categoryName = await extractCategoryFromInput(userInput);
    if (!categoryName) {
        const aiPrompt = `Nem találtam ilyen kategóriát az adatbázisban a következő kérdés alapján: "${userInput}". Kérlek, generálj egy természetes választ magyarul, amely elmondja a felhasználónak, hogy sajnos nem tudok ilyen terméket ajánlani.`;
        return await generateAIResponse(aiPrompt, 100);
    }

    try {
        const product = await fetchTopProductByCategory(categoryName);

        const aiPrompt = `Ajánlj egy terméket természetes szövegkörnyezetben a következő adatok alapján: 
            Név: ${product.name}, 
            Leírás: ${product.description}, 
            Ár: ${product.price} Ft.`;
        return await generateAIResponse(aiPrompt, 150);
    } catch (error) {
        console.error("Hiba történt a termék ajánlása során:", error);
        throw new Error("Nem sikerült legenerálni a termékajánlást.");
    }
}

module.exports = {
    generateProductDescription,
    generateBlogContent,
    generateProductRecommendation,
};
