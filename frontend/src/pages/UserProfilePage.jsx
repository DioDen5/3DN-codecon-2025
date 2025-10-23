import React, { useState, useEffect } from 'react';
import { User, Activity, Settings, Mail, Calendar, Award, MessageCircle, MessageSquare, ThumbsUp, Star, GraduationCap, Edit3, Clock, CheckCircle, AlertCircle, Shield, Lock, Key, Power, ToggleRight, Play, Smartphone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { getUserStats, getUserActivity } from '../api/user-stats';
import { getNameChangeStatus } from '../api/name-change';
import NameChangeModal from '../components/NameChangeModal';

const UserProfilePage = () => {
    const { user } = useAuthState();
    const [activeTab, setActiveTab] = useState(() => {
        // Відновлюємо вибрану вкладку з localStorage або використовуємо 'profile' за замовчуванням
        return localStorage.getItem('userProfileActiveTab') || 'profile';
    });
    const [stats, setStats] = useState({
        discussions: 0,
        comments: 0,
        reviews: 0,
        totalLikes: 0
    });
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalActivities: 0
    });
    const [nameChangeRequest, setNameChangeRequest] = useState(null);
    const [showNameChangeModal, setShowNameChangeModal] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({
        anonymousTeacherReviews: false,
        emailOnPostComments: true
    });
    const [checkboxAnimations, setCheckboxAnimations] = useState({
        anonymousTeacherReviews: false,
        emailOnPostComments: false
    });

    // Функція для зміни вкладки з збереженням в localStorage
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        localStorage.setItem('userProfileActiveTab', tabId);
    };

    // Функція для завантаження статистики
    const loadUserStats = async () => {
        try {
            setLoading(true);
            const userStats = await getUserStats();
            setStats(userStats);
        } catch (error) {
            console.error('Error loading user stats:', error);
            // Використовуємо значення за замовчуванням при помилці
        } finally {
            setLoading(false);
        }
    };

    // Функція для завантаження статусу запиту на зміну імені
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

    // Функція для завантаження активності
    const loadUserActivity = async (page = 1, animate = true) => {
        try {
            if (animate) {
                setActivityLoading(true);
            }
            const response = await getUserActivity(page, 5);
            
            if (animate) {
                // Плавна анімація зміни контенту
                setActivity([]);
                setTimeout(() => {
                    setActivity(response.activities || []);
                    setPagination(response.pagination || {
                        currentPage: 1,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPrevPage: false,
                        totalActivities: 0
                    });
                    setCurrentPage(page);
                }, 150);
            } else {
                setActivity(response.activities || []);
                setPagination(response.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                    totalActivities: 0
                });
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error loading user activity:', error);
            setActivity([]);
        } finally {
            if (animate) {
                setTimeout(() => {
                    setActivityLoading(false);
                }, 300);
            }
        }
    };

    // Функції для навігації по сторінках
    const handleNextPage = () => {
        if (pagination.hasNextPage) {
            loadUserActivity(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.hasPrevPage) {
            loadUserActivity(currentPage - 1);
        }
    };

    // Завантаження статистики користувача
    useEffect(() => {
        if (user) {
            loadUserStats();
            loadNameChangeStatus();
        }
    }, [user]);

    // Оновлення статистики тільки при переключенні на вкладку профілю
    useEffect(() => {
        if (user && activeTab === 'profile') {
            loadUserStats();
        }
    }, [activeTab, user]);

    // Завантаження активності при переключенні на вкладку активності
    useEffect(() => {
        if (user && activeTab === 'activity') {
            loadUserActivity();
        }
    }, [activeTab, user]);

    // Оновлення активності при фокусі на сторінку
    useEffect(() => {
        const handleFocus = () => {
            if (user && activeTab === 'activity') {
                loadUserActivity();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, activeTab]);

    const tabs = [
        { id: 'profile', label: 'Профіль', icon: User },
        { id: 'activity', label: 'Активність', icon: Activity },
        { id: 'settings', label: 'Налаштування', icon: Settings }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Невідомо';
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Функція для форматування відносної дати
    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'щойно';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} хвилин тому`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} годин тому`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} днів тому`;
        } else if (diffInSeconds < 2592000) {
            const weeks = Math.floor(diffInSeconds / 604800);
            return `${weeks} тижнів тому`;
        } else {
            return formatDate(dateString);
        }
    };

    const getUserDisplayName = () => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return 'Невідомий';
    };

    const getUserEmail = () => {
        return user?.email || 'student@lnu.edu.ua';
    };

    const getRegistrationDate = () => {
        return user?.createdAt ? formatDate(user.createdAt) : 'Невідомо';
    };

    // Функції для обробки модального вікна зміни імені
    const handleOpenNameChangeModal = () => {
        setShowNameChangeModal(true);
    };

    const handleCloseNameChangeModal = () => {
        setShowNameChangeModal(false);
        // Перезавантажуємо статус після закриття модального вікна
        loadNameChangeStatus();
    };

    const handlePrivacySettingChange = (setting, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: value
        }));
        
        // Запускаємо анімацію
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
        
        // Тут можна додати API виклик для збереження налаштувань
        console.log(`Privacy setting ${setting} changed to:`, value);
    };

    // Функція для правильного склонування українською мовою
    const getPluralForm = (count, forms) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return forms[0]; // 1, 21, 31, 41, 51, 61, 71, 81, 91
        } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
            return forms[1]; // 2-4, 22-24, 32-34, 42-44, 52-54, 62-64, 72-74, 82-84, 92-94
        } else {
            return forms[2]; // 0, 5-20, 25-30, 35-40, 45-50, 55-60, 65-70, 75-80, 85-90, 95-100
        }
    };

    // Динамічні досягнення на основі реальних даних
    const getAchievements = () => {
        const userJoinDate = user?.createdAt ? new Date(user.createdAt) : null;
        const monthsOnSite = userJoinDate ? Math.floor((new Date() - userJoinDate) / (1000 * 60 * 60 * 24 * 30)) : 0;

        return [
            { 
                id: 'first_post', 
                name: 'Перший пост', 
                description: 'Створив перше обговорення', 
                earned: stats.discussions >= 1,
                progress: Math.min(stats.discussions, 1),
                target: 1
            },
            { 
                id: 'active_commenter', 
                name: 'Активний коментатор', 
                description: '10+ коментарів', 
                earned: stats.comments >= 10,
                progress: Math.min(stats.comments, 10),
                target: 10
            },
            { 
                id: 'critic', 
                name: 'Критик', 
                description: '5+ відгуків про викладачів', 
                earned: stats.reviews >= 5,
                progress: Math.min(stats.reviews, 5),
                target: 5
            },
            { 
                id: 'popular', 
                name: 'Популярний', 
                description: '50+ лайків', 
                earned: stats.totalLikes >= 50,
                progress: Math.min(stats.totalLikes, 50),
                target: 50
            },
            { 
                id: 'veteran', 
                name: 'Ветеран', 
                description: 'На сайті 6+ місяців', 
                earned: monthsOnSite >= 6,
                progress: Math.min(monthsOnSite, 6),
                target: 6
            },
            { 
                id: 'discussion_master', 
                name: 'Майстер обговорень', 
                description: '20+ обговорень', 
                earned: stats.discussions >= 20,
                progress: Math.min(stats.discussions, 20),
                target: 20
            },
            { 
                id: 'comment_king', 
                name: 'Король коментарів', 
                description: '50+ коментарів', 
                earned: stats.comments >= 50,
                progress: Math.min(stats.comments, 50),
                target: 50
            },
            { 
                id: 'superstar', 
                name: 'Суперзірка', 
                description: '100+ лайків', 
                earned: stats.totalLikes >= 100,
                progress: Math.min(stats.totalLikes, 100),
                target: 100
            }
        ];
    };

    const achievements = getAchievements();


    const renderProfileTab = () => (
        <div className="space-y-6 md:space-y-8">
            {/* Заголовок профілю */}
            <div className="profile-card bg-white text-black rounded-xl p-4 md:p-8 shadow-sm mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-23 md:h-23 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{getUserDisplayName()}</h1>
                        <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <Mail size={16} />
                            {getUserEmail()}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <GraduationCap size={16} />
                            Студент
                        </p>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats.discussions}</div>
                    <div className="text-xs md:text-sm text-gray-600">
                        {loading ? '...' : getPluralForm(stats.discussions, ['обговорення', 'обговорення', 'обговорень'])}
                    </div>
                </div>
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats.comments}</div>
                    <div className="text-xs md:text-sm text-gray-600">
                        {loading ? '...' : getPluralForm(stats.comments, ['коментар', 'коментарі', 'коментарів'])}
                    </div>
                </div>
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats.reviews}</div>
                    <div className="text-xs md:text-sm text-gray-600">
                        {loading ? '...' : getPluralForm(stats.reviews, ['відгук', 'відгуки', 'відгуків'])}
                    </div>
                </div>
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <ThumbsUp className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalLikes}</div>
                    <div className="text-xs md:text-sm text-gray-600">
                        {loading ? '...' : getPluralForm(stats.totalLikes, ['лайк', 'лайки', 'лайків'])}
                    </div>
                </div>
            </div>

            {/* Досягнення */}
            <div className="bg-white text-black rounded-xl p-4 md:p-6 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Досягнення</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {achievements.map((achievement, index) => (
                        <div
                            key={achievement.id}
                            className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform duration-300 ${
                                achievement.earned
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                                    achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                    {achievement.earned ? (
                                        <span className="text-white text-xs md:text-sm">✓</span>
                                    ) : (
                                        <span className="text-white text-xs md:text-sm">○</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className={`text-sm md:text-base font-medium ${
                                        achievement.earned ? 'text-green-800' : 'text-gray-600'
                                    }`}>
                                        {achievement.name}
                                    </h4>
                                    <p className={`text-xs md:text-sm ${
                                        achievement.earned ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                        {achievement.description}
                                    </p>
                                    {!achievement.earned && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{achievement.progress}/{achievement.target}</span>
                                                <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderActivityTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Остання активність</h3>
                {activityLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Завантаження...</div>
                    </div>
        ) : !activity || activity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Поки що немає активності</p>
                <p className="text-sm">Створіть обговорення або залиште коментар!</p>
            </div>
        ) : (
            <div className="space-y-3 md:space-y-4 transition-all duration-500">
                {activity.map((activityItem, index) => (
                    <div 
                        key={activityItem.id || index} 
                        className="flex items-center justify-between p-3 md:p-4 bg-gray-100 rounded-lg cursor-pointer hover:scale-101 hover:bg-gray-200 transition-all duration-500 transform animate-fadeIn"
                        style={{ 
                            animationDelay: `${index * 0.1}s`,
                            animation: 'fadeIn 0.6s ease-out forwards'
                        }}
                    >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                                        activityItem.type === 'discussion' ? 'bg-blue-500' :
                                        activityItem.type === 'comment' ? 'bg-green-500' :
                                        activityItem.type === 'review' ? 'bg-yellow-500' :
                                        activityItem.type === 'like' ? 'bg-pink-500' :
                                        activityItem.type === 'dislike' ? 'bg-red-500' : 'bg-gray-500'
                                    }`}>
                                        {activityItem.type === 'discussion' ? (
                                            <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        ) : activityItem.type === 'comment' ? (
                                            <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        ) : activityItem.type === 'review' ? (
                                            <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        ) : activityItem.type === 'like' ? (
                                            <ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        ) : activityItem.type === 'dislike' ? (
                                            <ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-white rotate-180" />
                                        ) : (
                                            <Activity className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm md:text-base font-medium text-gray-900">{activityItem.title}</h4>
                                        <p className="text-xs md:text-sm text-gray-500">{formatRelativeDate(activityItem.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                                    <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{activityItem.likes || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Пагінація */}
                {!activityLoading && activity && activity.length > 0 && pagination.totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="relative">
                            {/* Декоративний фон */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl opacity-60"></div>
                            
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40">
                                <div className="flex items-center justify-between">
                                    {/* Кнопка "Попередня" */}
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={!pagination.hasPrevPage}
                                        className={`group relative overflow-hidden px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-500 transform ${
                                            pagination.hasPrevPage
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {pagination.hasPrevPage && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <div className="relative flex items-center gap-2">
                                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    <span>Попередня</span>
                                                </div>
                                            </>
                                        )}
                                        {!pagination.hasPrevPage && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <span>Попередня</span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Центральна інформація */}
                                    <div className="flex items-center gap-4">
                                        {/* Номери сторінок */}
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: Math.min(pagination.totalPages, 4) }, (_, i) => {
                                                const pageNum = i + 1;
                                                const isActive = pageNum === pagination.currentPage;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => loadUserActivity(pageNum)}
                                                        className={`relative w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-500 transform ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md'
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <>
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl animate-pulse opacity-30"></div>
                                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                                                            </>
                                                        )}
                                                        <span className="relative z-10">{pageNum}</span>
                                                    </button>
                                                );
                                            })}
                                            
                                            {pagination.totalPages > 4 && (
                                                <>
                                                    <span className="text-gray-400 font-medium">⋯</span>
                                                    <button
                                                        onClick={() => loadUserActivity(pagination.totalPages)}
                                                        className="w-10 h-10 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md transition-all duration-500"
                                                    >
                                                        {pagination.totalPages}
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Індикатор прогресу */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {pagination.currentPage} з {pagination.totalPages}
                                                </span>
                                            </div>
                                            
                                            {/* Прогрес бар */}
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full relative overflow-hidden"
                                                    style={{ 
                                                        width: `${(pagination.currentPage / pagination.totalPages) * 100}%`,
                                                        animation: 'waterFill 1.5s ease-out'
                                                    }}
                                                >
                                                    {/* Анімація "води" що заповнюється */}
                                                    <div 
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                        style={{ animation: 'waterWave 2s ease-in-out infinite' }}
                                                    ></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full opacity-30 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Кнопка "Наступна" */}
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!pagination.hasNextPage}
                                        className={`group relative overflow-hidden px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-500 transform ${
                                            pagination.hasNextPage
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {pagination.hasNextPage && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <div className="relative flex items-center gap-2">
                                                    <span>Наступна</span>
                                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </>
                                        )}
                                        {!pagination.hasNextPage && (
                                            <div className="flex items-center gap-2">
                                                <span>Наступна</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
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
                            Поточне ім'я та прізвище
                        </label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium">{getUserDisplayName()}</span>
                                </div>
                                <button
                                    onClick={handleOpenNameChangeModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                    <Edit3 size={16} />
                                    Змінити
                                </button>
                            </div>
                        <p className="text-xs text-gray-500 mt-1">Для зміни імені потрібне схвалення модераторів</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Пошта
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{getUserEmail()}</span>
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
                            <p><strong>Нове ім'я:</strong> {nameChangeRequest.newFirstName} {nameChangeRequest.newLastName}</p>
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

            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group security-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-cyan-100/30 to-blue-100/30 rounded-full -translate-x-8 -translate-y-8 animate-ping decorative-element-3" style={{animationDuration: '4s'}}></div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        Безпека
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-100/65 to-blue-200/45 rounded-xl p-4 border border-blue-300/65 group/field security-field">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center security-icon">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Пароль</h4>
                                        <p className="text-sm text-gray-600">Остання зміна: 3 місяці тому</p>
                                    </div>
                                </div>
                                <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl group/btn">
                                    <Key className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                                    Змінити пароль
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-cyan-100/65 to-blue-100/45 rounded-xl p-4 border border-cyan-200/65 group/field security-field">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center security-icon">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Двофакторна автентифікація</h4>
                                    <p className="text-sm text-gray-600">Не активована</p>
                                </div>
                                <div className="ml-auto">
                                    <button className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl group/btn text-sm font-semibold">
                                        <ShieldCheck className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                                        Увімкнути
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                    <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-300 ${
                        privacySettings.anonymousTeacherReviews 
                            ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                            : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                    }`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={privacySettings.anonymousTeacherReviews}
                                    onChange={(e) => handlePrivacySettingChange('anonymousTeacherReviews', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    privacySettings.anonymousTeacherReviews 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-gray-300 hover:border-blue-400'
                                } ${checkboxAnimations.anonymousTeacherReviews ? 'checkbox-pulse' : ''}`}>
                                    {privacySettings.anonymousTeacherReviews && (
                                        <svg className={`w-3 h-3 text-white ${checkboxAnimations.anonymousTeacherReviews ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className={`text-sm font-medium transition-colors duration-200 ${
                                    privacySettings.anonymousTeacherReviews ? 'text-gray-800' : 'text-gray-600'
                                }`}>Анонімні відгуки про викладачів</span>
                                <p className={`text-xs mt-1 transition-colors duration-200 ${
                                    privacySettings.anonymousTeacherReviews ? 'text-gray-600' : 'text-gray-500'
                                }`}>Ваші відгуки про викладачів будуть опубліковані анонімно</p>
                            </div>
                        </label>
                    </div>
                    
                    <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-300 ${
                        privacySettings.emailOnPostComments 
                            ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                            : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                    }`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={privacySettings.emailOnPostComments}
                                    onChange={(e) => handlePrivacySettingChange('emailOnPostComments', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    privacySettings.emailOnPostComments 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-gray-300 hover:border-blue-400'
                                } ${checkboxAnimations.emailOnPostComments ? 'checkbox-pulse' : ''}`}>
                                    {privacySettings.emailOnPostComments && (
                                        <svg className={`w-3 h-3 text-white ${checkboxAnimations.emailOnPostComments ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className={`text-sm font-medium transition-colors duration-200 ${
                                    privacySettings.emailOnPostComments ? 'text-gray-800' : 'text-gray-600'
                                }`}>Email сповіщення про коментарі</span>
                                <p className={`text-xs mt-1 transition-colors duration-200 ${
                                    privacySettings.emailOnPostComments ? 'text-gray-600' : 'text-gray-500'
                                }`}>Отримувати повідомлення на пошту про нові коментарі до ваших постів</p>
                            </div>
                        </label>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ заборонено</h1>
                    <p className="text-gray-600">Потрібно увійти в систему для перегляду профілю</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-3 md:px-6 py-6 md:py-10">
                {/* Таби */}
                <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 mb-6 md:mb-8 overflow-hidden">
                    <div className="bg-gray-200 p-1 md:p-2">
                        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`profile-tab flex items-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        <Icon size={18} className={
                                            activeTab === tab.id && tab.id === 'settings' ? 'profile-icon-once' :
                                            activeTab === tab.id && tab.id === 'activity' ? 'profile-activity-icon' :
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
                {activeTab === 'activity' && renderActivityTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </div>

            {/* Модальне вікно для зміни імені */}
            <NameChangeModal
                isOpen={showNameChangeModal}
                onClose={handleCloseNameChangeModal}
                currentName={getUserDisplayName()}
            />
        </div>
    );
};

export default UserProfilePage;
