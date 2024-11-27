import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewBlog.css';

const NewBlog = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false); // Az AI tartalom generálás állapota
    const navigate = useNavigate();

    // Blog poszt beküldése
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch('http://localhost:5000/api/blogs', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                navigate('/admin/manage-blogs'); // Blogok kezelése oldalra irányít
            } else {
                const data = await response.json();
                setError(data.message || 'Hiba történt a blog létrehozásakor.');
            }
        } catch (error) {
            console.error('Hiba történt a blog létrehozásakor:', error);
            setError('Hiba történt a blog létrehozásakor.');
        }
    };

    // Blog tartalom generálása AI segítségével
    const generateContent = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/blogs/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });

            const data = await response.json();

            if (response.ok) {
                setContent(data.content); // Generált tartalom hozzáadása
            } else {
                setError(data.message || 'Hiba történt a tartalom generálása során.');
            }
        } catch (error) {
            console.error('Hiba a blog tartalom generálása során:', error);
            setError('Nem sikerült legenerálni a tartalmat.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="new-blog-container">
            <h1>Új Blog Poszt Létrehozása</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Cím:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Tartalom:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                    <button
                        type="button"
                        onClick={generateContent}
                        disabled={!title || isGenerating}
                        className="ai-generate-btn"
                    >
                        {isGenerating ? 'Generálás...' : 'Tartalom Generálása AI segítségével'}
                    </button>
                </div>
                <div className="form-group">
                    <label htmlFor="image">Kép feltöltése:</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit" className="save-btn">Mentés</button>
            </form>
        </div>
    );
};

export default NewBlog;
