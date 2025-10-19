import { useState } from "react";
import { register } from "../api/auth"; // Імпорт функції реєстрації
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const SignupForm = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false); // Track if user tried to submit
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    // Check if all required fields are filled
    const isFormValid = formData.firstName.trim() && 
                       formData.lastName.trim() && 
                       formData.email.trim() && 
                       formData.password && 
                       formData.passwordConfirm;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        
        // Очищаємо помилку для цього поля
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true); // Mark that user attempted to submit
        setErrors({});
        setSuccess(false);
        
        // Валідація полів
        const newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ім\'я обов\'язкове';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Прізвище обов\'язкове';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email обов\'язковий';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Невірний формат email';
        }
        
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
            return;
        }
        
        try {
            const registrationData = {
                email: formData.email,
                password: formData.password,
                displayName: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName
            };
            
            console.log('Sending registration data:', registrationData);
            
            const { token, user } = await register(registrationData);
            
            // Показуємо повідомлення про успіх
            setSuccess(true);
            
            // Невелика затримка для показу повідомлення
            setTimeout(() => {
                // Автоматичний логін після реєстрації
                loginSuccess({ token, user });
                navigate("/forum"); // Перекидання на головну сторінку
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);
            
            if (error.response?.status === 409) {
                setErrors({ email: 'Користувач з таким email вже існує' });
            } else if (error.response?.status === 400) {
                setErrors({ general: 'Невірні дані. Перевірте правильність заповнення полів' });
            } else {
                setErrors({ general: 'Помилка реєстрації. Спробуйте ще раз' });
            }
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-15 w-full text-white">
            <h2 className="text-2xl font-semibold mb-4">Профіль</h2>
            <div>
                <label className="block text-md">Ім'я</label>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md placeholder-white/50 focus:outline-none input text-gray-800 ${
                        errors.firstName 
                            ? 'bg-red-100 border-2 border-red-400' 
                            : 'bg-[#D9D9D9]/20'
                    }`}
                    placeholder="Anna"
                />
                {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                )}
            </div>
            <div>
                <label className="block text-md">Прізвище</label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md placeholder-white/50 focus:outline-none input text-gray-800 ${
                        errors.lastName 
                            ? 'bg-red-100 border-2 border-red-400' 
                            : 'bg-[#D9D9D9]/20'
                    }`}
                    placeholder="Last Name"
                />
                {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                )}
            </div>
            <div>
                <label className="block text-md">Пошта</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md placeholder-white/50 focus:outline-none input text-gray-800 ${
                        errors.email 
                            ? 'bg-red-100 border-2 border-red-400' 
                            : 'bg-[#D9D9D9]/20'
                    }`}
                    placeholder="Пошта"
                />
                {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
            </div>
            <h2 className="text-2xl font-semibold mb-4">Пароль</h2>
            <div>
                <label className="block text-md">Пароль</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md outline-none input text-gray-800 ${
                        errors.password 
                            ? 'bg-red-100 border-2 border-red-400' 
                            : 'bg-white/60'
                    }`}
                    placeholder="Ваш пароль"
                />
                {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
            </div>
            <div>
                <label className="block text-md">Підтвердження пароля</label>
                <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md outline-none  input text-gray-800 ${
                        errors.passwordConfirm 
                            ? 'bg-red-100 border-2 border-red-400' 
                            : 'bg-white/60'
                    }`}
                    placeholder="Підтвердіть пароль"
                />
                {errors.passwordConfirm && (
                    <p className="text-red-400 text-sm mt-1">{errors.passwordConfirm}</p>
                )}
            </div>
            
            {errors.general && (
                <div className="text-red-400 text-sm text-center mb-4">
                    {errors.general}
                </div>
            )}
                    
                    {success && (
                        <div className="animate-success-pop">
                            <div className="relative bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-xl px-6 py-4 backdrop-blur-sm shadow-lg animate-glow overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                
                                <div className="relative flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="animate-bounce">
                                            <svg className="w-6 h-6 text-green-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        {/* Pulse ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-green-300 font-semibold text-lg animate-float">Реєстрація успішна!</p>
                                        <p className="text-green-400/80 text-sm animate-pulse">Перенаправляємо...</p>
                                    </div>
                                </div>
                                
                                {/* Progress bar with glow */}
                                <div className="mt-4 bg-green-500/20 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div className="animate-progress-bar bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 h-full rounded-full shadow-lg shadow-green-400/50"></div>
                                </div>
                                
                                {/* Floating particles effect */}
                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-float opacity-60"></div>
                                <div className="absolute top-4 right-6 w-1 h-1 bg-emerald-400 rounded-full animate-float opacity-40" style={{animationDelay: '0.5s'}}></div>
                                <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-green-300 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={success || !isFormValid}
                        className={`w-full p-3 outline-none rounded-lg transition-all duration-300 transform ${
                            success 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed scale-105 shadow-lg shadow-green-500/25' 
                                : isFormValid
                                    ? 'bg-blue-700 hover:bg-blue-800 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer'
                                    : 'bg-blue-800 text-blue-200 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <span className="flex items-center justify-center space-x-2">
                            {success && (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>
                                {success ? 'Успішно!' : 
                                 isFormValid ? 'Підтвердити' : 
                                 'Заповніть всі поля'}
                            </span>
                        </span>
                    </button>
                </form>
            );
        };

export default SignupForm;
