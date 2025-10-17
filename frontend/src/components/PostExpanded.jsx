import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { http } from '../api/httpClient';
import { toggleReaction, getAnnouncementCounts } from '../api/reactions';

const PostExpanded = ({ postId }) => {
    const [post, setPost] = useState(null);
    const [counts, setCounts] = useState({ likes: 0, dislikes: 0, score: 0 });
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                const { data } = await http.get(`/announcements/${postId}`);
                if (!alive) return;
                setPost(data);
            } catch {
                if (!alive) return;
                setError('Не вдалося завантажити оголошення');
            }
        };
        if (postId) load();
        return () => { alive = false; };
    }, [postId]);

    useEffect(() => {
        let alive = true;
        const loadCounts = async () => {
            try {
                const data = await getAnnouncementCounts(postId);
                if (!alive) return;
                setCounts(data);
            } catch {}
        };
        if (postId) loadCounts();
        return () => { alive = false; };
    }, [postId]);

    const onVote = async (val) => {
        if (pending) return;
        setPending(true);
        try {
            const data = await toggleReaction('announcement', postId, val);
            setCounts(data);
        } finally {
            setPending(false);
        }
    };

    if (error) return <p className="text-red-500">{error}</p>;
    if (!post) return <p className="text-white/80">Завантаження...</p>;

    return (
        <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm mb-1">
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
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="like"
                >
                    <ThumbsUp size={16} />
                    {counts.likes}
                </button>

                <button
                    disabled={pending}
                    onClick={() => onVote(-1)}
                    className={`flex items-center gap-2 border border-black rounded px-3 py-2 transition hover:bg-black hover:text-white ${
                        pending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label="dislike"
                >
                    <ThumbsDown size={16} />
                    {counts.dislikes}
                </button>

                <div className="flex items-center gap-2 ml-auto text-gray-700">
                    <MessageCircle size={16} /> коментарі
                </div>
            </div>
        </div>
    );
};

export default PostExpanded;
