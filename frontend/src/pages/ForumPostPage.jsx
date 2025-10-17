import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostExpanded from '../components/PostExpanded';
import CommentInput from '../components/CommentInput';
import RepliesList from '../components/RepliesList';
import { getById } from '../api/announcements';
import { list as commentsList, create as createComment } from '../api/comments';
import { toggleAnnouncement, countsComment, countsAnnouncement } from '../api/reactions';

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
                
                try {
                    const postCounts = await countsAnnouncement(id);
                    setPost({ ...p, counts: postCounts, userReaction: postCounts.userReaction || 0 });
                } catch {
                    setPost(p);
                }
                
                const repliesWithCounts = await Promise.all(
                    r.map(async (comment) => {
                        try {
                            const counts = await countsComment(comment._id);
                            return { 
                                ...comment, 
                                counts,
                                userReaction: counts.userReaction || 0
                            };
                        } catch {
                            return { 
                                ...comment, 
                                counts: { likes: 0, dislikes: 0, score: 0 },
                                userReaction: 0
                            };
                        }
                    })
                );
                
                setReplies(repliesWithCounts);
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
        console.log('Created comment:', doc);
            
            const counts = await countsComment(doc._id).catch(() => ({ likes: 0, dislikes: 0, score: 0 }));
            const commentWithCounts = { 
                ...doc, 
                counts,
                userReaction: counts.userReaction || 0
            };
            setReplies(prev => [commentWithCounts, ...prev]);
            
            setPost(prev => ({
                ...prev,
                commentsCount: (prev.commentsCount || 0) + 1
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleReaction = async (type) => {
        if (!post) return;
        
        const value = type === 'like' ? 1 : -1;
        
        const currentCounts = post.counts || { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
        const currentReaction = currentCounts.userReaction || 0;
        let newCounts = { ...currentCounts };

        if (type === 'like') {
            if (currentReaction === 1) {
                newCounts.likes = Math.max(0, newCounts.likes - 1);
                newCounts.score -= 1;
                newCounts.userReaction = 0;
            } else {
                if (currentReaction === -1) {
                    newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);
                    newCounts.score += 1; // знімаємо попередній -1
                }
                newCounts.likes += 1;
                newCounts.score += 1;
                newCounts.userReaction = 1;
            }
        } else {
            if (currentReaction === -1) {
                newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);
                newCounts.score += 1;
                newCounts.userReaction = 0;
            } else {
                if (currentReaction === 1) {
                    newCounts.likes = Math.max(0, newCounts.likes - 1);
                    newCounts.score -= 1; // знімаємо попередній +1
                }
                newCounts.dislikes += 1;
                newCounts.score -= 1;
                newCounts.userReaction = -1;
            }
        }
        
        setPost(prev => ({
            ...prev,
            counts: newCounts
        }));
        
        try {
            const result = await toggleAnnouncement(id, value);
            setPost(prev => ({
                ...prev,
                counts: result
            }));
        } catch (error) {
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

                <RepliesList 
                    replies={replies} 
                    onRepliesUpdate={setReplies}
                />
            </div>
        </div>
    );
};

export default ForumPostPage;
