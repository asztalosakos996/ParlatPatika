import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './ProductPage.css';

const ProductPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { currentUser } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAdmin = currentUser?.isAdmin;

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            try {
                const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
                if (!productResponse.ok) throw new Error('Hiba történt a termék adatainak lekérésekor.');
                const productData = await productResponse.json();
                setProduct(productData);

                const reviewsResponse = await fetch(`http://localhost:5000/api/ratings/${productId}/reviews`);
                if (!reviewsResponse.ok) throw new Error('Hiba történt az értékelések lekérésekor.');
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProductAndReviews();
    }, [productId]);

    const handleAddReview = async () => {
        if (!newReview.trim()) return;

        try {
            const response = await fetch(`http://localhost:5000/api/ratings/${productId}/reviews/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ text: newReview, rating: newRating }),
            });

            if (response.ok) {
                const addedReview = await response.json();
                setReviews((prev) => [addedReview, ...prev]);
                setNewReview('');
            }
        } catch (error) {
            console.error('Error adding review:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, { method: 'DELETE' });
            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error('Hiba a termék törlésekor:', error);
        }
    };

    if (isLoading) return <div>Betöltés...</div>;
    if (error) return <div>Hiba: {error}</div>;

    return (
        <div className="product-page-container">
            <div className="product-details-wrapper">
                <div className="product-image-section">
                    <img src={`http://localhost:5000${product.image}`} alt={product.name} className="product-image" />
                </div>
                <div className="product-details-section">
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                    <div className="product-info">
                        <p><strong>Alkoholtartalom:</strong> {product.alcoholContent}</p>
                        <p><strong>Űrtartalom:</strong> {product.bottleSize}</p>
                    </div>
                    <div className="product-price">
                        <h2>{product.price} HUF</h2>
                    </div>
                    <button className="add-to-cart-button" onClick={() => addToCart(product)}>Kosárba rakom</button>
                    {isAdmin && (
                        <div className="admin-actions">
                            <i className="fas fa-edit" title="Szerkesztés" onClick={() => navigate(`/edit-product/${productId}`)}></i>
                            <i className="fas fa-trash-alt" title="Törlés" onClick={handleDelete}></i>
                        </div>
                    )}
                </div>
            </div>

            <div className="reviews-section">
                <h2>Értékelések</h2>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <p><strong>{review.user?.username || 'Névtelen felhasználó'}</strong></p>
                            <div className="review-rating">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                            <p>{review.text}</p>
                        </div>
                    ))
                ) : (
                    <p>Nincs még értékelés.</p>
                )}
                {currentUser && (
                    <div className="add-review">
                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Írd meg a véleményed..."
                            maxLength={500}
                        />
                        <div className="rating-select">
                            <label htmlFor="rating">Értékelés:</label>
                            <select
                                id="rating"
                                value={newRating}
                                onChange={(e) => setNewRating(parseInt(e.target.value))}
                            >
                                <option value={1}>1 - Nagyon rossz</option>
                                <option value={2}>2 - Rossz</option>
                                <option value={3}>3 - Közepes</option>
                                <option value={4}>4 - Jó</option>
                                <option value={5}>5 - Kiváló</option>
                            </select>
                        </div>
                        <button onClick={handleAddReview}>Értékelés hozzáadása</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
