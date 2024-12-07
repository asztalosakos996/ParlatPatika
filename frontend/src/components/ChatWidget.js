import React, { useState } from 'react';
import './ChatWidget.css';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ChatWidget = () => {
    const { addToCart } = useCart(); // Kosárhoz hozzáférés
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Üdvözöllek! Hogyan segíthetek?' }]);
    const [input, setInput] = useState('');

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async () => {
        if (input.trim() === '') return;
    
        // Felhasználói üzenet hozzáadása
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text: input } // Felhasználói üzenet
        ]);
        setInput('');
    
        try {
            const response = await fetch('http://localhost:5000/api/chat/recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: input.trim() }),
            });
            const data = await response.json();
            console.log('Kapott adat:', data);
    
            // Bot válasz feldolgozása
            const botMessage = {
                sender: 'bot',
                text: data.message.message, // Backend által küldött ajánlás szöveg
                product: data.message.productId
                    ? {
                        id: data.message.productId,
                        name: data.message.productName,
                        price: data.message.productPrice,
                      }
                    : null,
                followUp: data.message.followUp || null, // Opcionális follow-up kérdés
            };
    
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Hiba történt az ajánlás lekérése során:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: 'Hiba történt a válaszadás során.' }
            ]);
        }
    };

    const handleSearchAgain = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/chat/recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: 'Ajánlj nekem egy másik terméket!' }),
            });
    
            const data = await response.json();
            console.log('Új termék ajánlás:', data);
    
            if (data.message) {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: data.message },
                    data.productId && {
                        sender: 'bot',
                        product: { id: data.productId, name: data.productName, price: data.productPrice },
                        followUp: data.followUp,
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: 'Nem sikerült új terméket ajánlani. Próbálj új keresést!' },
                ]);
            }
        } catch (error) {
            console.error('Hiba történt az új termék ajánlása során:', error);
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: 'Hiba történt a válaszadás során. Próbáld újra!' },
            ]);
        }
    };
    
    

    const handleAddToCart = (product) => {
        if (!product) {
            console.error('Nincs termék az üzenetben a kosárhoz adáshoz.');
            return;
        }
        addToCart(product); // Kosárba helyezés
        setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: `${product.name} hozzáadva a kosárhoz.` },
        ]);
    };
    

    return (
        <div className="chat-widget">
            <div className="chat-toggle" onClick={handleToggleChat}>
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
            </div>
            {isOpen && (
                <div className={`chat-panel ${isOpen ? 'show' : 'hide'}`}>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                <p>{msg.text}</p>
                                {msg.product && (
                                    <div>
                                        <p>Termék: {msg.product.name}</p>
                                        <p>Ár: {msg.product.price} Ft</p>
                                    </div>
                                )}
                                {msg.followUp && (
                                    <div>
                                        <p>{msg.followUp.question}</p>
                                        {msg.followUp.actions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (action.action === 'addToCart') {
                                                        handleAddToCart(msg.product);
                                                    } else if (action.action === 'searchAgain') {
                                                        handleSearchAgain();
                                                    }
                                                }}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Írd be az üzeneted..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Küldés</button>
                </div>
            )}
        </div>
    );

};

export default ChatWidget;
