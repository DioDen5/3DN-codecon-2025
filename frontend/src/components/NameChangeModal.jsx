import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { requestNameChange, getNameChangeStatus, cancelNameChangeRequest } from '../api/name-change';

const NameChangeModal = ({ isOpen, onClose, currentName }) => {
    const [formData, setFormData] = useState({
        newFirstName: '',
        newLastName: '',
        newDisplayName: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [existingRequest, setExistingRequest] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    // Завантаження статусу існуючого запиту
    useEffect(() => {
        if (isOpen) {
            loadExistingRequest();
        }
    }, [isOpen]);

    // Блокування прокрутки сторінки при відкритому модальному вікні
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
            const response = await requestNameChange(formData);
            setSuccess('Запит на зміну імені створено успішно! Модератори розглянуть його протягом 1-3 робочих днів.');
            setFormData({
                newFirstName: '',
                newLastName: '',
                newDisplayName: '',
                reason: ''
            });
            await loadExistingRequest();
        } catch (error) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Помилка при створенні запиту. Спробуйте ще раз.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        try {
            await cancelNameChangeRequest();
            setExistingRequest(null);
            setSuccess('Запит скасовано успішно');
        } catch (error) {
            setError('Помилка при скасуванні запиту');
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
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden modal-content ${
                isClosing ? '' : 'animate-modal-slide-in'
            }`} onClick={(e) => e.stopPropagation()}>
                {/* Заголовок */}
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-4 relative overflow-hidden flex-shrink-0">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                                <User className="w-6 h-6 text-white animate-icon-shake" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white drop-shadow-lg">Зміна імені та прізвища</h2>
                                <p className="text-sm text-white/90">Запит буде розглянуто модераторами</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm group"
                        >
                            <X className="w-5 h-5 spin-close" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-6 py-6">
                    {/* Існуючий запит */}
                    {existingRequest && (
                        <div className={`mb-4 p-3 rounded-xl border ${getStatusColor(existingRequest.status)}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(existingRequest.status)}
                                <span className="font-semibold">
                                    {getStatusText(existingRequest.status)}
                                </span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p><strong>Нове ім'я:</strong> {existingRequest.newFirstName} {existingRequest.newLastName}</p>
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
                                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                >
                                    Скасувати запит
                                </button>
                            )}
                        </div>
                    )}

                    {/* Форма для нового запиту */}
                    {(!existingRequest || existingRequest.status !== 'pending') && (
                        <form onSubmit={handleSubmit} className="space-y-2">
                            {/* Поточне ім'я */}
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Поточне ім'я</h3>
                                <p className="text-gray-700 text-sm">{currentName}</p>
                            </div>

                            {/* Нове ім'я */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Нове ім'я *
                                    </label>
                                    <input
                                        type="text"
                                        name="newFirstName"
                                        value={formData.newFirstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Введіть нове ім'я"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Нове прізвище *
                                    </label>
                                    <input
                                        type="text"
                                        name="newLastName"
                                        value={formData.newLastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Введіть нове прізвище"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Відображуване ім'я *
                                </label>
                                <input
                                    type="text"
                                    name="newDisplayName"
                                    value={formData.newDisplayName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Як ви хочете, щоб вас називали"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Причина зміни (опціонально)
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Поясніть причину зміни імені..."
                                />
                            </div>

                            {/* Повідомлення про помилки */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <span className="text-red-700 text-sm">{error}</span>
                                </div>
                            )}

                            {/* Повідомлення про успіх */}
                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-green-700 text-sm">{success}</span>
                                </div>
                            )}

                            {/* Кнопки */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-102 active:scale-98"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-102 active:scale-98 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? 'Створення запиту...' : 'Створити запит'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Інформація про процес */}
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1 text-sm">Як працює зміна імені?</h4>
                                <ul className="text-xs text-blue-800 space-y-0.5">
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
        </div>,
        document.body
    );
};

export default NameChangeModal;
