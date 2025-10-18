import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleCreate } from '../api/article_comment.js';
import { triggerForumRefresh } from '../hooks/useForumRefresh';

const CreateDiscussionPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const result = await articleCreate(title, content, image);
            
            // Тригеримо оновлення форуму
            triggerForumRefresh();
            
            // Показуємо успішне повідомлення
            setSuccess('Обговорення створено успішно!');
            
            // Через 1.5 секунди переходимо до створеного обговорення
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
        if (title.trim() || content.trim() || image) {
            setShowCancelConfirm(true);
        } else {
            navigate('/forum');
        }
    };

    const confirmCancel = () => {
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
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Заголовок"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-xl bg-gray-300/60 placeholder:text-gray-600 text-black"
                    />
                    <textarea
                        placeholder="Тіло"
                        rows="4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 rounded-xl bg-gray-300/60 placeholder:text-gray-600 text-black"
                    ></textarea>

                    <div className="flex justify-between items-center">
                        <label className="text-blue-600 cursor-pointer">
                            + Завантажити фото
                            <input
                                type="file"
                                className="text-gray-400"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`font-medium py-2 px-6 rounded-lg transition ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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

                {/* Модальне вікно підтвердження скасування */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold mb-4">Скасувати створення?</h3>
                            <p className="text-gray-600 mb-6">
                                Ви впевнені, що хочете скасувати створення обговорення? Всі введені дані будуть втрачені.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Продовжити редагування
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateDiscussionPage;
