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

async function fetchFlavourNotes() {
    try {
        // Az összes egyedi ízjegy kinyerése a termékekből
        const flavourNotes = await Product.distinct('flavourNotes');
        console.log("Lekért ízjegyek (egyben):", flavourNotes);

        // Szavakra bontás és duplikációk eltávolítása
        const uniqueNotes = Array.from(new Set(
            flavourNotes
                .flatMap(note => note.split(',').map(n => n.trim())) // Szétbontás vessző szerint és trimelés
                .map(note => removeAccents(note.toLowerCase())) // Normalizálás: kisbetűs, ékezet nélkül
        ));

        console.log("Egyedi ízjegyek:", uniqueNotes);
        return uniqueNotes;
    } catch (error) {
        console.error('Hiba történt az ízjegyek lekérése során:', error);
        return [];
    }
}



// Termékek lekérdezése több paraméter alapján
async function fetchTopProductByCategory(details = {}) {
    try {
        const query = {};

        // Kategória hozzáadása a lekérdezéshez (ha van megadva)
        if (details.category) {
            const category = await Category.findOne({ name: new RegExp(`^${details.category}$`, 'i') });
            if (category) {
                query.category = category._id;
            }
        }

        // Árintervallum hozzáadása a lekérdezéshez (ha van megadva)
        if (details.minPrice !== undefined || details.maxPrice !== undefined) {
            query.price = {};
            if (details.minPrice !== undefined) query.price.$gte = details.minPrice;
            if (details.maxPrice !== undefined) query.price.$lte = details.maxPrice;
        }

        // Származási hely hozzáadása a lekérdezéshez (ha van megadva)
        if (details.origin) {
            const normalizedOrigin = removeAccents(details.origin.toLowerCase());
            query.origin = new RegExp(`^${normalizedOrigin}$`, 'i');
        }

        console.log("Generált MongoDB lekérdezés:", query);

        // Termékek lekérdezése az eddigi szűrők alapján
        const allProducts = await Product.find(query).lean();

        // Ízjegyek szűrése (ha vannak megadva)
        if (details.flavourNotes && details.flavourNotes.length) {
            const normalizedFlavourNotes = details.flavourNotes.map(note => removeAccents(note.toLowerCase()));
            const filteredProducts = allProducts.filter(product => {
                const productNotes = Array.isArray(product.flavourNotes)
                    ? product.flavourNotes
                    : product.flavourNotes.split(',').map(n => n.trim());
        
                const normalizedProductNotes = productNotes.map(note => removeAccents(note.toLowerCase()));
                
                return normalizedFlavourNotes.some(note => normalizedProductNotes.includes(note));
            });

            if (filteredProducts.length > 0) {
                console.log("Ízjegyek alapján szűrt termékek:", filteredProducts);
                return filteredProducts.sort((a, b) => b.popularity - a.popularity)[0];
            }
        }

        // Ha nincs találat az ízjegyek szűrése után, az összes terméket visszaadjuk
        if (allProducts.length === 0) {
            throw new Error("Nem található termék a megadott feltételek alapján.");
        }

        // Népszerűség alapján rendezés és az első termék visszaadása
        return allProducts.sort((a, b) => b.popularity - a.popularity)[0];
    } catch (error) {
        console.error("Hiba történt a termék lekérése során:", error.message);
        throw error;
    }
}




