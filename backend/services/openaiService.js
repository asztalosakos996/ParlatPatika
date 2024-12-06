const OpenAI = require('openai');
const mongoose = require('mongoose');
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

// Szinonimák kezelése
const synonyms = {
    gin: ["gin", "gines italok", "ginfélék"],
    whiskey: ["whiskey", "whisky", "whiskeys"],
    rum: ["rum", "rummok", "rums"],
    // További kategóriák és szinonimák hozzáadása
};

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Kategóriák lekérdezése az adatbázisból
async function fetchCategories() {
    try {
        const categories = await Category.find({}, 'name');
        return categories.map(category => category.name.toLowerCase());
    } catch (error) {
        console.error("Hiba történt a kategóriák lekérése során:", error);
        return [];
    }
}

// Származási helyek lekérdezése az adatbázisból
async function fetchOrigins() {
    try {
        const origins = await Product.distinct('origin');
        console.log("Lekért origin értékek:", origins);
        return origins.map(origin => origin.toLowerCase().trim());
    } catch (error) {
        console.error('Hiba történt az origin értékek lekérése során:', error);
        return [];
    }
}

// Termékek lekérdezése több paraméter alapján
async function fetchTopProductByCategory(categoryName, details = {}) {
    try {
        const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
        if (!category) {
            throw new Error(`Nem található kategória a következő névvel: ${categoryName}`);
        }

        console.log("Lekért kategória ID:", category._id);
        console.log("Kapott details objektum:", details);

        // Alapértelmezett árértékek
        const minPrice = details.minPrice || 0;
        const maxPrice = details.maxPrice || Infinity;

        // Lekérdezés az összes termékre a kategórián belül
        const allProducts = await Product.find({
            category: category._id,
            price: { $gte: minPrice, $lte: maxPrice },
        });

        console.log("Összes termék:", allProducts);

        // JavaScript szinten szűrés az origin alapján
        const normalizedOrigin = removeAccents(details.origin?.toLowerCase() || "");
        const filteredProducts = allProducts.filter(product => {
            const productOrigin = removeAccents(product.origin.toLowerCase());
            return productOrigin === normalizedOrigin;
        });

        console.log("Szűrt termékek az origin alapján:", filteredProducts);

        if (filteredProducts.length === 0) {
            throw new Error(`Nem található termék a ${categoryName} kategóriában.`);
        }

        // Népszerűség alapján rendezzük és az első terméket adjuk vissza
        return filteredProducts.sort((a, b) => b.popularity - a.popularity)[0];
    } catch (error) {
        console.error("Hiba történt a termék lekérése során:", error.message);
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

// Kategória és részletek kivonása bemenetből
async function extractDetailsFromInput(input) {
    if (typeof input !== 'string') {
        throw new TypeError(`Invalid input: expected a string but received ${typeof input}`);
    }

    const categoryNames = await fetchCategories(); // Kategóriák lekérése
    const origins = await fetchOrigins(); // Származási helyek lekérése
    const normalizedOrigins = origins.map(origin => removeAccents(origin.toLowerCase())); // Ékezetek eltávolítása
    console.log("A normalizált origin:", normalizedOrigins);
    const details = {};

    // Input előfeldolgozása (kisbetűsítés, ékezetek eltávolítása)
    input = removeAccents(input.toLowerCase().replace(/[.,!?]/g, '').trim());
    console.log("Tisztított input:", input);

    // Árintervallum keresés
    const priceMatch = input.match(/(\d+)-(\d+)/);
    if (priceMatch) {
        details.minPrice = parseInt(priceMatch[1]);
        details.maxPrice = parseInt(priceMatch[2]);
    }

    // Származási hely keresés az adatbázis alapján
    const originRegex = new RegExp(
        `(${normalizedOrigins.join('|')})(ból|ből|ról|ről|ba|be|ra|re|on|en|ön|tól|től|hoz|hez|höz)?`,
        'i'
    );

    const locationMatch = input.match(originRegex);
    console.log("Origin regex találat:", locationMatch);

    if (locationMatch) {
        details.origin = locationMatch[1].trim(); // Csak az alap nevet vesszük ki (pl. "Németország")
    }

    // Kategória keresés szinonimák alapján
    for (const [canonicalCategory, aliasList] of Object.entries(synonyms)) {
        if (aliasList.some(alias => input.includes(alias))) {
            details.category = canonicalCategory;
            break;
        }
    }

    // Ha nem találunk szinonimát, ellenőrizzük az adatbázis kategóriáit
    if (!details.category) {
        for (let category of categoryNames) {
            if (input.includes(category)) {
                details.category = category;
                break;
            }
        }
    }

    console.log("Kinyert details objektum a bemenetfeldolgozás után:", details);
    return details;
}


// Termékajánló generálása
async function generateProductRecommendation(userInput) {
    let details;

    // Ha az userInput objektum, az `input` mezőt vesszük ki
    if (typeof userInput === 'object' && userInput.input) {
        userInput = userInput.input;
    }

    // Ellenőrizzük, hogy az input szöveg
    if (typeof userInput === 'string') {
        details = await extractDetailsFromInput(userInput);
    } else {
        throw new TypeError(`Invalid input: expected a string but received ${typeof userInput}`);
    }

    console.log("Kinyert details objektum:", details);

    if (!details.category) {
        console.warn(`Nem találtam kategóriát az input alapján: "${userInput}"`);
        const aiPrompt = `Nem találtam ilyen kategóriát az adatbázisban a következő kérdés alapján: "${userInput}". Kérlek, generálj egy természetes választ magyarul, amely elmondja a felhasználónak, hogy sajnos nem tudok ilyen terméket ajánlani.`;
        return await generateAIResponse(aiPrompt, 100);
    }

    try {
        const product = await fetchTopProductByCategory(details.category, details);

        const aiPrompt = `Ajánlj egy terméket természetes szövegkörnyezetben a következő adatok alapján: 
            Név: ${product.name}, 
            Leírás: ${product.description}, 
            Ár: ${product.price} Ft.`;
        const productRecommendation = await generateAIResponse(aiPrompt, 150);

        return productRecommendation;
    } catch (error) {
        if (error.message.includes("Nem található termék")) {
            return `Sajnos jelenleg nem található termék a ${details.category} kategóriában. Kérlek, próbálj másik kategóriát!`;
        }
        throw error;
    }
}

module.exports = {
    generateProductDescription,
    generateBlogContent,
    generateProductRecommendation,
};