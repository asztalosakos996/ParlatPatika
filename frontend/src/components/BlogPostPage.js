import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BlogPostPage.css';

const BlogPostPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/blogs/${id}`);
                const data = await response.json();
                setBlog(data);
            } catch (error) {
                console.error('Hiba a blogposzt lekérésekor:', error);
            }
        };

        fetchBlog();
    }, [id]);

    if (!blog) {
        return <p>Betöltés...</p>;
    }

    return (
        <div className="blog-post-page">
            <h1>{blog.title}</h1>
            {blog.imageUrl && <img src={`http://localhost:5000${blog.imageUrl}`} alt={blog.title} />}
            <p>{blog.content}</p>
        </div>
    );
};

export default BlogPostPage;
