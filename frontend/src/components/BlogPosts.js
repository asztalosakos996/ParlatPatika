import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogPosts.css';

const BlogPosts = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/blogs');
                const data = await response.json();
                setBlogs(data);
            } catch (error) {
                console.error('Hiba a blogok lekérésekor:', error);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="blog-posts">
            <h2>Blog Bejegyzések</h2>
            <p>Itt találja legfrissebb blogbejegyzéseinket!</p>
            <div className="blog-posts-grid">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-card">
                        {blog.imageUrl && <img src={`http://localhost:5000${blog.imageUrl}`} alt={blog.title} />}
                        <h3>{blog.title}</h3>
                        <p>{blog.content.substring(0, 100)}...</p>
                        <Link to={`/blogs/${blog._id}`} className="read-more-link">Olvass tovább</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPosts;
