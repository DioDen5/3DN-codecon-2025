import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import axios from 'axios';

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
                const response = await axios.get(`http://127.0.0.1:8000/api/article/${postId}/`);
                setPost(response.data);
            } catch {
                setError('Не вдалося завантажити пост');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // Якщо дані відсутні, потрібно додати перевірку
    if (!post) return <p className="text-red-500">Пост не знайдений.</p>;

    return (
        <div className="bg-white text-black rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm mb-1">
                {/* Відображення імені та прізвища користувача */}
                <span className="font-semibold">
                    @{post.user?.first_name} {post.user?.last_name || 'Невідомий'}
                </span>
                <span className="text-gray-500">{new Date(post.created_at).toLocaleDateString() || 'Невідомо'}</span>
            </div>

            {/* Відображення зображення статті */}
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
                    className="w-full h-auto rounded-lg mb-4"  // Збільшений розмір для статті
                />
            )}


            <div className="flex items-center gap-3 text-sm mb-2">
                <button className="ml-auto text-xs border rounded px-2 py-0.5 hover:bg-black hover:text-white transition cursor-pointer">
                    report
                </button>
            </div>
        </div>
    );
};

export default PostExpanded;
