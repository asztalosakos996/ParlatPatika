import React, { useEffect, useState } from 'react';
import './AgeVerificationModal.css';

const AgeVerificationModal = () => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const ageVerified = localStorage.getItem('ageVerified');
        if (!ageVerified) {
            setShowModal(true);
        }
    }, []);

    const handleYes = () => {
        localStorage.setItem('ageVerified', 'true');
        setShowModal(false);
    };

    const handleNo = () => {
        window.location.href = 'https://www.inf.u-szeged.hu/';
    };

    if (!showModal) {
        return null;
    }

    return (
        <>
            <div className="age-verification-modal">
                <div className="age-verification-modal-content">
                    <h2>Elmúltál már 18 éves?</h2>
                    <p>Elkötelezettek vagyunk a kulturált és törvényes alkoholfogyasztáshoz.</p>
                    <button className="confirm" onClick={handleYes}>Igen</button>
                    <button className="deny" onClick={handleNo}>Nem</button>
                </div>
            </div>
        </>
    );
};

export default AgeVerificationModal;