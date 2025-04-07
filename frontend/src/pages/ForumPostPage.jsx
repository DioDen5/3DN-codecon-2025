import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PostExpanded from '../components/PostExpanded';
import CommentInput from '../components/CommentInput';
import RepliesList from '../components/RepliesList';

const ForumPostPage = () => {
    const { id } = useParams();  // Отримуємо id з URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);  // Стан для поста
    const [replies, setReplies] = useState([]);  // Стан для відповідей
    const [loading, setLoading] = useState(true);  // Стан для завантаження
    const [error, setError] = useState(null);  // Стан для помилок

    useEffect(() => {
        const fetchPostAndReplies = async () => {
            try {
                setLoading(true);
                // Завантаження поста за id
                const postResponse = await axios.get(`http://127.0.0.1:8000/api/article/${id}/`);
                setPost(postResponse.data);

                // Завантаження відповідей на пост
                const repliesResponse = await axios.get(`http://127.0.0.1:8000/api/article/${id}/comments/`);
                setReplies(repliesResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndReplies();
    }, [id]);

    if (loading) return <div className="text-white p-10">Завантаження...</div>;
    if (error) return <div className="text-white p-10">Помилка: {error}</div>;
    if (!post) return <div className="text-white p-10">Пост не знайдено</div>;

    return (
        <div className="min-h-[calc(100vh-68px)] px-6 py-10 bg-gradient-to-b from-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}  // Повертаємось назад
                    className="text-sm underline text-white hover:text-purple-300 transition cursor-pointer"
                >
                    ← Назад
                </button>

                <PostExpanded postId={post.id} />  {/* Відображаємо пост, передаючи ID */}

                <CommentInput />  {/* Ввід для коментарів */}

                <RepliesList replies={replies} />  {/* Відображаємо відповіді */}
            </div>
        </div>
    );
};

export default ForumPostPage;
