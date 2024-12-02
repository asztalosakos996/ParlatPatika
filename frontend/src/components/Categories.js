import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                const data = await response.json();
                console.log('Kategóriák:', data);
                setCategories(data);
            } catch (error) {
                console.error('Hiba történt a kategóriák lekérésekor:', error);
            }
        };
    
        fetchCategories();
    }, []);

    return (
        <div className="categories-container">
            <h2>Kategóriák</h2>
            <div className="categories-grid">
                {categories.map((category, index) => (
                    <Link to={`/category/${category.name}`} key={index} className="category-card">
                        <img src={`http://localhost:5000${category.imageUrl}`} alt={category.name} />
                        <h3>{category.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
