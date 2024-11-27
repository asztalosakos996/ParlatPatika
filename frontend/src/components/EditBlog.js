import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState({ title: '', content: '', image: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/blogs/${id}`);
                if (!response.ok) throw new Error('Blog nem található.');
                const data = await response.json();
                setBlog(data);
            } catch (err) {
                setError('Hiba történt a blog adatok betöltésekor.');
            }
        };

        fetchBlog();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlog((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blog),
            });

            if (!response.ok) throw new Error('Hiba történt a blog frissítésekor.');

            navigate('/admin/manage-blogs');
        } catch (err) {
            setError('Hiba történt a blog frissítésekor.');
        }
    };

    return (
        <div>
            <h1>Blog Szerkesztése</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Cím:
                    <input
                        type="text"
                        name="title"
                        value={blog.title}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Tartalom:
                    <textarea
                        name="content"
                        value={blog.content}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">Mentés</button>
            </form>
        </div>
    );
};

export default EditBlog;
