import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, User, Calendar, MessageSquare, FileText, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';

const ReportReviewModal = ({ isOpen, onClose, report, onResolve, onReject, onDeleteContent, onEditContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState('');
    const [isClosing, setIsClosing] = useState(false);

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
            if (actionType === 'resolve') {
                await onResolve(report._id);
            } else if (actionType === 'reject') {
                await onReject(report._id);
            } else if (actionType === 'delete') {
                await onDeleteContent(report.targetId, report.targetType);
            } else if (actionType === 'edit') {
                await onEditContent(report.targetId, report.targetType);
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
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
                    isClosing ? '' : 'report-backdrop-animate'
                }`}
                onClick={handleClose}
            />
            
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
                isClosing ? '' : 'report-modal-animate'
            }`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Розгляд скарги</h2>
                            <p className="text-sm text-gray-600">Детальна інформація та дії</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Інформація про скаргу</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Скаргу подав:</span>
                                <span className="font-medium">{report.reporterId?.displayName || report.reporterId?.email || 'Невідомий'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Дата:</span>
                                <span className="font-medium">{new Date(report.createdAt).toLocaleString('uk-UA')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getTargetIcon(report.targetType)}
                                <span className="text-sm text-gray-600">Тип контенту:</span>
                                <span className="font-medium">{getTargetTypeText(report.targetType)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">ID контенту:</span>
                                <span className="font-medium font-mono text-xs bg-gray-200 px-2 py-1 rounded">{report.targetId}</span>
                            </div>
                        </div>
                    </div>

                    {report.reason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <h3 className="font-semibold text-orange-900 mb-2">Причина скарги</h3>
                            <p className="text-orange-800">{report.reason}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Дії адміністратора</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAction('edit')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                            >
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-800 font-medium">Редагувати контент</span>
                            </button>
                            
                            <button
                                onClick={() => handleAction('delete')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span className="text-red-800 font-medium">Видалити контент</span>
                            </button>
                        </div>

                        {/* Report Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAction('resolve')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-800 font-medium">Розглянути скаргу</span>
                            </button>
                            
                            <button
                                onClick={() => handleAction('reject')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-800 font-medium">Відхилити скаргу</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportReviewModal;
