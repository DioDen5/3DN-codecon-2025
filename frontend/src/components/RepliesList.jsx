import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { voteComment } from '../api/article_comment';   // ← замість прямого axios

const RepliesList = ({ replies }) => {
    const [error, setError] = useState(null);

    const handleVote = async (commentId, action /* 'upvote' | 'downvote' */) => {
        try {
            await voteComment(commentId, action);
        } catch (err) {
            setError(err?.response?.data?.error || 'Щось пішло не так');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() || 'Невідомо';
    };

    // ⬇️ нижче — твоя оригінальнарозмітка без змін
    return (
        <div className="pt-8">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V8A2 2 0 0019 6H5a2 2 0 00-2 2v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 9h10M7 12h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h2 className="text-xl font-semibold">Відповіді</h2>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="space-y-4">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <div key={reply.id} className="bg-white text-black rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="font-semibold">@{reply.user?.first_name || 'Невідомий'} {reply.user?.last_name || ''}</span>
                                <span className="text-gray-500">{formatDate(reply.created_at) || 'Невідомо'}</span>
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-line mb-2">{reply.message}</p>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                    <ThumbsUp size={16} onClick={() => handleVote(reply.id, 'upvote')} /> {reply.rating_positive || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsDown size={16} onClick={() => handleVote(reply.id, 'downvote')} /> {reply.rating_negative || 0}
                                </div>

                                <button className="ml-auto text-xs border rounded px-2 py-0.5 hover:bg-black hover:text-white transition cursor-pointer">
                                    report
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Немає відповідей на цей коментар.</p>
                )}
            </div>
        </div>
    );
}

export default RepliesList;
