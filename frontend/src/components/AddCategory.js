import React, { useState } from 'react';
import './AddCategory.css';

const AddCategory = () => {
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState(null); // Állapot a fájl tárolására
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setMessage('Kategória sikeresen hozzáadva!');
                setName('');
                setDescription('');
                setImageFile(null);
            } else {
                const errorData = await response.json();
                setMessage(`Hiba történt a kategória hozzáadásakor: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Hiba történt a kategória hozzáadásakor:', error);
            setMessage('Hiba történt a kategória hozzáadásakor.');
        }
    };

    return (
        <div className="add-category-form">
            <h2>Új Kategória Hozzáadása</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Név:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                
                <label>Kép feltöltése:</label>
                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} required />
                
                <label>Leírás:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

                <button type="submit">Kategória Hozzáadása</button>
            </form>
        </div>
    );
};

export default AddCategory;