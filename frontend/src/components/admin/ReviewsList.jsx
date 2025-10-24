import React from 'react';
import { Star } from 'lucide-react';

const ReviewsList = ({ 
    reviewsContent, 
    handleDeleteItem 
}) => {
    if (!reviewsContent || reviewsContent.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 review-icon-glow review-icon-pulse review-icon-rotate relative overflow-hidden">
                        <div className="absolute inset-0 review-icon-shimmer opacity-30"></div>
                        <Star className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Відгуки</h4>
                    <p className="text-gray-600">Немає відгуків для модерації</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {reviewsContent.map((review, index) => (
                <div key={review._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:moderation-glow transition-all duration-500 ease-out" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {review.authorId?.displayName?.charAt(0) || 'R'}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Відгук про викладача</div>
                                    <div className="text-sm text-gray-600">
                                        Автор: {review.authorId?.displayName || 'Невідомий'} • {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.body?.substring(0, 150)}...</p>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex">
                                    {[1,2,3,4,5].map((star) => (
                                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">{review.rating}/5</span>
                                <span className="text-sm text-gray-500">• {review.teacherId?.name || 'Викладач'}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors cursor-pointer">
                                    Схваліти
                                </button>
                                <button 
                                    onClick={() => handleDeleteItem(review._id, 'review')}
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

export default ReviewsList;
