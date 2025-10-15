import React, { useState } from 'react';
import { articleCreate } from '../api/article_comment.js'; // Імпортуємо функцію для створення статті

const CreateDiscussionPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await articleCreate(title, content, image);
            setSuccess('Статтю успішно створено!');
            setError('');
            setTitle('');
            setContent('');
            setImage(null);
        } catch {
            setSuccess('');
            setError('Не вдалося створити статтю. Спробуйте ще раз.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
            <div className="bg-white backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                <h2 className="text-2xl font-semibold text-center mb-6 text-black">Створити обговорення</h2>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                        >
                            Опублікувати
                        </button>
                    </div>
                </form>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}
            </div>
        </div>
    );
};

export default CreateDiscussionPage;
