import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Trash2, Flag } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { remove as deleteAnnouncement } from '../api/announcements';
import ReportModal from './ReportModal';
import DeleteAnnouncementModal from './DeleteAnnouncementModal';
import { useNotification } from '../contexts/NotificationContext';

const PostExpanded = ({ post, onReaction, searchQuery = '', onDelete }) => {
    const navigate = useNavigate();
    const { showSuccess } = useNotification();
    const [pending, setPending] = useState(false);
    const { isAuthed, user } = useAuthState();
    const [openMenu, setOpenMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Приховуємо body overflow під час перенаправлення
    useEffect(() => {
        if (isRedirecting) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'unset';
            document.body.style.width = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'unset';
            document.body.style.width = 'unset';
        };
    }, [isRedirecting]);

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
            
            setShowDeleteModal(false);
            
            // Плавне переадресування з екранчиком завантаження
            setIsRedirecting(true);
            
            // Переадресування через 2 секунди
            setTimeout(() => {
                navigate('/forum');
                // Показуємо повідомлення після перенаправлення
                setTimeout(() => {
                    showSuccess('Обговорення успішно видалено!');
                }, 300);
            }, 2000);
            
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Помилка при видаленні обговорення');
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
        <>
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
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform cursor-pointer ${
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
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-red-600 bg-transparent hover:text-red-800 transition-colors duration-200 cursor-pointer"
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
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform cursor-pointer ${
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
                                    className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-orange-600 bg-transparent hover:text-orange-800 hover:bg-orange-50 transition-colors duration-200 cursor-pointer"
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
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-black hover:text-white cursor-pointer ${
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
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-black hover:text-white cursor-pointer ${
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

        </div>

        {/* Report Modal */}
        {showReportModal && (
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="announcement"
                targetId={post._id}
                targetTitle={post.title}
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
                itemName={post.title}
                isLoading={isDeleting}
            />
        )}

        {/* Redirecting Screen */}
        {isRedirecting && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center redirecting-backdrop">
                <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-3xl p-10 shadow-2xl max-w-lg w-full mx-4 text-center relative overflow-hidden border border-white/20">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-300/20 to-blue-400/20 rounded-full translate-y-16 -translate-x-16 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-blue-300/10 to-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin" style={{animationDuration: '8s'}}></div>
                    
                    <div className="relative z-10">
                        {/* Main spinner with gradient */}
                        <div className="mb-8">
                            <div className="w-20 h-20 mx-auto relative">
                                <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-blue-400 border-l-blue-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                                <div className="absolute inset-2 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                                    <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Animated title */}
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-4 animate-pulse">
                            Перенаправлення...
                        </h3>
                        
                        {/* Animated description */}
                        <p className="text-gray-600 text-base mb-6 animate-fade-in">
                            Повертаємося до списку обговорень
                        </p>
                        
                        {/* Animated dots */}
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full animate-progress-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PostExpanded;
