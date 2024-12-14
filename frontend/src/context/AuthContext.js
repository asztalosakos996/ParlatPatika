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

   /* const updateUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            const response = await fetch('http://localhost:5000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                const updatedUser = await response.json();
                setCurrentUser(updatedUser); // Frissítsd a `currentUser`-t a szerver adataival
            } else {
                console.error('Nem sikerült a felhasználói adatok frissítése.');
            }
        } catch (err) {
            console.error('Hiba történt a felhasználói adatok frissítésekor:', err);
        }
    }; */
    

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, /*updateUser*/ }}>
            {children}
        </AuthContext.Provider>
    );
};
