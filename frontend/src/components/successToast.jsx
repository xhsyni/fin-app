import React, { useEffect } from 'react'
import '../styles/toast.css'

function SuccessToast({ message = "Success!", duration = 3000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="success-toast">
            <div className="success-toast-icon">✅</div>
            <div className="success-toast-message">{message}</div>
            <div className="success-toast-close" onClick={onClose}>
                <span>X</span>
            </div>
        </div>
    )
}

export default SuccessToast