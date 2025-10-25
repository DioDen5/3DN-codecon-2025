import React from 'react';

const AdminUsers = ({ usersData }) => {
    return (
        <div className="space-y-6 users-slide-in">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Управління користувачами</h3>
                <div className="space-y-3">
                    {usersData?.map((user) => (
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
};

export default AdminUsers;