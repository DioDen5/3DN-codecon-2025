import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, Settings, Mail, Calendar, Award, MessageCircle, MessageSquare, ThumbsUp, Star, GraduationCap, BookOpen, Shield, Lock, Key, Power, ToggleRight, Play, Smartphone, ShieldCheck, Eye, EyeOff, Edit3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { getNameChangeStatus } from '../api/name-change';
import StarRating from '../components/StarRating';
import NameChangeModal from '../components/NameChangeModal';

const TeacherProfilePageNew = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthState();
    
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('teacherProfileActiveTab') || 'profile';
    });
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        reviews: 0,
        averageRating: 0,
        totalLikes: 0,
        totalDislikes: 0
    });
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [privacySettings, setPrivacySettings] = useState({
        showContactInfo: true,
        emailOnNewReviews: true
    });
    const [checkboxAnimations, setCheckboxAnimations] = useState({
        showContactInfo: false,
        emailOnNewReviews: false
    });
    const [fieldAnimations, setFieldAnimations] = useState({
        showContactInfo: false,
        emailOnNewReviews: false
    });
    const [nameChangeRequest, setNameChangeRequest] = useState(null);
    const [showNameChangeModal, setShowNameChangeModal] = useState(false);

    // Мок дані для демонстрації
    useEffect(() => {
        // Симуляція завантаження
        setTimeout(() => {
            setTeacher({
                _id: user?.id || id,
                name: user?.displayName || 'Доктор Олександр Петренко',
                university: 'Київський національний університет',
                department: 'Кафедра комп\'ютерних наук',
                position: 'Професор',
                academicDegree: 'Доктор технічних наук',
                bio: 'Спеціаліст з штучного інтелекту та машинного навчання. Автор понад 50 наукових публікацій та 3 монографій. Досвідчений викладач з глибокими знаннями в галузі AI/ML.',
                image: '/api/placeholder/300/400',
                email: user?.email || 'o.petrenko@university.edu.ua',
                phone: '+380 44 123 45 67',
                rating: 8.5,
                totalReviews: 47,
                isOwner: user?.role === 'teacher'
            });
            
            setStats({
                reviews: 47,
                averageRating: 8.5,
                totalLikes: 156,
                totalDislikes: 23
            });
            
            setReviews([
                {
                    id: 1,
                    author: 'Анонімний студент',
                    rating: 9,
                    comment: 'Чудовий викладач! Дуже доступно пояснює складні теми.',
                    date: '2024-01-15',
                    isAnonymous: true
                },
                {
                    id: 2,
                    author: 'Марія Іваненко',
                    rating: 8,
                    comment: 'Дуже цікаві лекції, але іноді занадто швидко.',
                    date: '2024-01-10',
                    isAnonymous: false
                }
            ]);
            
            setLoading(false);
            setReviewsLoading(false);
        }, 1000);
    }, [id, user]);

    // Завантаження статусу запиту на зміну імені
    useEffect(() => {
        if (user) {
            loadNameChangeStatus();
        }
    }, [user]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        localStorage.setItem('teacherProfileActiveTab', tabId);
    };

    // Функції для роботи з модальним вікном зміни імені
    const loadNameChangeStatus = async () => {
        try {
            const response = await getNameChangeStatus();
            if (response.hasRequest) {
                setNameChangeRequest(response.request);
            } else {
                setNameChangeRequest(null);
            }
        } catch (error) {
            console.error('Error loading name change status:', error);
            setNameChangeRequest(null);
        }
    };

    const handleOpenNameChangeModal = () => {
        setShowNameChangeModal(true);
    };

    const handleCloseNameChangeModal = () => {
        setShowNameChangeModal(false);
        // Перезавантажуємо статус після закриття модального вікна
        loadNameChangeStatus();
    };

    // Функція для отримання поточного імені
    const getCurrentDisplayName = () => {
        return user?.displayName || teacher?.name || 'Викладач';
    };

    const handlePrivacySettingChange = (setting, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: value
        }));
        
        // Запускаємо анімацію тільки при зміні на активний стан
        if (value) {
            setFieldAnimations(prev => ({
                ...prev,
                [setting]: true
            }));
            
            // Вимикаємо анімацію через час
            setTimeout(() => {
                setFieldAnimations(prev => ({
                    ...prev,
                    [setting]: false
                }));
            }, 600);
        }
        
        // Запускаємо анімацію чекбокса
        setCheckboxAnimations(prev => ({
            ...prev,
            [setting]: true
        }));
        
        // Вимикаємо анімацію через час
        setTimeout(() => {
            setCheckboxAnimations(prev => ({
                ...prev,
                [setting]: false
            }));
        }, 800);
        
        console.log(`Privacy setting ${setting} changed to:`, value);
    };

    const tabs = [
        { id: 'profile', label: 'Профіль', icon: User },
        { id: 'reviews', label: 'Відгуки', icon: MessageCircle },
        { id: 'settings', label: 'Налаштування', icon: Settings }
    ];

    const renderProfileTab = () => (
        <div className="space-y-6 md:space-y-8">
            {/* Заголовок профілю */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                            {teacher?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{teacher?.name}</h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <GraduationCap size={18} />
                                    <span className="text-sm sm:text-base">{teacher?.university}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BookOpen size={18} />
                                    <span className="text-sm sm:text-base">{teacher?.department}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                <Award size={18} />
                                <span className="text-sm sm:text-base">{teacher?.position}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group stats-card">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100/50 to-emerald-100/30 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Середня оцінка</p>
                                <p className="text-xl font-bold text-gray-900">{stats.averageRating}/10</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group stats-card">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-cyan-100/30 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Відгуків</p>
                                <p className="text-xl font-bold text-gray-900">{stats.reviews}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group stats-card">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-100/50 to-pink-100/30 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <ThumbsUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Подобається</p>
                                <p className="text-xl font-bold text-gray-900">{stats.totalLikes}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group stats-card">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-100/50 to-pink-100/30 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Спеціалізація</p>
                                <p className="text-xl font-bold text-gray-900">AI/ML</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Біографія */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-purple-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Біографія
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{teacher?.bio}</p>
                </div>
            </div>

            {/* Контактна інформація */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/50 to-blue-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        Контактна інформація
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">{teacher?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">{teacher?.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReviewsTab = () => (
        <div className="space-y-6">
            {/* Статистика відгуків */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/50 to-orange-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                        </div>
                        Статистика відгуків
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-gray-900">{stats.averageRating}</div>
                        <div className="flex-1">
                            <StarRating rating={stats.averageRating} maxRating={10} size="lg" showNumber={false} />
                            <p className="text-sm text-gray-600 mt-1">Середня оцінка з {stats.reviews} відгуків</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Список відгуків */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group review-card">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                        <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.author}</p>
                                        <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('uk-UA')}</p>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} maxRating={10} size="sm" showNumber={false} />
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Налаштування профілю */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-settings-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        Налаштування профілю
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ім'я та прізвище
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium">{teacher?.name}</span>
                                </div>
                                <button 
                                    onClick={handleOpenNameChangeModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                    <Edit3 size={16} />
                                    Редагувати
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{teacher?.email}</span>
                                <span className="text-xs text-gray-400 ml-auto">Не можна змінити</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Статус запиту на зміну імені */}
                    {nameChangeRequest && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                {nameChangeRequest.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                                {nameChangeRequest.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {nameChangeRequest.status === 'rejected' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                <h4 className="font-semibold text-gray-900">
                                    {nameChangeRequest.status === 'pending' && 'Запит на зміну імені очікує розгляду'}
                                    {nameChangeRequest.status === 'approved' && 'Запит на зміну імені схвалено'}
                                    {nameChangeRequest.status === 'rejected' && 'Запит на зміну імені відхилено'}
                                </h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Нове ім'я:</strong> {nameChangeRequest.newFirstName} {nameChangeRequest.newMiddleName ? nameChangeRequest.newMiddleName + ' ' : ''}{nameChangeRequest.newLastName}</p>
                                <p><strong>Відображуване ім'я:</strong> {nameChangeRequest.newDisplayName}</p>
                                {nameChangeRequest.reason && (
                                    <p><strong>Причина:</strong> {nameChangeRequest.reason}</p>
                                )}
                                <p><strong>Дата створення:</strong> {new Date(nameChangeRequest.createdAt).toLocaleDateString('uk-UA')}</p>
                                {nameChangeRequest.reviewComment && (
                                    <p><strong>Коментар модератора:</strong> {nameChangeRequest.reviewComment}</p>
                                )}
                            </div>
                            {nameChangeRequest.status === 'pending' && (
                                <button
                                    onClick={handleOpenNameChangeModal}
                                    className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                >
                                    Переглянути деталі
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Налаштування приватності */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group privacy-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                        </div>
                        Приватність
                    </h3>
                    <div className="space-y-4">
                        <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-500 ease-in-out ${
                            privacySettings.showContactInfo 
                                ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                                : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                        } ${fieldAnimations.showContactInfo ? 'privacy-field-active-animation' : ''}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={privacySettings.showContactInfo}
                                        onChange={(e) => handlePrivacySettingChange('showContactInfo', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                        privacySettings.showContactInfo 
                                            ? 'bg-blue-600 border-blue-600' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    } ${checkboxAnimations.showContactInfo ? 'checkbox-pulse' : ''}`}>
                                        {privacySettings.showContactInfo && (
                                            <svg className={`w-3 h-3 text-white ${checkboxAnimations.showContactInfo ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm font-medium transition-colors duration-500 ease-in-out ${
                                        privacySettings.showContactInfo ? 'text-gray-800' : 'text-gray-600'
                                    }`}>Показувати контактну інформацію</span>
                                    <p className={`text-xs mt-1 transition-colors duration-500 ease-in-out ${
                                        privacySettings.showContactInfo ? 'text-gray-600' : 'text-gray-500'
                                    }`}>Дозволити студентам бачити ваш телефон</p>
                                </div>
                            </label>
                        </div>
                        
                        <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-500 ease-in-out ${
                            privacySettings.emailOnNewReviews 
                                ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                                : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                        } ${fieldAnimations.emailOnNewReviews ? 'privacy-field-active-animation' : ''}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={privacySettings.emailOnNewReviews}
                                        onChange={(e) => handlePrivacySettingChange('emailOnNewReviews', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                        privacySettings.emailOnNewReviews 
                                            ? 'bg-blue-600 border-blue-600' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    } ${checkboxAnimations.emailOnNewReviews ? 'checkbox-pulse' : ''}`}>
                                        {privacySettings.emailOnNewReviews && (
                                            <svg className={`w-3 h-3 text-white ${checkboxAnimations.emailOnNewReviews ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm font-medium transition-colors duration-500 ease-in-out ${
                                        privacySettings.emailOnNewReviews ? 'text-gray-800' : 'text-gray-600'
                                    }`}>Email сповіщення про нові відгуки</span>
                                    <p className={`text-xs mt-1 transition-colors duration-500 ease-in-out ${
                                        privacySettings.emailOnNewReviews ? 'text-gray-600' : 'text-gray-500'
                                    }`}>Отримувати повідомлення на пошту про нові відгуки</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Завантаження профілю викладача...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Викладач не знайдений</p>
                    <button 
                        onClick={() => navigate('/teachers')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                    >
                        Повернутися до списку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-3 md:px-6 py-6 md:py-10">
                {/* Кнопка назад */}
                <button
                    onClick={() => navigate('/teachers')}
                    className="text-sm underline text-white hover:text-blue-300 transition mb-6"
                >
                    ← Назад до списку викладачів
                </button>

                {/* Таби */}
                <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 mb-6 md:mb-8 overflow-hidden">
                    <div className="bg-gray-200 p-1 md:p-2">
                        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 justify-center">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`profile-tab flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex-1 ${
                                            tab.id === 'profile' ? 'ml-2' : tab.id === 'settings' ? 'mr-2' : ''
                                        } ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        <Icon size={18} className={
                                            activeTab === tab.id && tab.id === 'settings' ? 'profile-icon-once' :
                                            activeTab === tab.id && tab.id === 'reviews' ? 'profile-reviews-icon' :
                                            activeTab === tab.id && tab.id === 'profile' ? 'profile-profile-icon' : ''
                                        } />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Контент табів */}
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'reviews' && renderReviewsTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </div>

            {/* Модальне вікно для зміни імені */}
            <NameChangeModal
                isOpen={showNameChangeModal}
                onClose={handleCloseNameChangeModal}
                currentName={getCurrentDisplayName()}
            />
        </div>
    );
};

export default TeacherProfilePageNew;
