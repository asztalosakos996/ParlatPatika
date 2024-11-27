import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageBlog.css';

const ManageBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Blogbejegyzések lekérése
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/blogs');
                const data = await response.json();
                setBlogs(data);
            } catch (err) {
                setError('Hiba történt a blogok lekérésekor.');
            }
        };

        fetchBlogs();
    }, []);

    // Blog törlése
    const handleDelete = async (id) => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a blogot?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
                alert('A blogbejegyzés sikeresen törölve.');
            } else {
                alert('Hiba történt a blog törlésekor.');
            }
        } catch (err) {
            console.error('Hiba a blog törlésekor:', err);
            alert('Hiba történt a blog törlésekor.');
        }
    };

    // Blog szerkesztése
    const handleEdit = (id) => {
        navigate(`/admin/edit-blog/${id}`);
    };

    return (
        <div className="manage-blog">
            <h1>Blogok Kezelése</h1>
            {error && <p className="error">{error}</p>}
            <div className="blog-list">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-card">
                        <img src={`http://localhost:5000${blog.image}`} alt={blog.title} />
                        <h2>{blog.title}</h2>
                        <p>{blog.content.slice(0, 100)}...</p>
                        <div className="blog-actions">
                            <button onClick={() => handleEdit(blog._id)} className="edit-btn">Szerkesztés</button>
                            <button onClick={() => handleDelete(blog._id)} className="delete-btn">Törlés</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageBlog;
