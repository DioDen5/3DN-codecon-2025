import React, { useState, useEffect } from 'react';
import { 
    User, 
    Activity, 
    Settings, 
    Shield, 
    Users, 
    AlertTriangle, 
    BarChart3, 
    MessageSquare, 
    FileText, 
    CheckCircle, 
    Clock, 
    XCircle,
    Eye,
    EyeOff,
    Ban,
    Unlock,
    Mail,
    Phone,
    Calendar,
    Award,
    Star,
    ThumbsUp,
    MessageCircle,
    Edit3,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { getAdminStats, getAdminUsers, getAdminReports, getAdminNameChangeRequests, getAdminActivity, resolveReport, rejectReport } from '../api/admin-stats';

const AdminProfilePage = () => {
    const { user, token } = useAuthState();
    
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('adminProfileActiveTab') || 'dashboard';
    });
    
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        teachers: 0,
        admins: 0,
        activeAnnouncements: 0,
        totalComments: 0,
        pendingReports: 0,
        nameChangeRequests: 0
    });
    
    const [recentActivity, setRecentActivity] = useState([]);
    const [allActivityData, setAllActivityData] = useState([]); // Зберігаємо всі дані
    const [activityPagination, setActivityPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalActivities: 0
    });
    const [pendingReports, setPendingReports] = useState([]);
    const [nameChangeRequests, setNameChangeRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [iconAnimations, setIconAnimations] = useState({
        dashboard: false,
        moderation: false,
        users: false,
        reports: false,
        settings: false
    });

    // Завантаження реальних даних
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                setLoading(true);
                console.log('Loading admin data...');
                console.log('Current user:', user);
                console.log('User role:', user?.role);
                console.log('Token exists:', !!token);

                // Завантажуємо статистику
                console.log('Fetching admin stats...');
                const statsData = await getAdminStats();
                console.log('Admin stats received:', statsData);
                setStats(statsData);

                // Завантажуємо користувачів
                console.log('Fetching admin users...');
                const usersData = await getAdminUsers();
                console.log('Admin users received:', usersData);
                setUsers(usersData);

                // Завантажуємо скарги
                console.log('Fetching admin reports...');
                const reportsData = await getAdminReports();
                console.log('Admin reports received:', reportsData);
                setPendingReports(reportsData);

                // Завантажуємо запити на зміну імені
                console.log('Fetching name change requests...');
                const nameChangeData = await getAdminNameChangeRequests();
                console.log('Name change requests received:', nameChangeData);
                setNameChangeRequests(nameChangeData);

                // Завантажуємо активність
                console.log('Fetching admin activity...');
                const activityData = await getAdminActivity();
                console.log('Admin activity received:', activityData);
                setAllActivityData(activityData); // Зберігаємо всі дані
                setRecentActivity(activityData); // Встановлюємо для відображення
                
                // Розраховуємо пагінацію (4 записи на сторінку)
                const itemsPerPage = 4;
                const totalPages = Math.ceil(activityData.length / itemsPerPage);
                setActivityPagination({
                    currentPage: 1,
                    totalPages: totalPages,
                    hasNextPage: totalPages > 1,
                    hasPrevPage: false,
                    totalActivities: activityData.length
                });
                
            } catch (error) {
                console.error('Error loading admin data:', error);
                // При помилці залишаємо значення за замовчуванням (0)
            } finally {
                setLoading(false);
            }
        };
        
        loadAdminData();
    }, []);

    const handleTabChange = (tabId) => {
        // Перевіряємо, чи таб вже активний
        if (activeTab === tabId) {
            return; // Не запускаємо анімацію, якщо таб вже активний
        }
        
        setActiveTab(tabId);
        localStorage.setItem('adminProfileActiveTab', tabId);
        
        // Запускаємо анімацію для іконки
        setIconAnimations(prev => ({
            ...prev,
            [tabId]: true
        }));
        
        // Вимикаємо анімацію через час
        setTimeout(() => {
            setIconAnimations(prev => ({
                ...prev,
                [tabId]: false
            }));
        }, 800);
    };

    const handlePrevPage = () => {
        if (activityPagination.hasPrevPage) {
            const newPage = activityPagination.currentPage - 1;
            setActivityPagination(prev => ({
                ...prev,
                currentPage: newPage,
                hasNextPage: newPage < prev.totalPages,
                hasPrevPage: newPage > 1
            }));
        }
    };

    const handleNextPage = () => {
        if (activityPagination.hasNextPage) {
            const newPage = activityPagination.currentPage + 1;
            setActivityPagination(prev => ({
                ...prev,
                currentPage: newPage,
                hasNextPage: newPage < prev.totalPages,
                hasPrevPage: newPage > 1
            }));
        }
    };

    const handlePageClick = (page) => {
        // Плавна анімація зміни контенту без перезавантаження
        setActivityPagination(prev => ({
            ...prev,
            currentPage: page,
            hasNextPage: page < prev.totalPages,
            hasPrevPage: page > 1
        }));
    };

    const tabs = [
        { id: 'dashboard', label: 'Панель управління', icon: BarChart3 },
        { id: 'moderation', label: 'Модерація', icon: Shield },
        { id: 'users', label: 'Користувачі', icon: Users },
        { id: 'reports', label: 'Скарги', icon: AlertTriangle },
        { id: 'settings', label: 'Налаштування', icon: Settings }
    ];

    const renderDashboardTab = () => (
        <div className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-xs md:text-sm text-gray-600">Всього користувачів</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.activeAnnouncements}</div>
                    <div className="text-xs md:text-sm text-gray-600">Активних обговорень</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalComments}</div>
                    <div className="text-xs md:text-sm text-gray-600">Коментарів</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.pendingReports}</div>
                    <div className="text-xs md:text-sm text-gray-600">Скарг на розгляді</div>
                </div>
            </div>

            {/* Розподіл користувачів */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        Розподіл користувачів
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
                            <div className="text-sm text-gray-600">Студенти</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.teachers}</div>
                            <div className="text-sm text-gray-600">Викладачі</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                            <div className="text-sm text-gray-600">Адміністратори</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Остання активність */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        Остання активність
                    </h3>
                    <div className="space-y-3 transition-all duration-500 ease-in-out">
                        {recentActivity
                            .slice((activityPagination.currentPage - 1) * 4, activityPagination.currentPage * 4)
                            .map((activity, index) => (
                            <div 
                                key={activity.id} 
                                className="flex items-center gap-3 p-3 bg-gray-300/40 rounded-lg transition-all duration-500 ease-in-out hover:bg-gray-200/60 hover:shadow-sm transform hover:scale-[1.02]"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.5s ease-out forwards'
                                }}
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    activity.status === 'success' ? 'bg-green-500' :
                                    activity.status === 'warning' ? 'bg-yellow-500' :
                                    activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                                }`}></div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        {activity.user}
                                        <span className="text-xs text-gray-500">• {activity.time}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">{activity.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Пагінація - показується тільки при мінімум 4 записах */}
                    {recentActivity.length >= 4 && activityPagination.totalPages > 1 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="relative">
                                {/* Декоративний фон */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl opacity-60"></div>
                                
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40">
                                    <div className="flex items-center justify-between">
                                        {/* Кнопка "Попередня" */}
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={!activityPagination.hasPrevPage}
                                            className={`group relative overflow-hidden px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-500 transform ${
                                                activityPagination.hasPrevPage
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 cursor-pointer hover:from-blue-600 hover:to-blue-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {activityPagination.hasPrevPage && (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative flex items-center gap-2">
                                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        <span className="transition-all duration-300 group-hover:font-semibold">Попередня</span>
                                                    </div>
                                                </>
                                            )}
                                            {!activityPagination.hasPrevPage && (
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
                                                {Array.from({ length: Math.min(activityPagination.totalPages, 4) }, (_, i) => {
                                                    const pageNum = i + 1;
                                                    const isActive = pageNum === activityPagination.currentPage;
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageClick(pageNum)}
                                                            className={`relative w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-500 transform cursor-pointer ${
                                                                isActive
                                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50'
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
                                                
                                                {activityPagination.totalPages > 4 && (
                                                    <>
                                                        <span className="text-gray-400 font-medium">⋯</span>
                                                        <button
                                                            onClick={() => handlePageClick(activityPagination.totalPages)}
                                                            className="w-10 h-10 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-500 cursor-pointer"
                                                        >
                                                            {activityPagination.totalPages}
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Індикатор прогресу */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {activityPagination.currentPage} з {activityPagination.totalPages}
                                                    </span>
                                                </div>
                                                
                                                {/* Прогрес бар */}
                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full relative overflow-hidden"
                                                        style={{ 
                                                            width: `${(activityPagination.currentPage / activityPagination.totalPages) * 100}%`,
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
                                            disabled={!activityPagination.hasNextPage}
                                            className={`group relative overflow-hidden px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-500 transform ${
                                                activityPagination.hasNextPage
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 cursor-pointer hover:from-blue-600 hover:to-blue-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {activityPagination.hasNextPage && (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative flex items-center gap-2">
                                                        <span className="transition-all duration-300 group-hover:font-semibold">Наступна</span>
                                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </>
                                            )}
                                            {!activityPagination.hasNextPage && (
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
        </div>
    );

    const renderModerationTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Модерація контенту</h3>
                <p className="text-gray-600">Тут буде інтерфейс для модерації оголошень та коментарів</p>
            </div>
        </div>
    );

    const renderUsersTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Управління користувачами</h3>
                <div className="space-y-3">
                    {users.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{user.displayName || user.email || 'Невідомий'}</div>
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                    user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                    {user.role === 'student' ? 'Студент' :
                                     user.role === 'teacher' ? 'Викладач' : 'Адмін'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    user.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.status === 'verified' ? 'Верифікований' : 'Очікує'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const handleResolveReport = async (reportId) => {
        try {
            console.log('Resolving report with ID:', reportId);
            await resolveReport(reportId);
            // Перезавантажуємо дані
            await loadAdminData();
        } catch (error) {
            console.error('Error resolving report:', error);
            console.error('Error details:', error.response?.data);
            alert(`Помилка при розгляді скарги: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleRejectReport = async (reportId) => {
        try {
            console.log('Rejecting report with ID:', reportId);
            await rejectReport(reportId);
            // Перезавантажуємо дані
            await loadAdminData();
        } catch (error) {
            console.error('Error rejecting report:', error);
            console.error('Error details:', error.response?.data);
            alert(`Помилка при відхиленні скарги: ${error.response?.data?.error || error.message}`);
        }
    };

    const renderReportsTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Скарги на розгляді</h3>
                {pendingReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Немає скарг на розгляді
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingReports.map((report) => (
                            <div key={report._id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">
                                            Скарга на {report.targetType === 'announcement' ? 'обговорення' : report.targetType === 'comment' ? 'коментар' : report.targetType === 'review' ? 'відгук' : 'користувача'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Від: {report.reporterId?.displayName || report.reporterId?.email || 'Невідомий'}
                                        </div>
                                        {report.reason && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Причина: {report.reason}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(report.createdAt).toLocaleString('uk-UA')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleResolveReport(report._id)}
                                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 cursor-pointer transition-colors"
                                        >
                                            Розглянути
                                        </button>
                                        <button 
                                            onClick={() => handleRejectReport(report._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 cursor-pointer transition-colors"
                                        >
                                            Відхилити
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Системні налаштування</h3>
                <p className="text-gray-600">Тут будуть налаштування системи</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Завантаження...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-10">
                {/* Заголовок */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Панель адміністратора
                    </h1>
                    <p className="text-gray-300">
                        Управління системою та модерація контенту
                    </p>
                </div>

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
                                            className={`profile-tab flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex-1 cursor-pointer ${
                                                tab.id === 'dashboard' ? 'ml-2' : tab.id === 'settings' ? 'mr-2' : ''
                                            } ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                            }`}
                                    >
                                        <Icon 
                                            size={18} 
                                            className={
                                                iconAnimations[tab.id] ? 
                                                    tab.id === 'dashboard' ? 'admin-icon-bounce' :
                                                    tab.id === 'moderation' ? 'admin-icon-pulse' :
                                                    tab.id === 'users' ? 'admin-icon-shake' :
                                                    tab.id === 'reports' ? 'admin-icon-bounce' :
                                                    tab.id === 'settings' ? 'admin-icon-rotate' : ''
                                                : ''
                                            }
                                        />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Контент табів */}
                {activeTab === 'dashboard' && renderDashboardTab()}
                {activeTab === 'moderation' && renderModerationTab()}
                {activeTab === 'users' && renderUsersTab()}
                {activeTab === 'reports' && renderReportsTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </div>
        </div>
    );
};

export default AdminProfilePage;
