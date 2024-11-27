import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PopularProducts.css';

const PopularProducts = () => {
    const [products, setProducts] = useState([]);
    const trackRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentTranslate = useRef(0);
    const prevTranslate = useRef(0);
    const productWidth = 300; // Egy termék szélessége

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();

                // Véletlenszerűen kiválaszt 10 terméket
                const shuffledProducts = data.sort(() => 0.5 - Math.random());
                const selectedProducts = shuffledProducts.slice(0, 10);

                // Duplikáljuk a termékeket a végtelen görgetés érdekében
                setProducts([...selectedProducts, ...selectedProducts]);
            } catch (error) {
                console.error('Hiba a termékek lekérésekor:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleDragStart = (clientX) => {
        isDragging.current = true;
        startX.current = clientX;
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        prevTranslate.current = currentTranslate.current;
    };

    const handleDragMove = (clientX) => {
        if (!isDragging.current) return;
        const movement = clientX - startX.current;
        currentTranslate.current = prevTranslate.current + movement;
        trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
    };

    const handleMouseDown = (e) => handleDragStart(e.clientX);
    const handleMouseMove = (e) => handleDragMove(e.clientX);
    const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);

    const scrollLeft = () => {
        currentTranslate.current -= productWidth; // Balra görgetés
        trackRef.current.style.transition = 'transform 0.3s ease-in-out';
        trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
        prevTranslate.current = currentTranslate.current;
    };

    const scrollRight = () => {
        currentTranslate.current += productWidth; // Jobbra görgetés
        trackRef.current.style.transition = 'transform 0.3s ease-in-out';
        trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
        prevTranslate.current = currentTranslate.current;
    };

    const handleTransitionEnd = () => {
        const productCount = products.length / 2; // Eredeti termékek száma

        // Ha túlmentünk az utolsó terméken (duplikált tartalom vége)
        if (currentTranslate.current <= -productWidth * productCount) {
            currentTranslate.current = 0; // Vissza az elejére
            trackRef.current.style.transition = 'none'; // Kikapcsoljuk az animációt
            trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
            prevTranslate.current = currentTranslate.current;
        }

        // Ha az elején vagyunk és visszafelé mentünk (duplikált tartalom eleje)
        if (currentTranslate.current > 0) {
            currentTranslate.current = -productWidth * productCount;
            trackRef.current.style.transition = 'none'; // Kikapcsoljuk az animációt
            trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
            prevTranslate.current = currentTranslate.current;
        }
    };

    return (
        <div className="popular-products">
            <h2>Népszerű Termékek</h2>
            <button className="scroll-button left" onClick={scrollLeft}>
                &lt;
            </button>
            <div className="product-slider">
                <div
                    className="product-track"
                    ref={trackRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleDragEnd}
                    onTouchMove={handleTouchMove}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {products.map((product, index) => (
                        <Link 
                            to={`/product/${product._id}`} 
                            key={index} 
                            className="product-tile"
                        >
                            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{product.price.toLocaleString()} Ft</p>
                        </Link>
                    ))}
                </div>
            </div>
            <button className="scroll-button right" onClick={scrollRight}>
                &gt;
            </button>
        </div>
    );
};

export default PopularProducts;
