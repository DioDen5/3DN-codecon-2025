import { useState, useRef } from "react";
import { register, checkEmailForRegistration, registerTeacher, sendVerificationCode, loginWithCode } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import RoleSelectionModal from "./RoleSelectionModal";
import TeacherRegistrationWizard from "./TeacherRegistrationWizard";
import { useNotification } from "../contexts/NotificationContext";
import Modal from "./Modal";
import teacherIconSrc from "../assets/teacher-icon.svg";

const SignupForm = ({ switchToLogin, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(true);
    const [emailChecked, setEmailChecked] = useState(false);
    const [showLoginWithCode, setShowLoginWithCode] = useState(false);
    const [showTeacherWizard, setShowTeacherWizard] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState(false);
    const codeInputRefs = useRef([]);
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();
    const { showSuccess, showError } = useNotification();

    const isFormValid = formData.firstName.trim() && 
                       formData.lastName.trim() && 
                       formData.email.trim() && 
                       formData.password && 
                       formData.passwordConfirm;

    const isValidNameFormat = (name) => {
        if (!name.trim()) return false;
        const trimmed = name.trim();
        return /^[А-ЯЇІЄҐA-Z][а-яїієґa-z]+$/.test(trimmed);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        if (name === 'firstName' || name === 'lastName') {
            if (value.length > 0) {
                formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
        }
        
        setFormData({
            ...formData,
            [name]: formattedValue,
        });
        
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        setShowRoleModal(false);
        
        if (role === 'teacher') {
            if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
                await checkEmailForTeacher(formData.email);
            }
        }
    };

    const checkEmailForTeacher = async (email) => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Введіть коректний email' });
            return;
        }
        
        setErrors({});
        setEmailExistsError(false);
        setEmailChecked(false); // Reset before check

        try {
            const result = await checkEmailForRegistration(email, 'teacher');
            
            // Якщо Teacher профіль існує (створений адміном)
            if (result.teacherExists) {
                setEmailChecked(true);
                setShowLoginWithCode(true);
                setCodeSent(false);
                await handleSendCode(email);
                showSuccess('Профіль викладача з такою поштою вже існує. Підтвердіть вхід за кодом');
                return;
            }
            
            // Якщо User з таким email вже існує
            if (result.userExists) {
                setEmailExistsError(true);
                setEmailChecked(false);
                return;
            }
            
            // Якщо email вільний
            if (result.canRegister) {
                setEmailChecked(true);
                showSuccess('Email вільний. Можна продовжувати реєстрацію.');
                return;
            }
            
            // Якщо нічого не підійшло
            setErrors({ email: 'Невідома помилка при перевірці email' });
        } catch (error) {
            console.error('Error checking email:', error);
            console.error('Error response:', error.response?.data);
            setEmailChecked(false);
            setEmailExistsError(false);
            
            // Обробка помилок з бекенду
            if (error.response?.status === 409) {
                const errorData = error.response?.data;
                if (errorData?.userExists) {
                    // User з таким email вже існує
                    setEmailExistsError(true);
                } else if (errorData?.teacherExists) {
                    // Teacher профіль існує (хоча це має бути 200, але на всяк випадок)
                    setEmailChecked(true);
                    setShowLoginWithCode(true);
                    setCodeSent(false);
                    await handleSendCode(email);
                    showSuccess('Профіль викладача з такою поштою вже існує. Підтвердіть вхід за кодом');
                } else {
                    // Інший конфлікт
                    setErrors({ email: errorData?.error || 'Користувач з таким email вже існує' });
                }
            } else if (error.response?.status === 400) {
                // Помилка валідації
                setErrors({ email: error.response?.data?.error || 'Невірний формат email' });
            } else {
                // Інші помилки
                setErrors({ email: error.response?.data?.error || 'Помилка перевірки email. Спробуйте ще раз.' });
            }
        }
    };

    const handleSendCode = async (email) => {
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
        setErrors({});
        
        if (!verificationCode || verificationCode.length !== 6) {
            setErrors({ code: 'Код повинен містити 6 цифр' });
            return;
        }
        
        try {
            const { token, user, requiresPasswordSetup, teacherProfile } = await loginWithCode(formData.email, verificationCode);
            loginSuccess({ token, user });
            showSuccess('Вхід успішний!');
            
            // Якщо потрібно встановити пароль, зберігаємо флаг
            if (requiresPasswordSetup) {
                sessionStorage.setItem('teacherRequiresPasswordSetup', 'true');
            }
            
            // Визначаємо правильний редирект для викладачів
            const redirectPath = await getRedirectAfterLogin(user, teacherProfile);
            
            navigate(redirectPath);
        } catch (error) {
            setErrors({ code: error.response?.data?.error || 'Невірний код' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedRole) {
            setShowRoleModal(true);
            return;
        }
        
        setHasAttemptedSubmit(true);
        setErrors({});
        setSuccess(false);
        
        const newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ім\'я обов\'язкове';
        } else if (!isValidNameFormat(formData.firstName)) {
            newErrors.firstName = 'Ім\'я має починатися з великої літери, решта - малі';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Прізвище обов\'язкове';
        } else if (!isValidNameFormat(formData.lastName)) {
            newErrors.lastName = 'Прізвище має починатися з великої літери, решта - малі';
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
            
            const { token, user } = await register(registrationData);
            
            setSuccess(true);
            
            setTimeout(() => {
                loginSuccess({ token, user });
                navigate("/forum");
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response?.status === 409) {
                setErrors({ email: 'Користувач з таким email вже існує. Якщо це ви, увійдіть в систему.' });
            } else if (error.response?.status === 400) {
                setErrors({ general: error.response?.data?.error || 'Невірні дані. Перевірте правильність заповнення полів' });
            } else {
                setErrors({ general: 'Помилка реєстрації. Спробуйте ще раз' });
            }
        }
    };


    // Debug logging removed for production

    if (showTeacherWizard && selectedRole === 'teacher') {
        return (
            <Modal isOpen={true} onClose={() => {
                setShowTeacherWizard(false);
                if (onClose) {
                    onClose();
                } else {
                    switchToLogin();
                }
            }}>
                <TeacherRegistrationWizard
                    email={formData.email}
                    onBack={() => {
                        setShowTeacherWizard(false);
                        setSelectedRole(null);
                    }}
                    onSuccess={() => {
                        setShowTeacherWizard(false);
                        switchToLogin();
                    }}
                />
            </Modal>
        );
    }

    if (showLoginWithCode) {
        return (
            <Modal isOpen={true} onClose={() => {
                setShowLoginWithCode(false);
                setVerificationCode('');
                setCodeSent(false);
                if (onClose) {
                    onClose();
                } else {
                    switchToLogin();
                }
            }}>
                <div className="space-y-6 p-10 w-full text-white">
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold mb-2">Підтвердження входу</h2>
                        <p className="text-sm text-gray-300">
                            Профіль викладача з поштою <strong>{formData.email}</strong> вже існує в системі.
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
                                            className={`w-12 h-16 rounded-md bg-[#D9D9D9]/20 text-gray-800 text-center text-3xl font-bold focus:outline-none transition-all duration-300 ${
                                                errors.code 
                                                    ? 'border border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' 
                                                    : 'border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                                            } ${
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
                            {errors.code && (
                                <p className="text-red-400 text-sm mt-3">{errors.code}</p>
                            )}
                            <div className="flex justify-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleSendCode(formData.email)}
                                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition underline underline-offset-2"
                                >
                                    {codeSent ? 'Надіслати код повторно' : 'Надіслати код'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLoginWithCode(false);
                                    setVerificationCode('');
                                    setCodeSent(false);
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
            </Modal>
        );
    }

    if (showRoleModal) {
        return (
            <RoleSelectionModal
                isOpen={showRoleModal}
                onClose={() => {
                    setShowRoleModal(false);
                    if (onClose) {
                        onClose();
                    } else {
                        switchToLogin();
                    }
                }}
                onSelectRole={handleRoleSelect}
            />
        );
    }

    return (
        <Modal isOpen={true} onClose={() => {
            if (onClose) {
                onClose();
            } else {
                switchToLogin();
            }
        }}>
            {selectedRole === 'teacher' ? (
                <div className="space-y-6 p-10 w-full">
                    <div className="mb-6">
                        <div className="px-4 py-3 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-purple-800/20 rounded-lg border border-purple-400/20 mb-4 backdrop-blur-sm teacher-registration-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-[38.4px] h-[38.4px] bg-indigo-600/80 rounded-full flex items-center justify-center backdrop-blur-sm p-2">
                                    <img src={teacherIconSrc} alt="Teacher" className="w-5 h-5 object-contain brightness-0 invert" />
                                </div>
                                <p className="text-lg font-semibold text-white">Реєстрація викладача</p>
                            </div>
                            <p className="text-xs text-white/70">
                                Спочатку введіть email та перевірте, чи існує профіль викладача з такою поштою
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2 font-medium text-white">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={emailChecked}
                                className={`w-full px-4 py-3 rounded-lg placeholder-white/40 focus:outline-none transition-all ${
                                    errors.email 
                                        ? 'bg-red-900/30 border-2 border-red-500 text-white' 
                                        : emailChecked
                                            ? 'bg-white/5 border border-white/10 text-white/60 cursor-not-allowed'
                                            : 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50'
                                }`}
                                placeholder="teacher@lnu.edu.ua"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠</span>
                                    {errors.email}
                                </p>
                            )}
                            {emailExistsError && (
                                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <span className="text-lg">⚠</span>
                                        <span>Користувач з таким email вже існує</span>
                                    </p>
                                </div>
                            )}
                            {!errors.email && !emailChecked && (
                                <p className="text-xs text-white/60 mt-2">
                                    Натисніть кнопку нижче, щоб перевірити email та продовжити
                                </p>
                            )}
                            {emailChecked && !errors.email && !showTeacherWizard && (
                                <p className="text-xs text-green-300 mt-2 flex items-center gap-1">
                                    <span>✓</span>
                                    Email перевірено. Можна продовжувати реєстрацію.
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {emailExistsError ? (
                        <div className="space-y-4">
                            <div className="p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-600/50 rounded-xl backdrop-blur-sm">
                                <h4 className="text-white font-semibold mb-4 text-center">Що далі?</h4>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose?.();
                                            switchToLogin();
                                        }}
                                        className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition text-white font-medium cursor-pointer shadow-lg shadow-blue-700/30 hover:shadow-blue-700/50 flex items-center justify-center gap-2"
                                    >
                                        <span>Увійти в систему</span>
                                        <span>→</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailExistsError(false);
                                            setErrors({});
                                            setFormData(prev => ({ ...prev, email: '' }));
                                        }}
                                        className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition text-white text-sm cursor-pointer"
                                    >
                                        Ввести інший email
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !emailChecked ? (
                        <button
                            type="button"
                            onClick={async () => {
                                if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
                                    setErrors({ email: 'Введіть коректний email' });
                                    return;
                                }
                                await checkEmailForTeacher(formData.email);
                            }}
                            className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition font-medium flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer"
                        >
                            <span>Перевірити email</span>
                            <span>→</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmailChecked(false);
                                    setErrors({});
                                    setFormData(prev => ({ ...prev, email: '' }));
                                }}
                                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition text-white"
                            >
                                Змінити email
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTeacherWizard(true)}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition font-medium text-white shadow-lg shadow-green-600/30 hover:shadow-green-600/50 cursor-pointer"
                            >
                                Продовжити реєстрацію
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 p-10 w-full text-white">
                    <div className="px-4 py-2 bg-blue-500/20 rounded-lg mb-4">
                        <p className="text-sm">
                            Вибрано: <strong>Студент</strong>
                        </p>
                    </div>
                    
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
                            className={`w-full px-4 py-2 rounded-md outline-none input text-gray-800 ${
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
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                
                                <div className="relative flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="animate-bounce">
                                            <svg className="w-6 h-6 text-green-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-green-300 font-semibold text-lg animate-float">Реєстрація успішна!</p>
                                        <p className="text-green-400/80 text-sm animate-pulse">Перенаправляємо...</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 bg-green-500/20 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div className="animate-progress-bar bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 h-full rounded-full shadow-lg shadow-green-400/50"></div>
                                </div>
                                
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
            )}
        </Modal>
    );
};

export default SignupForm;
