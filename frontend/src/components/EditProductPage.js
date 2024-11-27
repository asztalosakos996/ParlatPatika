import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        alcoholContent: '',
        type: '',
        origin: '',
        bottleSize: '',
        category: ''
    });
    const [categories, setCategories] = useState([]); // Kategóriák állapota
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Termék betöltése
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Nem sikerült betölteni a terméket.');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            }
        };

        // Kategóriák betöltése
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Nem sikerült betölteni a kategóriákat:', err);
            }
        };

        fetchProduct();
        fetchCategories();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in product) {
            if (key === 'category' && typeof product[key] === 'object' && product[key]._id) {
                // Csak az _id értéket küldi el, ha az objektum
                formData.append(key, product[key]._id);
            } else {
                formData.append(key, product[key]);
            }
        }
        if (image) {
            formData.append('image', image);
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'PUT',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Nem sikerült frissíteni a terméket.');
            }
            alert('Termék sikeresen frissítve.');
            navigate(`/product/${productId}`);
        } catch (err) {
            setError(err.message);
        }
    };
    

    return (
        <div>
            <h1>Termék szerkesztése</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Név:
                    <input type="text" name="name" value={product.name} onChange={handleChange} required />
                </label>
                <label>
                    Leírás:
                    <textarea name="description" value={product.description} onChange={handleChange} required />
                </label>
                <label>
                    Ár:
                    <input type="number" name="price" value={product.price} onChange={handleChange} required />
                </label>
                <label>
                    Alkoholtartalom:
                    <input type="number" name="alcoholContent" value={product.alcoholContent} onChange={handleChange} />
                </label>
                <label>
                    Típus:
                    <input type="text" name="type" value={product.type} onChange={handleChange} />
                </label>
                <label>
                    Származási hely:
                    <input type="text" name="origin" value={product.origin} onChange={handleChange} />
                </label>
                <label>
                    Űrtartalom:
                    <input type="text" name="bottleSize" value={product.bottleSize} onChange={handleChange} />
                </label>
                <label>
                    Kategória:
                    <select
                        name="category"
                        value={product.category._id || product.category} // Ha van `_id`, azt használja
                        onChange={handleChange}
                    >
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Kép:
                    <input type="file" onChange={handleImageChange} />
                </label>
                <button type="submit">Mentés</button>
            </form>
        </div>
    );
};

export default EditProductPage;
