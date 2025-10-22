import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Trash2, MoreVertical, Flag } from 'lucide-react';
import { toggleTeacherComment, deleteTeacherComment, updateTeacherComment } from '../api/teacher-comments';
import StarRatingInput from './StarRatingInput';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useAuthState } from '../api/useAuthState';
import { useNotification } from '../contexts/NotificationContext';

const TeacherRepliesList = ({ replies, onRepliesUpdate }) => {
    const { isAuthed, user } = useAuthState();
    const { showSuccess } = useNotification();
    const [error, setError] = useState(null);
    const [pendingVotes, setPendingVotes] = useState(new Set());
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null, commentText: '' });
    const [deleting, setDeleting] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    const handleVote = async (commentId, type) => {
        if (pendingVotes.has(commentId)) return;
        
        if (!isAuthed) {
            setError('Потрібно увійти в систему для голосування');
            return;
        }
        
        setPendingVotes(prev => new Set(prev).add(commentId));
        setError(null);
        
        try {
            const value = type === 'like' ? 1 : -1;
            const result = await toggleTeacherComment(commentId, value);
            
            if (onRepliesUpdate) {
                onRepliesUpdate(prevReplies => 
                    prevReplies.map(reply => 
                        reply._id === commentId 
                            ? { 
                                ...reply, 
                                counts: result.counts,
                                userReaction: result.counts.userReaction
                            }
                            : reply
                    )
                );
            }
        } catch (err) {
            console.error('Vote error:', err);
            if (err?.response?.status === 401) {
                setError('Сесія закінчилася. Будь ласка, увійдіть знову.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(err?.response?.data?.error || 'Щось пішло не так');
            }
        } finally {
            setPendingVotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const handleDeleteClick = (commentId, commentText) => {
        setDeleteModal({
            isOpen: true,
            commentId,
            commentText: commentText || 'цей відгук'
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.commentId) return;

        setDeleting(true);
        setDeletingCommentId(deleteModal.commentId);
        setError(null);

        try {
            await deleteTeacherComment(deleteModal.commentId);

            setTimeout(() => {
                const deletingElement = document.querySelector(`[data-comment-id="${deleteModal.commentId}"]`);
                if (deletingElement) {
                    deletingElement.classList.add('fade-out');
                }
                
                setTimeout(() => {
                    if (onRepliesUpdate) {
                        onRepliesUpdate(prevReplies =>
                            prevReplies.filter(reply => reply._id !== deleteModal.commentId)
                        );
                    }
                    setDeletingCommentId(null);
                    showSuccess('Відгук успішно видалено');
                }, 400);
            }, 800);

            setDeleteModal({ isOpen: false, commentId: null, commentText: '' });
        } catch (err) {
            console.error('Error deleting teacher comment:', err);
            setError('Помилка при видаленні коментаря');
            setDeletingCommentId(null);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, commentId: null, commentText: '' });
    };

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

    const formatFullDateTime = (dateString) => {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'Невідомо';
        return d.toLocaleString('uk-UA');
    };

    const startEdit = (reply) => {
        setEditingId(reply._id);
        setEditText(reply.body || '');
        setEditRating(reply.rating || null);
    };

    const cancelEdit = () => {
        setIsClosing(true);
        setTimeout(() => {
            setEditingId(null);
            setEditText('');
            setEditRating(null);
            setIsClosing(false);
        }, 400);
    };

    const saveEdit = async (reply) => {
        if (!isAuthed) {
            setError('Потрібно увійти в систему для редагування відгуку');
            return;
        }
        if (editRating !== null && (editRating < 1 || editRating > 5)) {
            setError('Оцінка має бути від 1 до 5');
            return;
        }
        const payloadBody = editText;
        const payloadRating = editRating === null ? undefined : editRating;
        const nothingChanged = (payloadBody === (reply.body || '')) && (payloadRating === undefined || payloadRating === reply.rating);
        if (nothingChanged) {
            cancelEdit();
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const updated = await updateTeacherComment(reply._id, payloadBody, payloadRating);
            if (onRepliesUpdate) {
                onRepliesUpdate(prev => prev.map(r => r._id === reply._id ? { ...r, ...updated } : r));
            }
            cancelEdit();
        } catch (err) {
            console.error('Update error:', err);
            setError(err?.response?.data?.error || 'Помилка при оновленні відгуку');
        } finally {
            setSaving(false);
        }
    };

    const getUserName = (comment) => {
        if (comment?.authorId) {
            if (comment.authorId.displayName) {
                return comment.authorId.displayName;
            }
            if (comment.authorId.email) {
                return comment.authorId.email.split('@')[0];
            }
        }
        
        if (comment?.user?.email) {
            return comment.user.email.split('@')[0];
        }
        if (comment?.user?.first_name) {
            return comment.user.first_name;
        }

        return 'Невідомий';
    };

    const isOwnComment = (comment) => {
        if (!user) return false;
        const userId = user._id || user.id;
        
        if (comment?.authorId) {
            if (typeof comment.authorId === 'string') {
                return comment.authorId === userId;
            }
            if (comment.authorId._id) {
                return comment.authorId._id === userId;
            }
        }
        
        return false;
    };

    const handleReport = (commentId) => {
        if (!isAuthed) {
            setError('Потрібно увійти в систему для скарги');
            return;
        }

        if (window.confirm('Ви впевнені, що хочете поскаржитись на цей відгук?')) {
            // Тут можна додати логіку відправки скарги
            alert('Скарга відправлена. Дякуємо за звернення!');
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId && !event.target.closest('.relative')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    return (
        <div className="pt-8">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V8A2 2 0 0019 6H5a2 2 0 00-2 2v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 9h10M7 12h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h2 className="text-xl font-semibold">Відгуки</h2>
            </div>

            {error && <p className="text-red-500">{error}</p>}

                    <div className="space-y-4 comments-container">
                        {replies.length > 0 ? (
                            replies.map(reply => (
                                <div 
                                    key={reply._id || reply.id} 
                                    data-comment-id={reply._id}
                                    className={`bg-white text-black rounded-xl p-4 shadow-sm comment-item ${
                                        deletingCommentId === reply._id ? 'comment-deleting' : ''
                                    }`}
                                >
                            <div className="flex items-center justify-between text-sm mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{getUserName(reply)}</span>
                                    <span className="text-gray-500">{formatDate(reply.createdAt || reply.created_at)}</span>
                                    {reply.rating && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <defs>
                                                    <linearGradient id={`starGradient-${reply._id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#60a5fa" />
                                                        <stop offset="50%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#2563eb" />
                                                    </linearGradient>
                                                    <filter id={`glow-${reply._id}`}>
                                                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                                                        <feMerge> 
                                                            <feMergeNode in="coloredBlur"/>
                                                            <feMergeNode in="SourceGraphic"/>
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <path
                                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    fill={`url(#starGradient-${reply._id})`}
                                                    stroke="#3b82f6"
                                                    strokeWidth="0.5"
                                                    className="drop-shadow-sm"
                                                    filter={`url(#glow-${reply._id})`}
                                                />
                                            </svg>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {reply.rating}/5
                                            </span>
                                            {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                                <span className="text-xs text-gray-500 font-medium" title={`Оновлено: ${formatFullDateTime(reply.updatedAt)}`}>
                                                    • редаговано
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {(isOwnComment(reply) || !isOwnComment(reply)) && (
                                    <div className="relative">
                                        <button
                                            onClick={(event) => {
                                                setOpenMenuId(openMenuId === reply._id ? null : reply._id);
                                                const button = event.target.closest('button');
                                                button.classList.add('button-pulse');
                                                setTimeout(() => button.classList.remove('button-pulse'), 600);
                                            }}
                                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform ${
                                                openMenuId === reply._id 
                                                    ? 'text-blue-600 bg-blue-50 scale-110 shadow-lg' 
                                                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                                            }`}
                                            title="Опції"
                                        >
                                            <MoreVertical 
                                                size={16} 
                                                className={`transition-all duration-300 ${
                                                    openMenuId === reply._id ? 'rotate-90 icon-bounce' : 'rotate-0'
                                                }`}
                                            />
                                        </button>
                                        
                                        {openMenuId === reply._id && (
                                            <div className="absolute right-0 top-8 z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl w-[140px] menu-enter backdrop-blur-sm overflow-hidden">
                                                {isOwnComment(reply) ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                startEdit(reply);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-blue-600 bg-transparent hover:text-blue-800 transition-colors duration-200"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Редагувати
                                                        </button>
                                                        
                                                        <div className="border-b border-gray-200"></div>
                                                        
                                                        <button
                                                            onClick={() => {
                                                                handleDeleteClick(reply._id, reply.body?.substring(0, 50) + '...');
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-red-600 bg-transparent hover:text-red-800 transition-colors duration-200"
                                                        >
                                                            <Trash2 size={12} />
                                                            Видалити
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            handleReport(reply._id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex items-center justify-center gap-1 w-full px-4 py-2 text-xs text-orange-600 bg-transparent hover:text-orange-800 transition-colors duration-200"
                                                    >
                                                        <Flag size={12} />
                                                        Поскаржитись
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {editingId === reply._id ? (
                                <div className={`mb-2 bg-gray-50 rounded-lg p-3 ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`} style={{ overflow: 'hidden' }}>
                                    <div className="mb-3 animate-fadeIn">
                                        <StarRatingInput
                                            rating={editRating ?? reply.rating ?? 0}
                                            onRatingChange={(r) => setEditRating(r)}
                                        />
                                    </div>
                                    <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                                        <textarea
                                            className="w-full border rounded-lg p-3 resize-none text-sm"
                                            rows={3}
                                            placeholder="Оновіть ваш відгук..."
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end mt-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:scale-105 active:scale-95 transition-all duration-300 ease-out shadow-sm hover:shadow-md"
                                        >
                                            Скасувати
                                        </button>
                                        <button
                                            onClick={() => saveEdit(reply)}
                                            disabled={saving}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-out shadow-sm hover:shadow-md"
                                        >
                                            {saving ? 'Зберігаємо...' : 'Зберегти'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                                    {reply.body || reply.message || ''}
                                </p>
                            )}
                            {editingId !== reply._id && (
                                <div className="flex items-center gap-4 text-sm">
                                    <button
                                        disabled={pendingVotes.has(reply._id)}
                                        onClick={() => handleVote(reply._id, 'like')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                                            reply.userReaction === 1 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                                        } ${
                                            pendingVotes.has(reply._id) ? 'opacity-60 cursor-not-allowed' : ''
                                        }`}
                                        aria-label="like"
                                    >
                                        <ThumbsUp size={12} />
                                        {reply.counts?.likes || 0}
                                    </button>

                                    <button
                                        disabled={pendingVotes.has(reply._id)}
                                        onClick={() => handleVote(reply._id, 'dislike')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                                            reply.userReaction === -1 
                                                ? 'bg-red-100 text-red-700' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                                        } ${
                                            pendingVotes.has(reply._id) ? 'opacity-60 cursor-not-allowed' : ''
                                        }`}
                                        aria-label="dislike"
                                    >
                                        <ThumbsDown size={12} />
                                        {reply.counts?.dislikes || 0}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Немає відгуків для цього викладача.</p>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Видалити відгук"
                message="Ви впевнені, що хочете видалити цей відгук?"
                itemName={deleteModal.commentText}
                isLoading={deleting}
            />

        </div>
    );
};

export default TeacherRepliesList;
