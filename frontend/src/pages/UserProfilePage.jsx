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
            <div className="profile-card bg-white text-black rounded-xl p-6 shadow-sm mb-8">
                <div className="flex items-center space-x-6">
                    <div className="profile-avatar w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{getUserDisplayName()}</h1>
                        <p className="text-gray-600 flex items-center gap-2">
                            <Mail size={16} />
                            {getUserEmail()}
                        </p>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={16} />
                            Зареєстрований {getRegistrationDate()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                ✅ Верифікований студент
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white text-black rounded-xl p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.discussions}</div>
                    <div className="text-sm text-gray-600">Обговорень</div>
                </div>
                <div className="bg-white text-black rounded-xl p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.comments}</div>
                    <div className="text-sm text-gray-600">Коментарів</div>
                </div>
                <div className="bg-white text-black rounded-xl p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.reviews}</div>
                    <div className="text-sm text-gray-600">Відгуків</div>
                </div>
                <div className="bg-white text-black rounded-xl p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <ThumbsUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Лайків</div>
                </div>
                <div className="bg-white text-black rounded-xl p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stats.rating}</div>
                    <div className="text-sm text-gray-600">Рейтинг</div>
                </div>
            </div>

            {/* Досягнення */}
            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Досягнення</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                        <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform duration-300 ${
                                achievement.earned
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                    {achievement.earned ? (
                                        <span className="text-white text-sm">✓</span>
                                    ) : (
                                        <span className="text-white text-sm">○</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className={`font-medium ${
                                        achievement.earned ? 'text-green-800' : 'text-gray-600'
                                    }`}>
                                        {achievement.name}
                                    </h4>
                                    <p className={`text-sm ${
                                        achievement.earned ? 'text-green-600' : 'text-gray-500'
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
        <div className="space-y-6">
            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Остання активність</h3>
                <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                        <div 
                            key={index} 
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    activity.type === 'discussion' ? 'bg-blue-500' :
                                    activity.type === 'comment' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}>
                                    {activity.type === 'discussion' ? (
                                        <MessageCircle className="w-4 h-4 text-white" />
                                    ) : activity.type === 'comment' ? (
                                        <MessageCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <Star className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                    <p className="text-sm text-gray-500">{activity.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ThumbsUp className="w-4 h-4" />
                                {activity.likes}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Налаштування профілю</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ім'я та прізвище
                        </label>
                        <input
                            type="text"
                            defaultValue={getUserDisplayName()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:scale-105"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={getUserEmail()}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email не можна змінити</p>
                    </div>
                </div>
            </div>

            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Безпека</h3>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105">
                    Змінити пароль
                </button>
            </div>

            <div className="bg-white text-black rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Приватність</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Дозволити іншим бачити мій профіль</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Отримувати сповіщення про нові коментарі</span>
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
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Таби */}
                <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
                    <div className="bg-gray-200 p-2">
                        <nav className="flex space-x-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`profile-tab flex items-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        <Icon size={20} className={activeTab === tab.id && tab.id === 'settings' ? 'profile-icon-once' : ''} />
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
