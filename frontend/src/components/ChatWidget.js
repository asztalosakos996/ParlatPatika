import React, { useState } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Üdvözöllek! Hogyan segíthetek?' }]);
    const [input, setInput] = useState('');

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        setMessages([...messages, { sender: 'user', text: input }]);
        setInput('');

        try {
            const response = await fetch('http://localhost:5000/api/chat/recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category: input }),
            });
            const data = await response.json();
            console.log('Kapott adat:', data);

            if (data.message) {
                setMessages([
                    ...messages,
                    { sender: 'user', text: input },
                    { sender: 'bot', text: data.message }
                ]);

                if (data.followUp) {
                    setMessages(prev => [...prev, { sender: 'bot', text: data.followUp }]);
                }
            } else {
                setMessages([...messages, { sender: 'bot', text: 'Nem sikerült ajánlani terméket. Kérlek, próbálj új keresést.' }]);
            }
        } catch (error) {
            console.error('Hiba történt az ajánlás lekérése során:', error);
            setMessages([...messages, { sender: 'bot', text: 'Hiba történt a válaszadás során.' }]);
        }
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
                                {msg.text}
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
