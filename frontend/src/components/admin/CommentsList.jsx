import React from 'react';
import { MessageCircle } from 'lucide-react';

const CommentsList = ({ 
    commentsContent, 
    handleDeleteItem 
}) => {
    if (!commentsContent || commentsContent.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 comment-icon-glow comment-icon-pulse comment-icon-rotate relative overflow-hidden">
                        <div className="absolute inset-0 comment-icon-shimmer opacity-30"></div>
                        <MessageCircle className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Коментарі</h4>
                    <p className="text-gray-600">Немає коментарів для модерації</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {commentsContent.map((comment, index) => (
                <div key={comment._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:moderation-glow transition-all duration-500 ease-out" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {comment.authorId?.displayName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Коментар</div>
                                    <div className="text-sm text-gray-600">
                                        Автор: {comment.authorId?.displayName || 'Невідомий'} • {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.body?.substring(0, 150)}...</p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors cursor-pointer">
                                    Схваліти
                                </button>
                                <button 
                                    onClick={() => handleDeleteItem(comment._id, 'comment')}
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

export default CommentsList;
