import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './FavouritesPage.css';

const FavouritesPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [favourites, setFavourites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/favourites', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setFavourites(data);
                } else {
                    console.error('Hiba a kedvencek lekérésekor:', data.message);
                }
            } catch (error) {
                console.error('Hiba a kedvencek lekérésekor:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    if (isLoading) return <div>Betöltés...</div>;

    return (
        <div className="favourites-page">
            <h1>Kedvenceim</h1>
            {favourites.length > 0 ? (
                <div className="favourites-grid">
                    {favourites.map((product) => (
                        <div key={product._id} className="product-card">
                            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                            <h2>{product.name}</h2>
                            <p>{product.price} HUF</p>
                            <Link to={`/product/${product._id}`}>Termék részletei</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Még nincsenek kedvencek.</p>
            )}
        </div>
    );
};

export default FavouritesPage;
