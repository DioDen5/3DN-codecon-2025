import React, { useState } from 'react';
import { User, Activity, Settings, Mail, Calendar, Award, MessageCircle, ThumbsUp, Star } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';

const UserProfilePage = () => {
    const { user } = useAuthState();
    const [activeTab, setActiveTab] = useState('profile');

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

    const getUserDisplayName = () => {
        if (user?.displayName) return user.displayName;
        if (user?.email) return user.email.split('@')[0];
        return 'Невідомий';
    };

    const getUserEmail = () => {
        return user?.email || 'Невідомо';
    };

    const getRegistrationDate = () => {
        return user?.createdAt ? formatDate(user.createdAt) : 'Невідомо';
    };

    // Мокові дані для статистики (потім замінимо на реальні)
    const stats = {
        discussions: 12,
        comments: 45,
        reviews: 8,
        totalLikes: 127,
        rating: 4.2
    };

    const achievements = [
        { id: 'first_post', name: 'Перший пост', description: 'Створив перше обговорення', earned: true },
        { id: 'active_commenter', name: 'Активний коментатор', description: '10+ коментарів', earned: true },
        { id: 'critic', name: 'Критик', description: '5+ відгуків про викладачів', earned: true },
        { id: 'popular', name: 'Популярний', description: '50+ лайків', earned: false },
        { id: 'veteran', name: 'Ветеран', description: 'На сайті 6+ місяців', earned: false }
    ];

    const recentActivity = [
        { type: 'discussion', title: 'Питання про математику', date: '2 години тому', likes: 5 },
        { type: 'comment', title: 'Коментар до "Фізика"', date: '1 день тому', likes: 2 },
        { type: 'review', title: 'Відгук про викладача', date: '3 дні тому', likes: 8 },
        { type: 'discussion', title: 'Проблеми з хімією', date: '1 тиждень тому', likes: 12 }
    ];

    const renderProfileTab = () => (
        <div className="space-y-8">
            {/* Заголовок профілю */}
            <div className="profile-card p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
                <div className="relative z-10 flex items-center space-x-8">
                    <div className="profile-avatar w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            {getUserDisplayName()}
                        </h1>
                        <p className="text-blue-100 flex items-center gap-3 text-lg mb-2">
                            <Mail size={20} className="profile-icon" />
                            {getUserEmail()}
                        </p>
                        <p className="text-blue-200 flex items-center gap-3 text-lg mb-4">
                            <Calendar size={20} className="profile-icon" />
                            Зареєстрований {getRegistrationDate()}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="profile-badge">
                                ✅ Верифікований студент
                            </span>
                            <span className="profile-badge">
                                🌟 Активний учасник
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="profile-stats-card p-6 text-center group cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.discussions}</div>
                    <div className="text-sm text-gray-300 font-medium">Обговорень</div>
                </div>
                <div className="profile-stats-card p-6 text-center group cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.comments}</div>
                    <div className="text-sm text-gray-300 font-medium">Коментарів</div>
                </div>
                <div className="profile-stats-card p-6 text-center group cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Star className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.reviews}</div>
                    <div className="text-sm text-gray-300 font-medium">Відгуків</div>
                </div>
                <div className="profile-stats-card p-6 text-center group cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ThumbsUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalLikes}</div>
                    <div className="text-sm text-gray-300 font-medium">Лайків</div>
                </div>
                <div className="profile-stats-card p-6 text-center group cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.rating}</div>
                    <div className="text-sm text-gray-300 font-medium">Рейтинг</div>
                </div>
            </div>

            {/* Досягнення */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-yellow-500" />
                    Досягнення
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => (
                        <div
                            key={achievement.id}
                            className={`profile-achievement p-6 cursor-pointer ${
                                achievement.earned
                                    ? 'opacity-100'
                                    : 'opacity-60'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                    achievement.earned 
                                        ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                }`}>
                                    {achievement.earned ? (
                                        <span className="text-white text-xl font-bold">✓</span>
                                    ) : (
                                        <span className="text-white text-xl font-bold">○</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${
                                        achievement.earned ? 'text-white' : 'text-gray-300'
                                    }`}>
                                        {achievement.name}
                                    </h4>
                                    <p className={`text-sm ${
                                        achievement.earned ? 'text-white/80' : 'text-gray-400'
                                    }`}>
                                        {achievement.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderActivityTab = () => (
        <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" />
                    Остання активність
                </h3>
                <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                        <div 
                            key={index} 
                            className="profile-activity-item p-6 cursor-pointer"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                        activity.type === 'discussion' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                        activity.type === 'comment' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                                        'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                    }`}>
                                        {activity.type === 'discussion' ? (
                                            <MessageCircle className="w-6 h-6 text-white" />
                                        ) : activity.type === 'comment' ? (
                                            <MessageCircle className="w-6 h-6 text-white" />
                                        ) : (
                                            <Star className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{activity.title}</h4>
                                        <p className="text-sm text-gray-300">{activity.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                                    <ThumbsUp className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-bold text-purple-600">{activity.likes}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-purple-500" />
                    Налаштування профілю
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Ім'я та прізвище
                        </label>
                        <input
                            type="text"
                            defaultValue={getUserDisplayName()}
                            className="profile-input w-full px-4 py-3 text-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            value={getUserEmail()}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500 text-lg"
                        />
                        <p className="text-sm text-gray-500 mt-2">Email не можна змінити</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-red-500" />
                    Безпека
                </h3>
                <button className="profile-button w-full px-6 py-4 text-lg font-bold">
                    Змінити пароль
                </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-green-500" />
                    Приватність
                </h3>
                <div className="space-y-4">
                    <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl cursor-pointer hover:shadow-md transition-all">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                        <span className="text-lg font-medium text-white">Дозволити іншим бачити мій профіль</span>
                    </label>
                    <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl cursor-pointer hover:shadow-md transition-all">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-green-600" />
                        <span className="text-lg font-medium text-white">Отримувати сповіщення про нові коментарі</span>
                    </label>
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
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Анімовані фонові елементи */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
                {/* Таби */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2">
                        <nav className="flex space-x-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`profile-tab flex items-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    >
                                        <Icon size={20} className={activeTab === tab.id ? 'profile-icon' : ''} />
                                        {tab.label}
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
        </div>
    );
};

export default UserProfilePage;
