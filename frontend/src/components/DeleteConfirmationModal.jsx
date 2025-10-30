import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Підтвердження видалення",
    message = "Ви впевнені, що хочете видалити цей елемент?",
    itemName = "",
    isLoading = false 
}) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleConfirm = () => {
        onConfirm();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
            isClosing ? 'modal-closing' : ''
        }`} onClick={(e) => e.stopPropagation()}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div 
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden modal-content ${
                    isClosing ? '' : 'animate-modal-slide-in'
                }`} onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 px-6 py-4 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <svg className="w-6 h-6 text-white animate-icon-shake" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white drop-shadow-lg">{title}</h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm group cursor-pointer disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5 spin-close" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-full">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                {message}
                            </p>
                        </div>
                        
                        {itemName && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 relative overflow-hidden comment-animate">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                                <div className="relative flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-600 planet-icon" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-800 font-medium">
                                            Ваш коментар:
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1 italic">
                                            "{itemName}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 hover:scale-102 active:scale-98 transition-all duration-300 ease-out shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 group"
                        >
                            <svg className="w-4 h-4 bounce-x transition-all duration-300 ease-out" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                            Скасувати
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 hover:scale-102 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-out shadow-lg hover:shadow-xl flex items-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                                    <span className="relative z-10">Видаляємо...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 relative z-10 group-hover:rotate-15 transition-transform duration-300 ease-out" />
                                    <span className="relative z-10">Видалити</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmationModal;
