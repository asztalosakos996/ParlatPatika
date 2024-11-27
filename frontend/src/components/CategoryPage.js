import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Slider from 'react-slider';
import './CategoryPage.css';
import { useCart } from '../context/CartContext';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);
    const [maxPrice, setMaxPrice] = useState(20000);
    const [nameFilter, setNameFilter] = useState('');
    const [priceRange, setPriceRange] = useState([0, 20000]);
    const [typeFilter, setTypeFilter] = useState([]);
    const [originFilter, setOriginFilter] = useState([]);
    const [availableTypes, setAvailableTypes] = useState([]);
    const [availableOrigins, setAvailableOrigins] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products?category=${categoryName}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                    const highestPrice = Math.max(...data.map((product) => product.price));
                    setMaxPrice(highestPrice);
                    setAvailableTypes([...new Set(data.map((product) => product.type))]);
                    setAvailableOrigins([...new Set(data.map((product) => product.origin))]);
                    setPriceRange([0, highestPrice]);
                } else {
                    console.error('Nem egy tömb a válasz:', data);
                }
            } catch (error) {
                console.error('Hiba történt a termékek lekérésekor:', error);
            }
        };

        fetchProducts();
    }, [categoryName]);

    const handleTypeFilterChange = (type) => {
        setTypeFilter((prev) =>
            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
        );
    };

    const handleOriginFilterChange = (origin) => {
        setOriginFilter((prev) =>
            prev.includes(origin) ? prev.filter((item) => item !== origin) : [...prev, origin]
        );
    };

    const filteredProducts = products.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesType = typeFilter.length ? typeFilter.includes(product.type) : true;
        const matchesOrigin = originFilter.length ? originFilter.includes(product.origin) : true;

        return matchesName && matchesPrice && matchesType && matchesOrigin;
    });

    return (
        <div className="category-page-container">
            <div className="filters">
                <input
                    type="text"
                    placeholder="Név szerinti szűrés"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />
                <label>
                    Ár:
                    <Slider
                        min={0}
                        max={maxPrice}
                        value={priceRange}
                        onChange={(range) => setPriceRange(range)}
                        renderTrack={(props, state) => (
                            <div {...props} className="slider-track" />
                        )}
                        renderThumb={(props, state) => (
                            <div {...props} className="slider-thumb" />
                        )}
                    />
                    <div className="slider-value">
                        <span>{priceRange[0]} HUF</span> - <span>{priceRange[1]} HUF</span>
                    </div>
                </label>
                <div className="checkbox-filters">
                    <h4>Típus:</h4>
                    {availableTypes.map((type) => (
                        <label key={type}>
                            <input
                                type="checkbox"
                                onChange={() => handleTypeFilterChange(type)}
                                checked={typeFilter.includes(type)}
                            />
                            {type}
                        </label>
                    ))}
                    <h4>Származási hely:</h4>
                    {availableOrigins.map((origin) => (
                        <label key={origin}>
                            <input
                                type="checkbox"
                                onChange={() => handleOriginFilterChange(origin)}
                                checked={originFilter.includes(origin)}
                            />
                            {origin}
                        </label>
                    ))}
                </div>
            </div>
            <div className="products-grid">
                {filteredProducts.map((product) => (
                    <Link to={`/product/${product._id}`} key={product._id} className="product-card">
                        <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>{product.price} HUF</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                addToCart(product);
                            }}
                        >
                            Kosárba
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;
