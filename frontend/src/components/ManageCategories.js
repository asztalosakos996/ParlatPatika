import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageCategories.css';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Kategóriák lekérdezése az API-ból
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Hiba a kategóriák lekérésekor:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Biztosan törölni szeretnéd ezt a kategóriát?');
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setCategories(categories.filter((category) => category._id !== id));
                alert('Kategória sikeresen törölve!');
            } else {
                alert('Hiba történt a kategória törlésekor.');
            }
        } catch (error) {
            console.error('Hiba a kategória törlésekor:', error);
        }
    };

    return (
        <div className="manage-categories">
            <h1>Kategóriák Kezelése</h1>
            <ul className="category-list">
                {categories.map((category) => (
                    <li key={category._id} className="category-item">
                        <p><strong>{category.name}</strong></p>
                        <div className="category-actions">
                            <Link to={`/admin/edit-category/${category._id}`} className="edit-button">Szerkesztés</Link>
                            <button onClick={() => handleDelete(category._id)} className="delete-button">Törlés</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageCategories;
