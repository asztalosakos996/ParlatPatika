import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditCategory.css';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState({ name: '', description: '' });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/categories/${id}`);
                const data = await response.json();
                setCategory(data);
            } catch (error) {
                console.error('Hiba a kategória adatainak lekérésekor:', error);
            }
        };

        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(category),
            });

            if (response.ok) {
                alert('Kategória sikeresen frissítve!');
                navigate('/admin/manage-categories');
            } else {
                alert('Hiba történt a kategória frissítésekor.');
            }
        } catch (error) {
            console.error('Hiba a kategória frissítésekor:', error);
        }
    };

    return (
        <div className="edit-category">
            <h1>Kategória Szerkesztése</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Név:
                    <input
                        type="text"
                        name="name"
                        value={category.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Leírás:
                    <textarea
                        name="description"
                        value={category.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </label>
                <button type="submit">Mentés</button>
            </form>
        </div>
    );
};

export default EditCategory;
