import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const isTokenExpired = decodedToken.exp * 1000 < Date.now();

                if (isTokenExpired) {
                    console.log('Token lejárt, kijelentkeztetés.');
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                } else {
                    setCurrentUser(decodedToken);
                }
            } catch (err) {
                console.error('Hiba történt a token dekódolásakor:', err);
                localStorage.removeItem('token');
                setCurrentUser(null);
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
