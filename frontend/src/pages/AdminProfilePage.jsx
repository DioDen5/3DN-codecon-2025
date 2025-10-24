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
import { getAdminStats, getAdminUsers, getAdminReports, getAdminNameChangeRequests } from '../api/admin-stats';

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
                
                // Мок дані для активності (поки що)
                setRecentActivity([
                    { id: 1, type: 'user_registered', user: 'Іван Петренко', time: '2 хв тому', status: 'success' },
                    { id: 2, type: 'comment_reported', user: 'Марія Сидоренко', time: '15 хв тому', status: 'warning' },
                    { id: 3, type: 'name_change_approved', user: 'Олександр Коваленко', time: '1 год тому', status: 'success' },
                    { id: 4, type: 'announcement_published', user: 'Доктор Петренко', time: '2 год тому', status: 'info' }
                ]);
                
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
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2" />
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-green-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        Остання активність
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-2 h-2 rounded-full ${
                                    activity.status === 'success' ? 'bg-green-500' :
                                    activity.status === 'warning' ? 'bg-yellow-500' :
                                    activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                                }`}></div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                                    <div className="text-xs text-gray-600">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{user.name}</div>
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

    const renderReportsTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Скарги на розгляді</h3>
                <div className="space-y-3">
                    {pendingReports.map((report) => (
                        <div key={report.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Скарга #{report.id}</div>
                                    <div className="text-sm text-gray-600">Від: {report.reporter}</div>
                                    <div className="text-sm text-gray-600">Причина: {report.reason}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                                        Розглянути
                                    </button>
                                    <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                                        Відхилити
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
                                        className={`profile-tab flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex-1 ${
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
