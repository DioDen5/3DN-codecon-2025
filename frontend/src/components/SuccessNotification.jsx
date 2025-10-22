import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessNotification = ({ message, isVisible, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsClosing(false);
            // Автоматично закрити через 3 секунди
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
            <div className="success-notification notification-slide-down bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] relative overflow-hidden">
                {/* Фоновий ефект */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-90"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                
                {/* Контент */}
                <div className="relative flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Успішно!</p>
                        <p className="text-xs text-green-100">{message}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessNotification;
