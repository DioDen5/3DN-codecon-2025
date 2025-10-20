import { useState } from 'react';
import { useAuthState } from '../api/useAuthState';
import StarRatingInput from './StarRatingInput';

export default function ReviewInput({ onSubmit, userRating, onRatingChange, isVoting }) {
    const { isAuthed } = useAuthState();
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    
    const handleRatingChange = (rating) => {
        onRatingChange(rating);
    };

    async function handleSend(e) {
        e.preventDefault();
        
        if (!isAuthed) {
            setErr('Потрібно увійти в систему для залишення відгуку');
            return;
        }

        if (userRating < 1 || userRating > 5) {
            setErr('Спочатку поставте оцінку від 1 до 5 зірок');
            return;
        }
        
        setErr('');
        setBusy(true);
        try {
            await onSubmit(value.trim(), userRating);
            setValue('');
        } catch (e) {
            console.error('Review error:', e);
            if (e?.response?.status === 401) {
                setErr('Сесія закінчилася. Будь ласка, увійдіть знову.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setErr(e?.response?.data?.error || e.message || 'Помилка');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-white text-black rounded-2xl p-6 shadow-2xl mb-6">
            <h3 className="text-lg font-semibold mb-4">Залишити відгук</h3>
            
            {/* Секція зіркової оцінки */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4 text-center">Обов'язково поставте оцінку:</p>
                <StarRatingInput 
                    rating={userRating} 
                    onRatingChange={handleRatingChange}
                    disabled={isVoting}
                />
            </div>

            {/* Форма відгуку */}
            <form onSubmit={handleSend} className="space-y-3">
                {err && <div className="text-sm text-red-600">{err}</div>}
                <textarea
                    className="w-full border rounded-lg p-3 resize-none"
                    rows={3}
                    placeholder="Напишіть відгук... (необов'язково)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        {userRating < 1 || userRating > 5 ? 'Спочатку поставте оцінку' : 'Оцінка поставлена ✓'}
                    </p>
                    <button 
                        disabled={busy || userRating < 1 || userRating > 5} 
                        className="bg-blue-600 text-white rounded-lg px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                    >
                        {busy ? 'Відправляємо...' : 'Надіслати відгук'}
                    </button>
                </div>
            </form>
        </div>
    );
}