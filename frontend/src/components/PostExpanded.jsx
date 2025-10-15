import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { articleDetail, voteArticle } from '../api/article_comment';

const PostExpanded = ({ postId }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!postId) {
            setError('Post ID не надано');
            setLoading(false);
            return;
        }
        const fetchPost = async () => {
            try {
                const data = await articleDetail(postId); // ← з адаптера
                setPost(data);
            } catch (e) {
                setError(e?.response?.data?.error || 'Не вдалося завантажити пост');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleVote = async (type) => {
        if (!post) return;
        const prev = post;
        const optimistic = { ...post };
        if (type === 'like') {
            optimistic.rating_positive += 1;
            if (post.voted === 'dislike') optimistic.rating_negative -= 1;
            optimistic.voted = 'like';
        } else {
            optimistic.rating_negative += 1;
            if (post.voted === 'like') optimistic.rating_positive -= 1;
            optimistic.voted = 'dislike';
        }
        setPost(optimistic);
        try { await voteArticle(post.id, type); } catch { setPost(prev); }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!post) return <p className="text-red-500">Пост не знайдений.</p>;

    // ↓ твій оригінальний UI (без змін)
    return (
        <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm mb-1">
        <span className="font-semibold">
          @{post.user?.first_name} {post.user?.last_name || 'Невідомий'}
        </span>
                <span className="text-gray-500">{new Date(post.created_at).toLocaleDateString() || 'Невідомо'}</span>
            </div>

            {post.title && (
                <h2 className="font-bold text-lg mb-2 leading-snug">{post.title}</h2>
            )}

            {post.content && (
                <p className="text-sm text-gray-800 whitespace-pre-line mb-4">
                    {post.content}
                </p>
            )}

            {post?.image_url && (
                <img
                    src={post.image_url}
                    alt="Article Image"
                    className="w-full h-auto rounded-lg mb-4"
                />
            )}

            <div className="flex items-center gap-3 text-sm">
                <button onClick={() => handleVote('like')} className="flex items-center gap-1">
                    <ThumbsUp size={16} /> {post.rating_positive}
                </button>
                <button onClick={() => handleVote('dislike')} className="flex items-center gap-1">
                    <ThumbsDown size={16} /> {post.rating_negative}
                </button>
                <div className="flex items-center gap-1 ml-auto">
                    <MessageCircle size={16} /> {post.comment_count}
                </div>
            </div>

            <div className="flex items-center gap-3 text-sm mb-2 mt-2">
                <button className="ml-auto text-xs border rounded px-2 py-0.5 hover:bg-black hover:text-white transition cursor-pointer">
                    report
                </button>
            </div>
        </div>
    );
};

export default PostExpanded;
