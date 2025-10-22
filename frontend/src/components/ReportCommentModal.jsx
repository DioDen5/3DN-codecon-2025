import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { createReport } from '../api/reports';
import { useNotification } from '../contexts/NotificationContext';

const ReportCommentModal = ({ isOpen, onClose, targetType, targetId, targetTitle = '' }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { showSuccess } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            await createReport(targetType, targetId, reason.trim());
            showSuccess('Скаргу успішно надіслано!');
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            if (error?.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('Помилка при надсиланні скарги');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setReason('');
            setIsClosing(false);
            onClose();
        }, 400); // Тривалість анімації закриття
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
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden modal-content ${
                isClosing ? '' : 'animate-modal-slide-in'
            }`} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-6 py-4 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <Flag className="w-6 h-6 text-white animate-icon-shake" />
                            </div>
                            <h3 className="text-lg font-bold text-white drop-shadow-lg">Поскаржитися</h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm group"
                        >
                            <X className="w-5 h-5 spin-close" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-orange-600 animate-icon-shake" />
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                Опишіть причину скарги на цей коментар
                            </p>
                        </div>
                        
                        {targetTitle && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 relative overflow-hidden comment-animate-orange">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="p-1 bg-orange-200 rounded-lg">
                                            <svg className="w-3 h-3 text-orange-600 planet-icon" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                            </svg>
                                        </div>
                                        <p className="text-sm text-orange-800 font-medium">
                                            Коментар:
                                        </p>
                                    </div>
                                    <p className="text-sm text-orange-600 italic">
                                        "{targetTitle.length > 100 ? targetTitle.substring(0, 100) + '...' : targetTitle}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Причина скарги:
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Опишіть, що саме вас не влаштовує в цьому коментарі..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                                rows={4}
                                maxLength={500}
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                                {reason.length} / 500 символів
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 hover:scale-102 active:scale-98 transition-all duration-300 ease-out shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                            >
                                <X className="w-4 h-4 bounce-x transition-all duration-300 ease-out" />
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !reason.trim()}
                                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 hover:scale-102 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-out shadow-lg hover:shadow-xl flex items-center gap-2 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                                        <span className="relative z-10">Надсилаємо...</span>
                                    </>
                                ) : (
                                    <>
                                        <Flag className="w-4 h-4 relative z-10 group-hover:rotate-15 transition-transform duration-300 ease-out" />
                                        <span className="relative z-10">Надіслати скаргу</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportCommentModal;
