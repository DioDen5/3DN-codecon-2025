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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        try {
            // Валідація паролів
            if (formData.password !== formData.passwordConfirm) {
                setError('Паролі не співпадають');
                return;
            }
            
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
                setError('Користувач з таким email вже існує');
            } else if (error.response?.status === 400) {
                setError('Невірні дані. Перевірте правильність заповнення полів');
            } else {
                setError('Помилка реєстрації. Спробуйте ще раз');
            }
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-15 w-full text-white">
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            <div>
                <label className="block text-md">First Name</label>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Anna"
                />
            </div>
            <div>
                <label className="block text-md">Last Name</label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Last Name"
                />
            </div>
            <div>
                <label className="block text-md">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Email"
                />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Password</h2>
            <div>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white/60 outline-none input text-gray-800"
                    placeholder="Your Password"
                />
            </div>
            <div>
                <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white/60 outline-none mb-8 input text-gray-800"
                    placeholder="Confirm Password"
                />
            </div>
                    {error && (
                        <div className="animate-fade-in">
                            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                                {error}
                            </p>
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
                        disabled={success}
                        className={`w-full p-3 outline-none rounded-lg cursor-pointer transition-all duration-300 transform ${
                            success 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed scale-105 shadow-lg shadow-green-500/25' 
                                : 'bg-blue-700 hover:bg-blue-800 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25'
                        }`}
                    >
                        <span className="flex items-center justify-center space-x-2">
                            {success && (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{success ? 'Успішно!' : 'Confirm'}</span>
                        </span>
                    </button>
                </form>
            );
        };

export default SignupForm;
