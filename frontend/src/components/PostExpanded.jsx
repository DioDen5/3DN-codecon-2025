import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Trash2, Flag } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { remove as deleteAnnouncement } from '../api/announcements';
import ReportModal from './ReportModal';
import DeleteAnnouncementModal from './DeleteAnnouncementModal';

const PostExpanded = ({ post, onReaction, searchQuery = '', onDelete }) => {
    const [pending, setPending] = useState(false);
    const { isAuthed, user } = useAuthState();
    const [openMenu, setOpenMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Невідомо';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Невідомо';
        
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes < 1 ? 'щойно' : `${diffMinutes}хв`;
            }
            return `${diffHours}г`;
        }
        
        return date.toLocaleDateString('uk-UA');
    };

    const getAuthorName = (post) => {
        if (post?.authorId) {
            if (post.authorId.displayName) {
                return post.authorId.displayName;
            }
            if (post.authorId.email) {
                return post.authorId.email.split('@')[0];
            }
        }
        return 'Невідомий';
    };

    const isOwnPost = (post) => {
        if (!user || !post) return false;
        const userId = user._id || user.id;
        
        if (post?.authorId) {
            if (typeof post.authorId === 'string') {
                return post.authorId === userId;
            }
            if (post.authorId._id) {
                return post.authorId._id === userId;
            }
        }
        
        return false;
    };

    const handleDeleteClick = () => {
        if (!isAuthed) {
            alert('Потрібно увійти в систему для видалення обговорення');
            return;
        }
        setShowDeleteModal(true);
        setOpenMenu(false);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteAnnouncement(post._id);
            if (onDelete) {
                onDelete();
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

    const handleReport = () => {
        setShowReportModal(true);
        setOpenMenu(false);
    };

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

    const onVote = async (val) => {
        if (pending || !onReaction) return;
        setPending(true);
        try {
            const type = val === 1 ? 'like' : 'dislike';
            await onReaction(type);
        } finally {
            setPending(false);
        }
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

    if (!post) return <p className="text-white/80">Завантаження...</p>;

    return (
        <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{getAuthorName(post)}</span>
                    <span className="text-gray-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                </div>
                
                {isOwnPost(post) ? (
                    <div className="relative">
                        <button
                            onClick={(event) => {
                                setOpenMenu(!openMenu);
                                const button = event.target.closest('button');
                                button.classList.add('button-pulse');
                                setTimeout(() => button.classList.remove('button-pulse'), 600);
                            }}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform ${
                                openMenu 
                                    ? 'text-blue-600 bg-blue-50 scale-110 shadow-lg' 
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
                                <button
                                    onClick={handleDeleteClick}
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-red-600 bg-transparent hover:text-red-800 transition-colors duration-200"
                                >
                                    <Trash2 size={12} />
                                    Видалити
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            onClick={(event) => {
                                setOpenMenu(!openMenu);
                                const button = event.target.closest('button');
                                button.classList.add('button-pulse');
                                setTimeout(() => button.classList.remove('button-pulse'), 600);
                            }}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform ${
                                openMenu 
                                    ? 'text-orange-600 bg-orange-50 scale-110 shadow-lg' 
                                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'
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
                                <button
                                    onClick={handleReport}
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-orange-600 bg-transparent hover:text-orange-800 hover:bg-orange-50 transition-colors duration-200"
                                >
                                    <Flag size={12} />
                                    Поскаржитися
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {post.title && <h2 className="font-bold text-lg mb-2 leading-snug">{highlightText(post.title, searchQuery)}</h2>}
            {post.body && <p className="text-sm text-gray-800 whitespace-pre-line mb-4">{post.body}</p>}

            <div className="flex items-center gap-4 text-sm">
                {console.log('PostExpanded - post.counts?.userReaction:', post.counts?.userReaction, 'post.userReaction:', post.userReaction)}
                <button
                    disabled={pending}
                    onClick={() => onVote(1)}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-black hover:text-white ${
                        post.counts?.userReaction === 1 ? 'bg-black text-white' : ''
                    } ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="like"
                >
                    <ThumbsUp size={16} />
                    {post.counts?.likes || 0}
                </button>

                <button
                    disabled={pending}
                    onClick={() => onVote(-1)}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-black hover:text-white ${
                        post.counts?.userReaction === -1 ? 'bg-black text-white' : ''
                    } ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="dislike"
                >
                    <ThumbsDown size={16} />
                    {post.counts?.dislikes || 0}
                </button>

                <div className="flex items-center gap-2 ml-auto text-gray-700">
                    <MessageCircle size={16} /> 
                    {post.commentsCount || 0} коментарів
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div onClick={(e) => e.stopPropagation()}>
                    <ReportModal
                        isOpen={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        targetType="announcement"
                        targetId={post._id}
                        targetTitle={post.title}
                    />
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div onClick={(e) => e.stopPropagation()}>
                    <DeleteAnnouncementModal
                        isOpen={showDeleteModal}
                        onClose={handleDeleteCancel}
                        onConfirm={handleDeleteConfirm}
                        title="Видалити обговорення"
                        message="Ви впевнені, що хочете видалити це обговорення?"
                        itemName={post.title}
                        isLoading={isDeleting}
                    />
                </div>
            )}
        </div>
    );
};

export default PostExpanded;
