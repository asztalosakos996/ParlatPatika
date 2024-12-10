import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProductPage.css';

const EditProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: '',
        description: '',
        flavourNotes: '',
        price: '',
        alcoholContent: '',
        type: '',
        origin: '',
        bottleSize: '',
        category: '',
    });

    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError('Nem sikerült betölteni a terméket.');
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError('Nem sikerült betölteni a kategóriákat.');
            }
        };

        fetchProduct();
        fetchCategories();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        Object.keys(product).forEach((key) => {
            if (key === 'category' && typeof product[key] === 'object') {
                formData.append(key, product[key]._id);
            } else {
                formData.append(key, product[key]);
            }
        });

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

            alert('Termék sikeresen frissítve!');
            navigate(`/product/${productId}`);
        } catch (err) {
            setError('Hiba történt a frissítés során.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-product-container">
            <h2 className="edit-product-title">Termék szerkesztése</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="edit-product-form" onSubmit={handleSubmit}>
                <label className="form-label">
                    Név:
                    <input
                        className="form-input"
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="form-label">
                    Leírás:
                    <textarea
                        className="form-textarea"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="form-label">
                    Ízjegyek:
                    <textarea
                        className="form-textarea"
                        name="flavourNotes"
                        value={product.flavourNotes}
                        onChange={handleChange}
                        placeholder="Add meg az ízjegyeket (pl. citrus, vanília, fűszeres)"
                    />
                </label>
                <label className="form-label">
                    Ár:
                    <input
                        className="form-input"
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="form-label">
                    Alkoholtartalom:
                    <input
                        className="form-input"
                        type="number"
                        name="alcoholContent"
                        value={product.alcoholContent}
                        onChange={handleChange}
                    />
                </label>
                <label className="form-label">
                    Típus:
                    <input
                        className="form-input"
                        type="text"
                        name="type"
                        value={product.type}
                        onChange={handleChange}
                    />
                </label>
                <label className="form-label">
                    Származási hely:
                    <input
                        className="form-input"
                        type="text"
                        name="origin"
                        value={product.origin}
                        onChange={handleChange}
                    />
                </label>
                <label className="form-label">
                    Űrtartalom:
                    <input
                        className="form-input"
                        type="text"
                        name="bottleSize"
                        value={product.bottleSize}
                        onChange={handleChange}
                    />
                </label>
                <label className="form-label">
                    Kategória:
                    <select
                        className="form-select"
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                    >
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="form-label">
                    Kép feltöltése:
                    <input
                        className="form-file-input"
                        type="file"
                        onChange={handleImageChange}
                    />
                </label>
                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? 'Mentés folyamatban...' : 'Mentés'}
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;