// Termékleírás generálása
async function generateProductDescription(prompt) {
    const aiPrompt = `Írj egy termékleírást magyarul a következő termékről, legalább 3 mondatban úgy, hogy a későbbiekben relevánsan felhasználható legyen az 
    AI segéd tanulásához, illetve tartalmazza az ízjgyeket is: ${prompt}. Majd egy sörtörés után új bekezdésben írd le, hogy kinek ajánljuk.`;
    
    const fullDescription = await generateAIResponse(aiPrompt, 500);

    // Az AI által generált válaszból különítsük el az ízjegyeket (ha szükséges)
    const flavourNotesPrompt = `Kérlek, listázd az ízjegyeket a következő termékleírás alapján: "${fullDescription}". Az eredmény legyen egy vesszővel elválasztott lista, például: citrusos, vaníliás, fűszeres. Pontosan 3 ízjegyet sorolj fel.`;
    const flavourNotes = await generateAIResponse(flavourNotesPrompt, 100);

    return {
        description: fullDescription,
        flavourNotes: flavourNotes, // Ízjegyek külön generálva
    };
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

    // Kategóriák, származási helyek és ízjegyek lekérése
    const categoryNames = await fetchCategories();
    const origins = await fetchOrigins();
    const flavourNotes = await fetchFlavourNotes();
    const normalizedOrigins = origins.map(origin => removeAccents(origin.toLowerCase())); // Ékezetek eltávolítása
    console.log("A normalizált origin:", normalizedOrigins);

    const details = {}; // Az összegyűjtött adatok tárolására

    // Input előfeldolgozása
    input = removeAccents(input.toLowerCase().replace(/[.,!?]/g, '').trim());
    console.log("Tisztított input:", input);

    // Árintervallum keresés
    const priceUnderMatch = input.match(/(\d+)\s*(ft|forint)\s*(alatt)/i);
    const priceAboveMatch = input.match(/(\d+)\s*(ft|forint)\s*(felett)/i);
    const priceBetweenMatch = input.match(/(\d+)\s*(ft|forint)\s*(és)\s*(\d+)\s*(ft|forint)/i);

    if (priceUnderMatch) {
        details.maxPrice = parseInt(priceUnderMatch[1]);
    } else if (priceAboveMatch) {
        details.minPrice = parseInt(priceAboveMatch[1]);
    } else if (priceBetweenMatch) {
        details.minPrice = parseInt(priceBetweenMatch[1]);
        details.maxPrice = parseInt(priceBetweenMatch[4]);
    }

    // Ízjegyek keresése
    const foundFlavourNotes = flavourNotes.filter(note => input.includes(note));
    if (foundFlavourNotes.length) {
        details.flavourNotes = foundFlavourNotes;
    }

    // Származási hely keresés
    const originRegex = new RegExp(
        `(${normalizedOrigins.join('|')})(ból|ből|ról|ről|ba|be|ra|re|on|en|ön|tól|től|hoz|hez|höz)?`,
        'i'
    );
    const locationMatch = input.match(originRegex);
    console.log("Origin regex találat:", locationMatch);

    if (locationMatch) {
        details.origin = locationMatch[1].trim(); // Csak az alap nevet vesszük ki (pl. "Németország")
    }

    // Kategóriák keresése szinonimák és adatbázis alapján
    for (const [canonicalCategory, aliasList] of Object.entries(synonyms)) {
        if (aliasList.some(alias => input.includes(alias))) {
            details.category = canonicalCategory;
            break;
        }
    }

    // Ha szinonimák alapján nincs találat, ellenőrizzük az adatbázis kategóriáit
    if (!details.category) {
        for (let category of categoryNames) {
            if (input.includes(category)) {
                details.category = category;
                break;
            }
        }
    }

    // Összegyűjtött adatok naplózása
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

    // Ellenőrizzük, hogy van-e bármilyen keresési paraméter
    if (Object.keys(details).length === 0) {
        console.warn(`Nem találtam keresési feltételeket az input alapján: "${userInput}"`);
        return {
            type: 'error',
            message: `Nem találtam keresési feltételeket az input alapján. Kérlek, próbálj meg pontosabb kérést megadni!`
        };
    }

    try {
        // Termékek keresése a megadott feltételek alapján
        const product = await fetchTopProductByCategory(details);

        // Ha nincs megfelelő termék
        if (!product) {
            return {
                type: 'noProduct',
                message: `Sajnos nem találtam terméket a megadott feltételek alapján. Próbálj másik származási helyet, kategóriát, árintervallumot vagy ízjegyet megadni!`
            };
        }

        // Ha találat van, visszakérdez a felhasználónál
        return {
            type: 'productRecommendation',
            message: `Ajánlom neked a következő terméket: ${product.name}. Ez egy ${product.description}, amelynek ára: ${product.price} Ft. Megfelel ez neked, vagy keressek mást?`,
            productId: product._id,
            productName: product.name,
            productPrice: product.price,
            followUp: {
                question: 'Ha tetszik a termék, szeretnéd, hogy hozzáadjam a kosaradhoz?',
                actions: [
                    {
                        label: 'Igen, tedd a kosárba!',
                        action: 'addToCart',
                        payload: { productId: product._id, productName: product.name, productPrice: product.price }
                    },
                    /*{
                        label: 'Nem, keress mást.',
                        action: 'searchAgain'
                    }*/
                ]
            }
        };
    } catch (error) {
        console.error("Hiba történt termékajánlás közben:", error);
        return {
            type: 'error',
            message: `Sajnálom, valami probléma történt a termékajánlás során. Kérlek, próbálkozz később!`
        };
    }
}



module.exports = {
    generateProductDescription,
    generateBlogContent,
    generateProductRecommendation,
};