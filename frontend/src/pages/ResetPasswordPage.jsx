import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        passwordConfirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
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
            
            sessionStorage.removeItem('teacherRequiresPasswordSetup');
            
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/40 backdrop-blur-md rounded-4xl shadow-2xl w-full max-w-xl p-1 relative">
                <div className="w-full h-full flex items-center justify-center p-10">
                    <div className="w-full max-w-md text-white flex flex-col items-center space-y-5 text-center">
                        <h2 className="text-3xl font-semibold">Встановлення нового пароля</h2>
                        
                        {message && (
                            <div className="w-full p-3 bg-green-500/20 border border-green-400/40 rounded-lg text-green-300 text-sm">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="w-full p-3 bg-red-500/20 border border-red-400/40 rounded-lg text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pl-4 pr-12 bg-white/20 text-white placeholder-white/60 rounded-xl outline-none text-left ${
                                        errors.password ? 'border-2 border-red-400' : ''
                                    }`}
                                    placeholder="Введіть новий пароль"
                                    style={{ textAlign: 'left' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1 text-left">{errors.password}</p>
                                )}
                            </div>

                            <div className="relative w-full">
                                <input
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pl-4 pr-12 bg-white/20 text-white placeholder-white/60 rounded-xl outline-none text-left ${
                                        errors.passwordConfirm ? 'border-2 border-red-400' : ''
                                    }`}
                                    placeholder="Підтвердіть новий пароль"
                                    style={{ textAlign: 'left' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                                >
                                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {errors.passwordConfirm && (
                                    <p className="text-red-400 text-sm mt-1 text-left">{errors.passwordConfirm}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full p-2 rounded-lg mt-2 text-white transition ${
                                    loading
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                                }`}
                            >
                                {loading ? 'Оновлюємо...' : 'Оновити пароль'}
                            </button>
                        </form>

                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-indigo-300 hover:underline cursor-pointer"
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
