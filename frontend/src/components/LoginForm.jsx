import { useState, useEffect, useRef } from "react";
import { login, getLocalRememberedLogin, sendVerificationCode, loginWithCode } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { getRedirectAfterLogin } from "../utils/getRedirectAfterLogin";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({ switchToReset, onSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const [showCodeForm, setShowCodeForm] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const codeInputRefs = useRef([]);
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        const rememberedData = getLocalRememberedLogin();
        if (rememberedData.rememberMe && rememberedData.email) {
            setEmail(rememberedData.email);
            setRememberMe(true);
        }
    }, []);

    const handleSendCode = async () => {
        try {
            await sendVerificationCode(email, 'login');
            setCodeSent(true);
            showSuccess('Код надіслано на пошту');
        } catch (error) {
            showError(error.response?.data?.error || 'Помилка відправки коду');
        }
    };

    const handleLoginWithCode = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Код повинен містити 6 цифр');
            return;
        }
        
        try {
            const { token, user, requiresPasswordSetup, teacherProfile } = await loginWithCode(email, verificationCode);
            
            // Встановлюємо флаг ПЕРЕД викликом loginSuccess, щоб подія auth-changed побачила його
            if (requiresPasswordSetup) {
                sessionStorage.setItem('teacherRequiresPasswordSetup', 'true');
            }
            
            loginSuccess({ token, user });
            sessionStorage.setItem('justLoggedIn', 'true');
            
            // Визначаємо правильний редирект для викладачів
            const redirectPath = await getRedirectAfterLogin(user, teacherProfile);
            
            onSuccess?.();
            navigate(redirectPath);
        } catch (error) {
            setError(error.response?.data?.error || 'Невірний код');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Блокуємо будь-які подальші події
        if (e.cancelable) {
            e.cancelBubble = true;
        }
        
        setError(null);
        
        if (!email || !password) {
            setError('Будь ласка, заповніть всі поля');
            return false;
        }
        
        try {
            const { token, user, requiresCodeVerification, teacherProfile } = await login(email, password, rememberMe);
            
            if (requiresCodeVerification) {
                setShowCodeForm(true);
                await handleSendCode();
                return false;
            }
            
            sessionStorage.removeItem('teacherRequiresPasswordSetup');
            
            loginSuccess({ token, user });
            sessionStorage.setItem('justLoggedIn', 'true');
            
            const redirectPath = await getRedirectAfterLogin(user, teacherProfile);
            
            setTimeout(() => {
                onSuccess?.();
                navigate(redirectPath);
            }, 3000);
            
            return false;
        } catch (error) {
            if (error.response?.status === 429) {
                const lockoutMessage = error.response?.data?.message || 
                    `Занадто багато невдалих спроб входу. Спробуйте знову через ${Math.ceil((error.response?.data?.retryAfter || 1200) / 60)} хвилин.`;
                setError(lockoutMessage);
                showError(lockoutMessage);
            } else if (error.response?.data?.requiresCodeVerification) {
                setShowCodeForm(true);
                await handleSendCode();
            } else {
                const errorMessage = error.response?.data?.error || error.response?.data?.message || "Невірна пошта або пароль";
                setError(errorMessage);
                showError(errorMessage);
            }
            
            return false;
        }
    };

    if (showCodeForm) {
        return (
            <div className="space-y-6 p-10 w-full text-white">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Підтвердження входу</h2>
                    <p className="text-sm text-gray-300">
                        Профіль викладача з поштою <strong>{email}</strong> існує в системі.
                        Введіть код, надісланий на вашу пошту.
                    </p>
                </div>
                
                <form onSubmit={handleLoginWithCode} className="space-y-4">
                    <div>
                        <div className="flex gap-3 justify-center items-center">
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                                const digit = verificationCode[index] || '';
                                const hasValue = digit !== '';
                                return (
                                    <input
                                        key={`${index}-${digit}`}
                                        ref={(el) => (codeInputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => {
                                            const newValue = e.target.value.replace(/\D/g, '');
                                            if (newValue.length <= 1) {
                                                // Створюємо масив з 6 елементів
                                                const currentCode = Array(6).fill('').map((_, i) => verificationCode[i] || '');
                                                // Встановлюємо нове значення саме в потрібний індекс
                                                currentCode[index] = newValue;
                                                setVerificationCode(currentCode.join(''));
                                                
                                                // Автоматичний перехід на наступне поле
                                                if (newValue && index < 5) {
                                                    setTimeout(() => {
                                                        codeInputRefs.current[index + 1]?.focus();
                                                    }, 10);
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Видалення поточної цифри при Backspace
                                            if (e.key === 'Backspace' && digit) {
                                                e.preventDefault();
                                                // Створюємо масив з 6 елементів
                                                const currentCode = Array(6).fill('').map((_, i) => verificationCode[i] || '');
                                                // Видаляємо цифру саме з поточного індексу
                                                currentCode[index] = '';
                                                setVerificationCode(currentCode.join(''));
                                                // Залишаємо фокус на тому ж полі
                                                setTimeout(() => {
                                                    codeInputRefs.current[index]?.focus();
                                                }, 10);
                                            }
                                            // Перехід на попереднє поле при Backspace, якщо поточне поле порожнє
                                            if (e.key === 'Backspace' && !digit && index > 0) {
                                                e.preventDefault();
                                                codeInputRefs.current[index - 1]?.focus();
                                            }
                                            // Дозволяємо перехід стрілками
                                            if (e.key === 'ArrowLeft' && index > 0) {
                                                e.preventDefault();
                                                codeInputRefs.current[index - 1]?.focus();
                                            }
                                            if (e.key === 'ArrowRight' && index < 5) {
                                                e.preventDefault();
                                                codeInputRefs.current[index + 1]?.focus();
                                            }
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                            if (pastedText.length > 0) {
                                                const newCode = pastedText.split('').slice(0, 6);
                                                setVerificationCode(newCode.join(''));
                                                const nextIndex = Math.min(index + pastedText.length, 5);
                                                setTimeout(() => {
                                                    codeInputRefs.current[nextIndex]?.focus();
                                                }, 10);
                                            }
                                        }}
                                        className={`w-12 h-16 rounded-md bg-[#D9D9D9]/20 text-gray-800 text-center text-3xl font-bold focus:outline-none transition-all duration-300 border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)] ${
                                            hasValue 
                                                ? 'animate-digit-slide-up' 
                                                : ''
                                        }`}
                                        placeholder="_"
                                        autoFocus={index === 0 && !verificationCode}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                type="button"
                                onClick={handleSendCode}
                                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition underline underline-offset-2"
                            >
                                {codeSent ? 'Надіслати код повторно' : 'Надіслати код'}
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCodeForm(false);
                                setVerificationCode('');
                                setCodeSent(false);
                                setError(null);
                            }}
                            className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg cursor-pointer transition"
                        >
                            Назад
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer transition"
                        >
                            Підтвердити
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <form 
            onSubmit={handleSubmit} 
            className="space-y-6 p-10 w-full text-white"
            onKeyDown={(e) => {
                // Блокуємо Enter на формі, якщо не в полі вводу
                if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }}
        >
            <div>
                <label className="block text-sm text-white-700">Email</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none text-gray-800"
                    placeholder="example@lnu.edu.ua"
                />
            </div>

            <div>
                <label className="block text-sm text-white-700">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full px-4 py-2 pr-12 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none text-gray-800"
                        placeholder="Your Password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox h-4 w-4 rounded-sm bg-transparent border-white checked:bg-white cursor-pointer" 
                    />
                    <span className="text-md cursor-pointer">Запам'ятати мене</span>
                </label>

                <button type="button" onClick={switchToReset} className="font-medium text-md text-indigo-300 hover:underline cursor-pointer">
                    Забули пароль?
                </button>
            </div>

            {error && <p className="text-red-400">{error}</p>}

            <button 
                type="submit" 
                className="w-full bg-blue-700 p-2 rounded-lg mt-8 text-white hover:bg-blue-800 transition cursor-pointer"
            >
                Авторизуватися
            </button>
        </form>
    );
};

export default LoginForm;
