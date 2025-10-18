import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toggleTeacherComment } from '../api/teacher-comments';
import { useAuthState } from '../api/useAuthState';

const TeacherRepliesList = ({ replies, onRepliesUpdate }) => {
    const { isAuthed } = useAuthState();
    const [error, setError] = useState(null);
    const [pendingVotes, setPendingVotes] = useState(new Set());

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

            <div className="space-y-4">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <div key={reply._id || reply.id} className="bg-white text-black rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="font-semibold">@{getUserName(reply)}</span>
                                <span className="text-gray-500">{formatDate(reply.createdAt || reply.created_at)}</span>
                                {reply.rating && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-500 text-sm">⭐</span>
                                        <span className="text-xs text-gray-600 font-medium">
                                            {reply.rating}/5
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                                {reply.body || reply.message || (reply.rating ? 'Оцінка без коментаря' : '')}
                            </p>
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

                                <button className="ml-auto text-xs border rounded px-2 py-0.5 hover:bg-black hover:text-white transition cursor-pointer">
                                    report
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Немає відгуків для цього викладача.</p>
                )}
            </div>
        </div>
    );
};

export default TeacherRepliesList;
