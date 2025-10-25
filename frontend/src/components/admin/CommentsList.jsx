import React, { useState } from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import ContentViewModal from '../ContentViewModal';

const CommentsList = ({ 
    commentsContent, 
    handleDeleteItem,
    handleApproveItem,
    onContentDeleted,
    approvedItems,
    loadComments
}) => {
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);

    const handleOpenViewModal = (content) => {
        console.log('Opening view modal for content:', content);
        setSelectedContent(content);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedContent(null);
    };

    const handleContentDeleted = () => {
        if (onContentDeleted) {
            onContentDeleted();
        }
        if (loadComments) {
            loadComments();
        }
    };
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
                <div key={comment._id} className={`rounded-xl p-4 border transition-all duration-500 ease-out relative ${
                    approvedItems.has(comment._id) 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-green-200 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:moderation-glow'
                }`} style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
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
                            {approvedItems.has(comment._id) && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Перевірено
                                </div>
                            )}
                            <p className="text-gray-700 mb-3">{comment.body?.substring(0, 150)}...</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleOpenViewModal(comment)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    Переглянути
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            <ContentViewModal
                isOpen={showViewModal}
                onClose={handleCloseViewModal}
                content={selectedContent}
                onApprove={handleApproveItem}
                onDelete={handleDeleteItem}
                onContentDeleted={handleContentDeleted}
            />
        </div>
    );
};

export default CommentsList;
