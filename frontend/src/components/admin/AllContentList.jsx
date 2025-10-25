import React, { useState } from 'react';
import { FileText, Star, Eye } from 'lucide-react';
import StarRating from '../StarRating';
import ContentViewModal from '../ContentViewModal';

const AllContentList = ({ 
    allModerationContent, 
    handleDeleteItem,
    handleApproveItem,
    onContentDeleted,
    approvedItems
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
    };
    if (!allModerationContent || allModerationContent.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 content-icon-glow content-icon-pulse content-icon-rotate relative overflow-hidden">
                    <div className="absolute inset-0 content-icon-shimmer opacity-30"></div>
                    <FileText className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Весь контент</h4>
                <p className="text-gray-600">Немає контенту для модерації</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {allModerationContent.map((item, index) => (
                <div key={item._id} className={`rounded-xl p-4 border transition-all duration-500 ease-out relative ${
                    approvedItems.has(item._id) 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-green-200 shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:moderation-glow'
                }`} style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    item.contentType === 'announcement' ? 'bg-blue-500' :
                                    item.contentType === 'comment' ? 'bg-green-500' :
                                    'bg-purple-500'
                                }`}>
                                    {item.authorId?.displayName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {item.contentType === 'announcement' ? item.title :
                                         item.contentType === 'comment' ? 'Коментар' :
                                         'Відгук про викладача'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Автор: {item.authorId?.displayName || 'Невідомий'} • {new Date(item.createdAt).toLocaleDateString('uk-UA')}
                                    </div>
                                </div>
                            </div>
                            {approvedItems.has(item._id) && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Перевірено
                                </div>
                            )}
                            <p className="text-gray-700 mb-3">
                                {item.contentType === 'announcement' ? item.body?.substring(0, 100) + '...' :
                                 item.contentType === 'comment' ? item.body?.substring(0, 150) + '...' :
                                 item.body?.substring(0, 150) + '...'}
                            </p>
                            {item.contentType === 'review' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <StarRating 
                                        rating={item.rating} 
                                        maxRating={5} 
                                        size="sm" 
                                        showNumber={false}
                                        animated={false}
                                    />
                                    <span className="text-sm text-gray-600">{item.rating}/5</span>
                                    <span className="text-sm text-gray-500">• {item.teacherId?.name || 'Викладач'}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleOpenViewModal(item)}
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

export default AllContentList;
