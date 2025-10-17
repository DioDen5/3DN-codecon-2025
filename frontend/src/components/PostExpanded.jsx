import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

const PostExpanded = ({ post, onReaction }) => {
    const [pending, setPending] = useState(false);

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

    if (!post) return <p className="text-white/80">Завантаження...</p>;

    return (
        <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm mb-1">
                <span className="font-semibold">@{getAuthorName(post)}</span>
                <span className="text-gray-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                </span>
            </div>

            {post.title && <h2 className="font-bold text-lg mb-2 leading-snug">{post.title}</h2>}
            {post.body && <p className="text-sm text-gray-800 whitespace-pre-line mb-4">{post.body}</p>}

            <div className="flex items-center gap-4 text-sm">
                <button
                    disabled={pending}
                    onClick={() => onVote(1)}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        (post.counts?.userReaction === 1 || post.userReaction === 1) ? 'bg-black text-white' : ''
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
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        (post.counts?.userReaction === -1 || post.userReaction === -1) ? 'bg-black text-white' : ''
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
    );
};

export default PostExpanded;
