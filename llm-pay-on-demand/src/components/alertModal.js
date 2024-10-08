import React from 'react';

const AlertModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="alert-overlay" onClick={onClose}>
            <div className="alert-content" onClick={(e) => e.stopPropagation()}>
                <h2>Alert</h2>
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default AlertModal;
