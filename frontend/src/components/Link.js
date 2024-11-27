import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Link.css'; // opcionális: ha van külön CSS fájl a stílusokhoz

const Link = ({ to, children, className }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault(); // megakadályozza az alapértelmezett viselkedést
        navigate(to); // navigál az új útvonalra
    };

    return (
        <a href={to} onClick={handleClick} className={className}>
            {children}
        </a>
    );
};

export default Link;
