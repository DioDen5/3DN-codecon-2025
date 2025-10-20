import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        passwordConfirm: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setErrors({});

        const newErrors = {};
        
        if (!formData.password) {
            newErrors.password = 'Пароль обов\'язковий';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Пароль має бути мінімум 8 символів';
        }
        
        if (!formData.passwordConfirm) {
            newErrors.passwordConfirm = 'Підтвердження пароля обов\'язкове';
        } else if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = 'Паролі не співпадають';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            await resetPassword(token, formData.password);
            setMessage('Пароль успішно оновлено! Тепер ви можете увійти з новим паролем.');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.response?.data?.error || 'Помилка при оновленні пароля');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return null; // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white text-center mb-6">
                        Встановлення нового пароля
                    </h1>
                    
                    {message && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-400/40 rounded-lg text-green-300 text-sm">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Новий пароль
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none transition-colors ${
                                    errors.password ? 'border-2 border-red-400' : 'border border-white/20'
                                }`}
                                placeholder="Введіть новий пароль"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Підтвердження пароля
                            </label>
                            <input
                                type="password"
                                name="passwordConfirm"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none transition-colors ${
                                    errors.passwordConfirm ? 'border-2 border-red-400' : 'border border-white/20'
                                }`}
                                placeholder="Підтвердіть новий пароль"
                            />
                            {errors.passwordConfirm && (
                                <p className="text-red-400 text-sm mt-1">{errors.passwordConfirm}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                loading
                                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? 'Оновлюємо...' : 'Оновити пароль'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-300 hover:text-blue-200 text-sm underline"
                        >
                            Повернутись до входу
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
