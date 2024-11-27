import React, { forwardRef } from 'react';
import './Modal.css';

const Modal = forwardRef(({ showModal, handleClose, title, children }, ref) => {
    if (!showModal) return null;

    return (
        <>
            <div className="modal-overlay" onClick={handleClose} ref={ref}></div>
            <div className="modal show">
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close-btn" onClick={handleClose}>
                        &times;
                    </span>
                    <h2>{title}</h2>
                    {children}
                </div>
            </div>
        </>
    );
});

export default Modal;
