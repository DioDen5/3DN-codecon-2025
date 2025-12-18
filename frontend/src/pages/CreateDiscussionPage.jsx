import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleCreate } from '../api/article_comment.js';
import { triggerForumRefresh } from '../hooks/useForumRefresh';

const CreateDiscussionPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const TITLE_MAX = 50;
    const CONTENT_MAX = 2000;

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {

            if (!title.trim()) {
                setIsSubmitting(false);
                setError('Будь ласка, вкажіть заголовок.');
                return;
            }
            if (!content.trim()) {
                setIsSubmitting(false);
                setError('Будь ласка, додайте опис.');
                return;
            }

            const safeTitle = title.slice(0, TITLE_MAX);
            const safeContent = content.slice(0, CONTENT_MAX);

            const result = await articleCreate(safeTitle, safeContent, null);

            triggerForumRefresh();

            setSuccess('Обговорення створено успішно!');

            setTimeout(() => {
                navigate(`/forum/${result.id}`);
            }, 1500);

        } catch (err) {
            console.error('Create discussion error:', err);

            if (err?.response?.status === 403) {
                setError('У вас немає прав для створення обговорень. Зверніться до адміністратора.');
            } else if (err?.response?.status === 401) {
                setError('Потрібно увійти в систему для створення обговорень.');
            } else {
                setError('Не вдалося створити обговорення. Спробуйте ще раз.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/forum');
    };

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
            <div className="bg-white backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleCancel}
                        className="text-sm underline text-gray-600 hover:text-gray-800 transition cursor-pointer"
                    >
                        ← Назад
                    </button>
                    <h2 className="text-2xl font-semibold text-black">Створити обговорення</h2>
                    <div className="w-16"></div> 
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Заголовок"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={TITLE_MAX}
                        className="w-full p-3 rounded-xl bg-gray-300/60 placeholder:text-gray-600 text-black border border-gray-300 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition"
                    />
                    <div className="text-right text-xs text-gray-500 -mt-2">{title.length}/{TITLE_MAX}</div>
                    <textarea
                        placeholder="Опис"
                        rows="6"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={CONTENT_MAX}
                        className="w-full p-3 rounded-xl bg-gray-300/60 placeholder:text-gray-600 text-black resize-none overflow-y-auto max-h-80 border border-gray-300 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition"
                    ></textarea>
                    <div className="text-right text-xs text-gray-500 -mt-2">{content.length}/{CONTENT_MAX}</div>

                    <div className="flex justify-end items-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`font-medium py-2 px-6 rounded-lg transition ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? 'Створюємо...' : 'Опублікувати'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center mt-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center mt-4 animate-pulse">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                
            </div>
        </div>
    );
};

export default CreateDiscussionPage;
