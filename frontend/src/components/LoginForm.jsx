import { useState, useEffect } from "react";
import { login, getLocalRememberedLogin, sendVerificationCode, loginWithCode } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const LoginForm = ({ switchToReset, onSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const [showCodeForm, setShowCodeForm] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
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
            const { token, user } = await loginWithCode(email, verificationCode);
            loginSuccess({ token, user });
            sessionStorage.setItem('justLoggedIn', 'true');
            onSuccess?.();
            navigate("/forum");
        } catch (error) {
            setError(error.response?.data?.error || 'Невірний код');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { token, user, requiresCodeVerification } = await login(email, password, rememberMe);
            
            if (requiresCodeVerification) {
                setShowCodeForm(true);
                await handleSendCode();
                return;
            }
            
            loginSuccess({ token, user });
            sessionStorage.setItem('justLoggedIn', 'true');
            onSuccess?.();
            navigate("/forum");
        } catch (error) {
            if (error.response?.data?.requiresCodeVerification) {
                setShowCodeForm(true);
                await handleSendCode();
            } else {
                setError(error.response?.data?.error || "Невірна пошта або пароль");
            }
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
                        <label className="block text-sm mb-2">Код верифікації</label>
                        <input
                            type="text"
                            maxLength="6"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 text-center text-2xl tracking-widest"
                            placeholder="000000"
                            autoFocus
                        />
                    </div>
                    
                    {!codeSent && (
                        <button
                            type="button"
                            onClick={handleSendCode}
                            className="w-full py-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                            Надіслати код повторно
                        </button>
                    )}
                    
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCodeForm(false);
                                setVerificationCode('');
                                setCodeSent(false);
                                setError(null);
                            }}
                            className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                            Назад
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg"
                        >
                            Підтвердити
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-10 w-full text-white">
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
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none text-gray-800"
                    placeholder="Your Password"
                />
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

            <button type="submit" className="w-full bg-blue-700 p-2 rounded-lg mt-8 text-white hover:bg-blue-800 transition cursor-pointer">
                Авторизуватися
            </button>
        </form>
    );
};

export default LoginForm;
