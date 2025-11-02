import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setTeacherPassword } from '../api/teachers';
import { useNotification } from '../contexts/NotificationContext';
import { getRedirectAfterLogin } from '../utils/getRedirectAfterLogin';
import { useAuthState } from '../api/useAuthState';

const SetTeacherPasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const { user } = useAuthState();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { showSuccess: showSuccessNotification, showError: showErrorNotification } = useNotification();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Валідація
        if (!password) {
            setErrors({ password: 'Пароль обов\'язковий' });
            return;
        }
        if (password.length < 8) {
            setErrors({ password: 'Пароль має містити мінімум 8 символів' });
            return;
        }
        if (!confirmPassword) {
            setErrors({ confirmPassword: 'Підтвердження пароля обов\'язкове' });
            return;
        }
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: 'Паролі не співпадають' });
            return;
        }

        setLoading(true);
        try {
            await setTeacherPassword(password);
            showSuccessNotification('Пароль успішно встановлено! Тепер ви можете входити як за кодом, так і за паролем.');
            setPassword('');
            setConfirmPassword('');
            
            // Перекидаємо викладача на його профіль після встановлення пароля
            if (user?.role === 'teacher') {
                const redirectPath = await getRedirectAfterLogin(user);
                onSuccess?.();
                onClose();
                navigate(redirectPath);
            } else {
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            showErrorNotification(error.response?.data?.error || 'Помилка встановлення пароля. Спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={(e) => {
                // Запобігаємо закриттю при кліку на backdrop - це обов'язковий крок
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/40 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/20 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Встановлення пароля</h2>
                            <p className="text-sm text-white/70 mt-1">Обов'язковий крок: встановіть пароль для входу в систему</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-white">Пароль *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none border border-white/20 focus:border-blue-400 ${
                                    errors.password ? 'border-red-400' : ''
                                }`}
                                placeholder="Мінімум 8 символів"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-300 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-2 text-white">Підтвердження пароля *</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none border border-white/20 focus:border-blue-400 ${
                                    errors.confirmPassword ? 'border-red-400' : ''
                                }`}
                                placeholder="Повторіть пароль"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                        >
                            {loading ? 'Встановлення...' : 'Встановити пароль'}
                        </button>
                    </div>

                    <p className="text-xs text-white/60 text-center mt-4">
                        ⚠️ Це обов'язковий крок. Пароль потрібен для входу в систему.
                    </p>
                </form>
            </motion.div>
        </div>,
        document.body
    );
};

export default SetTeacherPasswordModal;

