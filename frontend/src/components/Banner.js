import React, { useState, useEffect } from 'react';
import './Banner.css';

const Banner = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const images = [
        '/images/banner_img1.jpg', 
        '/images/banner_img2.jpg', 
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Váltás 5 másodpercenként
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div 
            className="banner" 
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        >
            <div className="banner-content">
                <h1>Üdvözöljük a Párlat Patikában!</h1>
                <p>Kínálatunkban megtalálja a legjobb prémium italokat.</p>
            </div>
        </div>
    );
};

export default Banner;
