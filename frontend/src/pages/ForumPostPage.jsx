import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostExpanded from '../components/PostExpanded';
import CommentInput from '../components/CommentInput';
import RepliesList from '../components/RepliesList';
import { getById } from '../api/announcements';
import { list as commentsList, create as createComment } from '../api/comments';
import { toggleAnnouncement } from '../api/reactions';

const ForumPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostAndReplies = async () => {
            try {
                setLoading(true);
                const [p, r] = await Promise.all([
                    getById(id),
                    commentsList(id),
                ]);
                setPost(p);
                setReplies(r);
            } catch (err) {
                setError(err?.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndReplies();
    }, [id]);

    const handleCreate = async (message) => {
        try {
            const doc = await createComment(id, message);
            setReplies(prev => [doc, ...prev]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReaction = async (type) => {
        if (!post) return;
        
        const value = type === 'like' ? 1 : -1;
        
        // Оптимістичне оновлення
        const currentCounts = post.counts || { likes: 0, dislikes: 0, score: 0 };
        let newCounts = { ...currentCounts };
        
        if (type === 'like') {
            newCounts.likes += 1;
            newCounts.score += 1;
        } else {
            newCounts.dislikes += 1;
            newCounts.score -= 1;
        }
        
        setPost(prev => ({
            ...prev,
            counts: newCounts
        }));
        
        try {
            const result = await toggleAnnouncement(id, value);
            // Оновлюємо з реальними даними з сервера
            setPost(prev => ({
                ...prev,
                counts: result
            }));
        } catch (error) {
            // Відкатуємо оптимістичне оновлення при помилці
            setPost(prev => ({
                ...prev,
                counts: currentCounts
            }));
            console.error('Reaction error:', error);
        }
    };

    if (loading) return <div className="text-white p-10">Завантаження...</div>;
    if (error) return <div className="text-white p-10">Помилка: {error}</div>;
    if (!post) return <div className="text-white p-10">Пост не знайдено</div>;

    return (
        <div className="min-h-[calc(100vh-68px)] px-6 py-10 bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm underline text-white hover:text-purple-300 transition cursor-pointer"
                >
                    ← Назад
                </button>

                <PostExpanded 
                    post={post} 
                    onReaction={handleReaction}
                />

                <CommentInput onSubmit={handleCreate} />

                <RepliesList replies={replies} />
            </div>
        </div>
    );
};

export default ForumPostPage;
