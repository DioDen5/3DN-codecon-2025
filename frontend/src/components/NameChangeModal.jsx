import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { requestNameChange, getNameChangeStatus, cancelNameChangeRequest } from '../api/name-change';
import { useAuthState } from '../api/useAuthState';

const NameChangeModal = ({ isOpen, onClose, currentName }) => {
    const { user } = useAuthState();
    const [formData, setFormData] = useState({
        newFirstName: '',
        newLastName: '',
        newMiddleName: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [existingRequest, setExistingRequest] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadExistingRequest();
        }
    }, [isOpen]);

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

    const loadExistingRequest = async () => {
        try {
            const response = await getNameChangeStatus();
            if (response.hasRequest) {
                setExistingRequest(response.request);
            }
        } catch (error) {
            console.error('Error loading existing request:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                newFirstName: (formData.newFirstName || '').trim(),
                newLastName: (formData.newLastName || '').trim(),
                newMiddleName: (formData.newMiddleName || '').trim(),
                reason: (formData.reason || '').trim()
            };
            const isUkr = (t) => /^[А-ЯІЇЄҐа-яіїєґ'\-\s]+$/.test(t || '');
            const isEng = (t) => /^[A-Za-z'\-\s]+$/.test(t || '');
            if (payload.newFirstName.length < 2 || payload.newLastName.length < 2) {
                setError('Невалідні дані: мінімальна довжина імені/прізвища — 2 символи');
                return;
            }
            const langs = [payload.newFirstName, payload.newLastName, payload.newMiddleName].filter(Boolean).map(t => (isUkr(t) ? 'uk' : isEng(t) ? 'en' : 'mixed'));
            if (langs.includes('mixed') || (langs.length && !langs.every(l => l === langs[0]))) {
                setError('Ім’я, прізвище та по батькові мають бути однією мовою (укр/англ)');
                return;
            }
            const response = await requestNameChange({
                newFirstName: payload.newFirstName,
                newLastName: payload.newLastName,
                newMiddleName: payload.newMiddleName || undefined,
                reason: payload.reason || undefined
            });
            setSuccess('✅ Запит на зміну імені створено успішно!');
            setFormData({ newFirstName: '', newLastName: '', newMiddleName: '', reason: '' });
            await loadExistingRequest();
        } catch (error) {
            const apiError = error?.response?.data;
            const msg = apiError?.error || apiError?.message || '❌ Помилка при створенні запиту';
            const details = apiError?.details?.[0]?.message ? `\n${apiError.details[0].message}` : '';
            setError(`${msg}${details}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        try {
            await cancelNameChangeRequest();
            setExistingRequest(null);
            setSuccess('✅ Запит на зміну імені скасовано успішно!');
        } catch (error) {
            setError('❌ Помилка при скасуванні запиту.\n\n🔄 Спробуйте ще раз або зверніться до підтримки.');
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Очікує розгляду';
            case 'approved':
                return 'Схвалено';
            case 'rejected':
                return 'Відхилено';
            default:
                return 'Невідомо';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isOpen) return null;

    const isTeacher = user?.role === 'teacher';
    const currentLabel = isTeacher ? "Поточне ім'я, прізвище та по батькові" : "Поточне ім'я та прізвище";
    const composedCurrent = (() => {
        const first = user?.firstName?.trim();
        const middle = user?.middleName?.trim();
        const last = user?.lastName?.trim();
        const parts = isTeacher ? [first, middle, last] : [first, last];
        const joined = parts.filter(Boolean).join(' ');
        if (joined) return joined;
        const cn = (currentName || '').trim();
        if (!cn) return currentName;
        const words = cn.split(/\s+/);
        if (isTeacher) {
            if (words.length >= 3) return `${words[0]} ${words[1]} ${words[2]}`;
            if (words.length === 2) return `${words[0]} ${words[1]}`;
            return cn;
        } else {
            if (words.length >= 2) return `${words[0]} ${words[1]}`;
            return cn;
        }
    })();

    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
            isClosing ? 'modal-closing' : ''
        }`} onClick={(e) => e.stopPropagation()}>
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade cursor-pointer"
                onClick={handleClose}
            />
            
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden modal-content ${
                isClosing ? '' : 'animate-modal-slide-in'
            }`} onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-icon-shake" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">Зміна імені та прізвища</h2>
                                <p className="text-xs sm:text-sm text-white/90">Запит буде розглянуто модераторами</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm group cursor-pointer disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5 spin-close" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
                    {existingRequest && existingRequest.status !== 'rejected' && (
                        <div className={`mb-4 p-3 rounded-xl border ${getStatusColor(existingRequest.status)}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(existingRequest.status)}
                                <span className="font-semibold">
                                    {getStatusText(existingRequest.status)}
                                </span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p><strong>Нове ім'я:</strong> {existingRequest.newFirstName} {existingRequest.newMiddleName ? existingRequest.newMiddleName + ' ' : ''}{existingRequest.newLastName}</p>
                                <p><strong>Відображуване ім'я:</strong> {existingRequest.newDisplayName}</p>
                                {existingRequest.reason && (
                                    <p><strong>Причина:</strong> {existingRequest.reason}</p>
                                )}
                                <p><strong>Дата створення:</strong> {new Date(existingRequest.createdAt).toLocaleDateString('uk-UA')}</p>
                                {existingRequest.reviewComment && (
                                    <p><strong>Коментар модератора:</strong> {existingRequest.reviewComment}</p>
                                )}
                            </div>
                            {existingRequest.status === 'pending' && (
                                <button
                                    onClick={handleCancelRequest}
                                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm cursor-pointer"
                                >
                                    Скасувати запит
                                </button>
                            )}
                        </div>
                    )}

                    {(!existingRequest || existingRequest.status !== 'pending') && (
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{currentLabel}</h3>
                                <p className="text-gray-700 text-sm">{composedCurrent}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                                <div>
                                    <label className="name-change-label">Нове ім'я:</label>
                                    <input type="text" name="newFirstName" value={formData.newFirstName} onChange={handleInputChange} required className="name-change-input" placeholder="Введіть нове ім'я" />
                                </div>
                                <div>
                                    <label className="name-change-label">Нове прізвище:</label>
                                    <input type="text" name="newLastName" value={formData.newLastName} onChange={handleInputChange} required className="name-change-input" placeholder="Введіть нове прізвище" />
                                </div>
                            </div>

                            {isTeacher && (
                                <div>
                                    <label className="name-change-label">По батькові:</label>
                                    <input type="text" name="newMiddleName" value={formData.newMiddleName} onChange={handleInputChange} className="name-change-input" placeholder="Введіть по батькові" />
                                </div>
                            )}

                            <div>
                                <label className="name-change-label">Причина зміни:</label>
                                <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={2} className="name-change-input resize-none" placeholder="Поясніть причину зміни імені..." />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-green-700 text-sm whitespace-pre-line">{success}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                                <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-102 active:scale-98 text-sm sm:text-base cursor-pointer">Скасувати</button>
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-102 active:scale-98 shadow-lg hover:shadow-xl text-sm sm:text-base cursor-pointer">{loading ? 'Створення запиту...' : 'Створити запит'}</button>
                            </div>
                        </form>
                    )}

                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 relative overflow-hidden comment-animate">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="relative">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
                                    <MessageSquare className="w-5 h-5 text-blue-600 animate-icon-shake" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Як працює зміна імені?</h4>
                                    <ul className="text-xs text-blue-800 space-y-1">
                                        <li>• Ваш запит буде розглянуто модераторами</li>
                                        <li>• Час розгляду: 1-3 робочих дні</li>
                                        <li>• Ви отримаєте сповіщення про результат</li>
                                        <li>• Можете скасувати запит до його розгляду</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NameChangeModal;
