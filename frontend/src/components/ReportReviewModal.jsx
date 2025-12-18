import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, User, Calendar, MessageSquare, FileText, Trash2, XCircle } from 'lucide-react';

const ReportReviewModal = ({ isOpen, onClose, report, onReject, onDeleteContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState('');
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

    if (!isOpen || !report) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 400);
    };

    const handleAction = async (actionType) => {
        setIsLoading(true);
        try {
            if (actionType === 'reject') {
                await onReject(report._id);
            } else if (actionType === 'delete') {
                await onDeleteContent(report.targetId, report.targetType);
            }
            handleClose();
        } catch (error) {
            console.error('Error performing action:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTargetTypeText = (type) => {
        switch (type) {
            case 'announcement': return 'обговорення';
            case 'comment': return 'коментар';
            case 'review': return 'відгук';
            case 'user': return 'користувача';
            default: return 'контент';
        }
    };

    const getTargetIcon = (type) => {
        switch (type) {
            case 'announcement': return <MessageSquare className="w-5 h-5" />;
            case 'comment': return <FileText className="w-5 h-5" />;
            case 'review': return <MessageSquare className="w-5 h-5" />;
            case 'user': return <User className="w-5 h-5" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${
            isClosing ? 'modal-closing' : 'report-backdrop-animate'
        }`}>
            
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
                    isClosing ? '' : 'report-backdrop-animate'
                }`}
                onClick={handleClose}
            />

            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden ${
                isClosing ? '' : 'report-modal-animate'
            }`}>
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-6 py-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <AlertTriangle className="w-6 h-6 text-white animate-icon-shake" />
                            </div>
                            <h3 className="text-lg font-bold text-white drop-shadow-lg">Розгляд скарги</h3>
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

                <div className="px-8 py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-orange-600 animate-icon-shake" />
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                Детальна інформація про скаргу та доступні дії
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Інформація про скаргу</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Скаргу подав:</span>
                                <span className="font-medium text-gray-600">{report.reporterId?.displayName || report.reporterId?.email || 'Невідомий'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Дата:</span>
                                <span className="font-medium text-gray-600">{new Date(report.createdAt).toLocaleString('uk-UA')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getTargetIcon(report.targetType)}
                                <span className="text-sm text-gray-500">Тип контенту:</span>
                                <span className="font-medium text-gray-600">{getTargetTypeText(report.targetType)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">ID контенту:</span>
                                <span className="font-medium font-mono text-xs bg-gray-300 px-2 py-1 rounded text-gray-600">{report.targetId}</span>
                            </div>
                        </div>
                    </div>

                    {report.reason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 relative overflow-hidden comment-animate-orange mt-8">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                            <div className="relative">
                                <h3 className="font-semibold text-orange-900 mb-3">Причина скарги</h3>
                                <p className="text-orange-800">{report.reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 mt-8">
                        <h3 className="font-semibold text-gray-900">Дії адміністратора</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAction('delete')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50 btn-glow group"
                            >
                                <Trash2 className="w-5 h-5 text-red-600 group-hover:rotate-[15deg] transition-transform duration-300" />
                                <span className="text-red-800 font-medium">Видалити контент</span>
                            </button>

                            <button
                                onClick={() => handleAction('reject')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50 btn-glow group"
                            >
                                <XCircle className="w-5 h-5 text-gray-600 group-hover:rotate-[15deg] transition-transform duration-300" />
                                <span className="text-gray-700 font-medium">Відхилити скаргу</span>
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="flex items-center justify-end gap-3 p-8 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex items-center justify-center gap-2 p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-300 btn-glow"
                    >
                        <span className="text-gray-700 font-medium">Скасувати</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportReviewModal;
