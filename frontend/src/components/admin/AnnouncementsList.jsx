import React, { useState } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import ContentViewModal from '../ContentViewModal';

const AnnouncementsList = ({
    announcementsContent,
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
                <div key={announcement._id} className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-gray-50 border-gray-200 hover:moderation-glow" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenViewModal(announcement)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-300/50 active:scale-95 active:shadow-inner transition-all duration-300 cursor-pointer flex items-center gap-1 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <Eye className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                                    <span className="relative z-10">Переглянути</span>
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

export default AnnouncementsList;
