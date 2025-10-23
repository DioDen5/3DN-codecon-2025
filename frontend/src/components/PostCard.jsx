import React, { useState } from 'react';
import { MessageCircle, ThumbsDown, ThumbsUp, Flag, MoreVertical, Trash2 } from 'lucide-react';
import ReportModal from './ReportModal';
import DeleteAnnouncementModal from './DeleteAnnouncementModal';
import { remove as deleteAnnouncement } from '../api/announcements';

const PostCard = ({
                      id,
                      username,
                      date,
                      title,
                      content,
                      likes,
                      dislikes,
                      comments,
                      image_url,
                      onClick,
                      onVote,
                      pending = false,
                      voted = null,
                      searchQuery = '',
                      isOwnPost = false,
                      onDelete,
                      isDeletingPost = false
                  }) => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const shortContent = content?.length > 180 ? content.slice(0, 180) + '...' : content || '';

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark 
                    key={index} 
                    className="bg-yellow-300 text-black px-1 rounded font-semibold animate-pulse"
                >
                    {part}
                </mark>
            ) : part
        );
    };

    const handleLike = (e) => {
        e.stopPropagation();
        if (!pending) onVote?.(id, 'like');
    };

    const handleDislike = (e) => {
        e.stopPropagation();
        if (!pending) onVote?.(id, 'dislike');
    };

    const handleReport = (e) => {
        e.stopPropagation();
        setShowReportModal(true);
        setOpenMenu(false);
    };

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setOpenMenu(!openMenu);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
        setOpenMenu(false);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteAnnouncement(id);
            // Оновлення списку відбувається через батьківський компонент
            if (onDelete) {
                onDelete(id);
            }
            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Помилка при видаленні обговорення');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenu && !event.target.closest('.relative')) {
                setOpenMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenu]);

    return (
        <>
        <div
            onClick={onClick}
            className={`text-black p-4 shadow-sm cursor-pointer hover:bg-gray-200 transition space-y-3 relative ${
                isOwnPost ? 'user-content-mega' : 'bg-white rounded-xl'
            } ${
                isDeletingPost ? 'comment-delete-slide' : ''
            }`}
        >
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">@{username}</span>
                    <span className="text-gray-500">{date}</span>
                </div>
                
                <div className="relative">
                    <button
                        onClick={handleMenuToggle}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform ${
                            openMenu 
                                ? (isOwnPost 
                                    ? 'text-blue-600 bg-blue-50 scale-110 shadow-lg' 
                                    : 'text-orange-600 bg-orange-50 scale-110 shadow-lg')
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                        }`}
                        title="Опції"
                    >
                        <MoreVertical 
                            size={16} 
                            className={`transition-all duration-300 ${
                                openMenu ? 'rotate-90 icon-bounce' : 'rotate-0'
                            }`}
                        />
                    </button>
                    
                    {openMenu && (
                        <div className="absolute right-0 top-8 z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl w-[140px] menu-enter backdrop-blur-sm overflow-hidden">
                            {isOwnPost ? (
                                <button
                                    onClick={handleDeleteClick}
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-red-600 bg-transparent hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                                >
                                    <Trash2 size={12} />
                                    Видалити
                                </button>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-orange-600 bg-transparent hover:text-orange-800 hover:bg-orange-50 transition-colors duration-200"
                                >
                                    <Flag size={12} />
                                    Поскаржитися
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <h2 className="font-bold text-md leading-snug">{highlightText(title, searchQuery)}</h2>
            <p className="text-sm text-gray-700">{shortContent}</p>

            {image_url && (
                <img src={image_url} alt={title} className="w-full h-48 object-cover rounded-md" />
            )}

            <div className="flex items-center gap-3 text-sm pt-2">
                <button
                    onClick={handleLike}
                    disabled={pending}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        voted === 'like' ? 'bg-black text-white' : ''
                    } ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="like"
                >
                    <ThumbsUp size={16} />
                    {likes}
                </button>

                <button
                    onClick={handleDislike}
                    disabled={pending}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        voted === 'dislike' ? 'bg-black text-white' : ''
                    } ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="dislike"
                >
                    <ThumbsDown size={16} />
                    {dislikes}
                </button>

                <div className="flex items-center gap-2 ml-auto text-gray-700">
                    <MessageCircle size={16} /> {comments}
                </div>
            </div>

        </div>

        {/* Report Modal */}
        {showReportModal && (
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="announcement"
                targetId={id}
                targetTitle={title}
            />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
            <DeleteAnnouncementModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Видалити обговорення"
                message="Ви впевнені, що хочете видалити це обговорення?"
                itemName={title}
                isLoading={isDeleting}
            />
        )}
        </>
    );
};

export default PostCard;
