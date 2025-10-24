import React from 'react';
import { MessageSquare } from 'lucide-react';

const AnnouncementsList = ({ 
    announcementsContent, 
    handleDeleteItem 
}) => {
    if (!announcementsContent || announcementsContent.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 discussion-icon-glow discussion-icon-pulse discussion-icon-rotate relative overflow-hidden">
                        <div className="absolute inset-0 discussion-icon-shimmer opacity-30"></div>
                        <MessageSquare className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Обговорення</h4>
                    <p className="text-gray-600">Немає обговорень для модерації</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {announcementsContent.map((announcement, index) => (
                <div key={announcement._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:moderation-glow transition-all duration-500 ease-out" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {announcement.authorId?.displayName?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{announcement.title}</div>
                                    <div className="text-sm text-gray-600">
                                        Автор: {announcement.authorId?.displayName || 'Невідомий'} • {new Date(announcement.createdAt).toLocaleDateString('uk-UA')}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-3">{announcement.body?.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    announcement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {announcement.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    announcement.visibility === 'students' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                    {announcement.visibility === 'students' ? 'Студентам' : 'Всім'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors cursor-pointer">
                                    Схваліти
                                </button>
                                <button 
                                    onClick={() => handleDeleteItem(announcement._id, 'announcement')}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors cursor-pointer"
                                >
                                    Видалити
                                </button>
                                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors cursor-pointer">
                                    Переглянути
                                </button>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnnouncementsList;
