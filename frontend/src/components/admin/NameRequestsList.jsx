import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserRound, AlertTriangle, Calendar, FileText, CheckCircle, X, Eye } from 'lucide-react';

const NameRequestModal = ({ isOpen, onClose, request, onApprove, onReject }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !request) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 400);
    };

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isClosing ? 'modal-closing' : 'report-backdrop-animate'}`}>
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${isClosing ? '' : 'report-backdrop-animate'}`} onClick={handleClose} />
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative overflow-hidden ${isClosing ? 'modal-closing' : 'report-modal-animate'} ring-1 ring-white/10 shadow-[0_0_108px_22px_rgba(37,99,235,0.25)]`}>
                <div className="px-6 py-4 relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <UserRound className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Перегляд запиту на зміну імені</h2>
                                <p className="text-sm text-blue-100">Детальна інформація про запит</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-gray-100 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-gray-500" />
                            Інформація про запит
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <UserRound className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">Користувач:</span>
                                <span className="text-gray-600">{request.userId?.displayName || request.userId?.email || request.userDisplayName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">Дата створення:</span>
                                <span className="text-gray-600">{new Date(request.createdAt).toLocaleString('uk-UA')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-500">ID:</span>
                                <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-mono">{request._id || request.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl p-6 mb-6 border relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 comment-animate-blue">
                        <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-8 translate-x-8 bg-blue-100/30"></div>
                        <div className="relative space-y-2 text-blue-900">
                            <h3 className="text-lg font-semibold mb-2 text-blue-700">Дані запиту</h3>
                            <div><span className="font-medium">Поточне ім'я:</span> {request.currentFirstName} {request.currentLastName}</div>
                            <div><span className="font-medium">Нове ім'я:</span> {request.newFirstName} {request.newMiddleName ? request.newMiddleName + ' ' : ''}{request.newLastName}</div>
                            {request.reason && <div><span className="font-medium">Причина:</span> {request.reason}</div>}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <button onClick={() => onReject?.(request._id || request.id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                                Відхилити
                            </button>
                            <button onClick={() => onApprove?.(request._id || request.id)} className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 font-medium hover:bg-green-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                                Схвалити
                            </button>
                        </div>
                        <button onClick={handleClose} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                            Скасувати
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const NameRequestsList = ({ nameRequests = [], onApprove = () => {}, onReject = () => {} }) => {
    const [modalReq, setModalReq] = useState(null);
    if (!nameRequests || nameRequests.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 animate-[slideInFromLeft_0.6s_ease-out_both]">
                <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 review-icon-glow review-icon-pulse review-icon-rotate relative overflow-hidden" style={{ background: '#60A5FA' }}>
                        <div className="absolute inset-0 review-icon-shimmer opacity-30"></div>
                        <UserRound className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Зміна імені</h4>
                    <p className="text-gray-600">Немає запитів на зміну імені</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {nameRequests.map(req => (
                <div key={req._id || req.id} className={`rounded-xl p-4 border transition-all duration-500 ease-out relative ${
                    req.status === 'approved'
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-green-200 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:moderation-glow'
                }`} style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`${req.status==='approved' ? 'bg-green-500' : 'bg-blue-500'} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                                    <UserRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Запит на зміну імені</div>
                                    <div className="text-sm text-gray-600">Користувач: {req.userId?.displayName || req.userId?.email || req.userDisplayName} • {new Date(req.createdAt).toLocaleDateString('uk-UA')}</div>
                                </div>
                            </div>
                            {req.status==='approved' && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Перевірено
                                </div>
                            )}
                            <p className="text-gray-700 mb-3"><span className="font-medium">Нове ім'я:</span> {req.newFirstName} {req.newMiddleName ? req.newMiddleName + ' ' : ''}{req.newLastName}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setModalReq(req)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-300/50 active:scale-95 active:shadow-inner transition-all duration-300 cursor-pointer flex items-center gap-1 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <Eye className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                                    <span className="relative z-10">Переглянути</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <NameRequestModal
                isOpen={!!modalReq}
                onClose={() => setModalReq(null)}
                request={modalReq}
                onApprove={onApprove}
                onReject={onReject}
            />
        </div>
    );
};

export default NameRequestsList;
