import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Flag } from 'lucide-react';

const SuccessNotification = ({ message, isVisible, onClose, type = 'success' }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsClosing(false);
            // Автоматично закрити через 4.5 секунди (3 + 1.5)
            const timer = setTimeout(() => {
                handleClose();
            }, 4500);

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

    // Визначаємо кольори залежно від типу
    const getColors = () => {
        if (type === 'report') {
            return {
                bg: 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700',
                border: 'border-orange-400/20',
                overlay: 'from-orange-400/20 to-orange-500/20',
                text: 'text-orange-100',
                icon: 'Flag'
            };
        }
        return {
            bg: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700',
            border: 'border-green-400/20',
            overlay: 'from-green-400/20 to-green-500/20',
            text: 'text-green-100',
            icon: 'CheckCircle'
        };
    };

    const colors = getColors();

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
            <div className={`success-notification notification-slide-down ${colors.bg} text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px] relative overflow-hidden border ${colors.border}`}>
                {/* Анімовані фонові елементи */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.overlay}`}></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin" style={{animationDuration: '8s'}}></div>
                
                {/* Хрестик закриття в правому верхньому кутку */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 group z-10 cursor-pointer"
                >
                    <X className="w-5 h-5 spin-close" />
                </button>
                
                {/* Контент */}
                <div className="relative flex items-center gap-4 pr-8">
                    <div className="p-3 bg-white/20 rounded-full animate-bounce">
                        {type === 'report' ? (
                            <Flag className="w-6 h-6 text-white animate-pulse" />
                        ) : (
                            <CheckCircle className="w-6 h-6 text-white animate-pulse" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base">
                            {type === 'report' ? 'Скаргу надіслано!' : 'Успішно!'}
                        </p>
                        <p className={`text-sm ${colors.text} font-medium`}>{message}</p>
                    </div>
                </div>
                
                {/* Анімовані крапки */}
                <div className="absolute bottom-2 right-4 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
        </div>
    );
};

export default SuccessNotification;
