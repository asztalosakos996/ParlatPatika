import React, { useState, useEffect } from 'react';
import './AddProduct.css';

const AddProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [alcoholContent, setAlcoholContent] = useState('');
    const [type, setType] = useState('');
    const [origin, setOrigin] = useState('');
    const [bottleSize, setBottleSize] = useState('');
    const [image, setImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [aiLoading, setAiLoading] = useState(false); // Új állapot az AI generálásához
    const [aiError, setAiError] = useState('');

    // Kategóriák lekérése a backendtől
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                const data = await response.json();
                setCategories(data);
                console.log('Kategóriák:', data);
            } catch (error) {
                console.error('Hiba történt a kategóriák lekérésekor:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleGenerateDescription = async () => {
        setAiLoading(true);
        setAiError('');
        try {
            const response = await fetch('http://localhost:5000/api/products/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productPrompt: name }), // Az input alapján generál
            });
            const data = await response.json();
            if (response.ok) {
                setDescription(data.description);
            } else {
                setAiError(data.message || 'Hiba történt a leírás generálása során.');
            }
        } catch (error) {
            setAiError('Hiba történt a leírás generálása során.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('alcoholContent', alcoholContent);
        formData.append('type', type);
        formData.append('origin', origin);
        formData.append('bottleSize', bottleSize);
        if (image) {
            formData.append('image', image);
        }

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSuccessMessage('Termék sikeresen hozzáadva!');
                setName('');
                setPrice('');
                setCategory('');
                setDescription('');
                setAlcoholContent('');
                setType('');
                setOrigin('');
                setBottleSize('');
                setImage(null);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Hiba történt a termék létrehozásakor.');
            }
        } catch (err) {
            setErrorMessage('Hiba történt a termék létrehozásakor.');
        }
    };

    return (
        <div className="add-product-form">
            <h2>Új Termék Létrehozása</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <label>Termék neve:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label>Ár:</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <label>Kategória:</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">Válasszon kategóriát</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>

                <label>Leírás:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
                <button type="button" onClick={handleGenerateDescription} disabled={aiLoading}>
                    {aiLoading ? 'Generálás folyamatban...' : 'AI Leírás Generálása'}
                </button>
                {aiError && <p className="error-message">{aiError}</p>}

                <label>Alkohol tartalom (%):</label>
                <input
                    type="number"
                    value={alcoholContent}
                    onChange={(e) => setAlcoholContent(e.target.value)}
                    required
                />

                <label>Típus:</label>
                <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                />

                <label>Származási hely:</label>
                <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                />

                <label>Palack méret (pl. 500ml):</label>
                <input
                    type="text"
                    value={bottleSize}
                    onChange={(e) => setBottleSize(e.target.value)}
                    required
                />

                <label>Kép:</label>
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                <button type="submit">Termék Hozzáadása</button>
            </form>
        </div>
    );
};

export default AddProduct;
