import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Kosár inicializálása `localStorage`-ból, ha van tárolva
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Kosár mentése `localStorage`-ba minden változásnál
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const addToCart = (product) => {
        // Azonosítás az `_id` mező alapján
        const existingProductIndex = cart.findIndex((item) => item._id === product._id);
    
        if (existingProductIndex !== -1) {
            // Ha a termék már a kosárban van, növeljük a mennyiségét
            const updatedCart = [...cart];
            updatedCart[existingProductIndex].quantity += 1;
            setCart(updatedCart);
        } else {
            // Ha új terméket adunk hozzá, inicializáljuk a `quantity`-t 1-re
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };
    
    

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const updateItemQuantity = (index, quantity) => {
        const updatedCart = [...cart];
        if (quantity > 0) {
            updatedCart[index].quantity = quantity;
        } else {
            updatedCart.splice(index, 1); // Ha a mennyiség 0, akkor törli az elemet
        }
        setCart(updatedCart);
    };

    const clearCart = () => {
        setCart([]); // Kiüríti a kosarat
    };

    return (
        <CartContext.Provider value={{ cart, totalAmount, addToCart, removeFromCart, updateItemQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
