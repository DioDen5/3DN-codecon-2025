import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, User, Calendar, MessageSquare, MessageCircle, FileText, Star, CheckCircle, Trash2 } from 'lucide-react';
import { deleteContent } from '../api/admin-stats';

const ContentViewModal = ({ isOpen, onClose, content, onApprove, onDelete, onContentDeleted }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    if (!isOpen || !content) {
        console.log('ContentViewModal: not open or no content', { isOpen, content });
        return null;
    }

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 400);
    };

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            if (onApprove) {
                const contentType = getContentType();
                console.log('handleApprove - calling onApprove with:', content._id, contentType);
                await onApprove(content._id, contentType);
            }
            handleClose();
        } catch (error) {
            console.error('Error approving content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            console.log('Content object:', content);
            const contentType = getContentType();
            console.log('Deleting content:', { targetId: content._id, targetType: contentType });
            
            await deleteContent(content._id, contentType);
            console.log('Content deleted successfully');
            handleClose();
            // Викликаємо callback для оновлення даних
            if (onContentDeleted) {
                onContentDeleted();
            }
        } catch (error) {
            console.error('Error deleting content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTargetTypeText = (type) => {
        const contentType = type || content.contentType || content.type || (content.rating !== undefined ? 'review' : 'announcement');
        
        switch (contentType) {
            case 'announcement': return 'обговорення';
            case 'comment': return 'коментаря';
            case 'review': return 'відгуку';
            default: return 'контент';
        }
    };

    const getTargetIcon = (type) => {
        switch (type) {
            case 'announcement': return <MessageSquare className="w-5 h-5 text-blue-900" />;
            case 'comment': return <MessageCircle className="w-5 h-5 text-green-900" />;
            case 'review': return <Star className="w-5 h-5 text-purple-600" />;
            default: return <FileText className="w-5 h-5 text-purple-900" />;
        }
    };

    const getContentText = () => {
        const contentType = content.contentType || content.type || (content.rating !== undefined ? 'review' : 'announcement');
        
        if (contentType === 'announcement') {
            return content.body || 'Немає тексту';
        } else if (contentType === 'comment') {
            return content.body || 'Немає тексту';
        } else if (contentType === 'review') {
            return content.body || 'Немає тексту';
        }
        return 'Немає тексту';
    };

    const getAuthorName = () => {
        return content.authorId?.displayName || content.authorId?.email || 'Невідомий';
    };

    const getContentType = () => {
        console.log('getContentType - content object:', content);
        console.log('getContentType - content.contentType:', content.contentType);
        console.log('getContentType - content.type:', content.type);
        console.log('getContentType - content.rating:', content.rating);
        console.log('getContentType - content.title:', content.title);
        console.log('getContentType - content.body:', content.body);
        
        // Спочатку перевіряємо явно встановлені поля
        if (content.contentType) {
            console.log('getContentType - returning content.contentType:', content.contentType);
            return content.contentType;
        }
        if (content.type) {
            console.log('getContentType - returning content.type:', content.type);
            return content.type;
        }
        
        // Потім визначаємо по структурі об'єкта
        if (content.rating !== undefined) {
            console.log('getContentType - returning review (has rating)');
            return 'review';
        }
        if (content.title) {
            console.log('getContentType - returning announcement (has title)');
            return 'announcement';
        }
        if (content.body && !content.title) {
            console.log('getContentType - returning comment (has body, no title)');
            return 'comment';
        }
        
        // Default fallback
        console.log('getContentType - returning default announcement');
        return 'announcement';
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
            
            {/* Modal Content */}
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative overflow-hidden ${
                isClosing ? 'modal-closing' : 'report-modal-animate'
            }`}>
                <div className={`px-6 py-4 relative overflow-hidden ${
                    getContentType() === 'review' 
                        ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700'
                        : getContentType() === 'comment'
                            ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800'
                            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'
                }`}>
                    <div className={`absolute inset-0 ${
                        getContentType() === 'review' 
                            ? 'bg-gradient-to-r from-purple-400/20 to-purple-500/20'
                            : getContentType() === 'comment'
                                ? 'bg-gradient-to-r from-green-400/20 to-green-500/20'
                                : 'bg-gradient-to-r from-blue-400/20 to-blue-500/20'
                    }`}></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                {getTargetIcon(getContentType())}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Перегляд {getTargetTypeText(getContentType())}</h2>
                                <p className={`text-sm ${
                                    getContentType() === 'review' 
                                        ? 'text-purple-100' 
                                        : getContentType() === 'comment'
                                            ? 'text-green-200'
                                            : 'text-blue-100'
                                }`}>Детальна інформація про контент</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-gray-100 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-gray-500" />
                            Інформація про {getTargetTypeText(getContentType())}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">Автор:</span>
                                <span className="text-gray-600">{getAuthorName()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">Дата створення:</span>
                                <span className="text-gray-600">{new Date(content.createdAt).toLocaleString('uk-UA')}</span>
                            </div>
                            {(content.contentType === 'review' || content.rating !== undefined) && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-500">Рейтинг:</span>
                                    <span className="text-gray-600">{content.rating}/5</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">ID:</span>
                                <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-mono">{content._id}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl p-6 mb-6 border relative overflow-hidden ${
                        getContentType() === 'review'
                            ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 comment-animate-purple'
                            : getContentType() === 'comment'
                                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 comment-animate-green'
                                : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 comment-animate-blue'
                    }`}>
                        <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-8 translate-x-8 ${
                            getContentType() === 'review' 
                                ? 'bg-purple-100/30' 
                                : getContentType() === 'comment'
                                    ? 'bg-green-100/30'
                                    : 'bg-blue-100/30'
                        }`}></div>
                        <div className="relative">
                            <h3 className={`text-lg font-semibold mb-4 ${
                                getContentType() === 'review' 
                                    ? 'text-purple-700' 
                                    : getContentType() === 'comment'
                                        ? 'text-green-700'
                                        : 'text-blue-700'
                            }`}>Текст {getTargetTypeText(getContentType())}</h3>
                            <div className={`leading-relaxed whitespace-pre-wrap ${
                                getContentType() === 'review' 
                                    ? 'text-purple-900' 
                                    : getContentType() === 'comment'
                                        ? 'text-green-900'
                                        : 'text-blue-900'
                            }`}>
                                {getContentText()}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 font-medium hover:bg-green-200 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer group"
                            >
                                <CheckCircle className="w-4 h-4 group-hover:rotate-[15deg] transition-transform duration-300" />
                                Схвалити
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-200 hover:scale-105 hover:shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer group"
                            >
                                <Trash2 className="w-4 h-4 group-hover:rotate-[15deg] transition-transform duration-300" />
                                Видалити
                            </button>
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ContentViewModal;
