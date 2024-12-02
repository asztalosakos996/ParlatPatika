import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Link.css';

const Link = ({ to, children, className }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        navigate(to);
    };

    return (
        <a href={to} onClick={handleClick} className={className}>
            {children}
        </a>
    );
};

export default Link;
