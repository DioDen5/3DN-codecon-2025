import React from 'react';
import { UserCog } from 'lucide-react';

const AdminUsers = ({ usersData }) => {
    return (
        <div className="space-y-6 users-slide-in">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 users-icon-glow users-icon-pulse users-icon-rotate users-icon-shimmer relative overflow-hidden">
                            <UserCog className="w-5 h-5 text-white relative z-10" />
                        </div>
                        Управління користувачами
                    </h3>
                <div className="space-y-3">
                    {usersData?.map((user, index) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
                            style={{
                                animation: `slideInFromLeft 0.6s ease-out both`,
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.displayName || user.email || 'User'}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const placeholder = e.target.nextElementSibling;
                                            if (placeholder) {
                                                placeholder.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ display: user.profilePicture ? 'none' : 'flex' }}
                                >
                                    {(user.fullName || user.teacherName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{user.fullName || user.teacherName || user.displayName || user.email || 'Невідомий'}</div>
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
        </div>
    );
};

export default AdminUsers;