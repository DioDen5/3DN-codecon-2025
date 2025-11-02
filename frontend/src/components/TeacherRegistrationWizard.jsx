import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, GraduationCap, BookOpen, Lock, Image, FileText, CheckCircle } from 'lucide-react';
import { registerTeacher } from '../api/auth';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const TeacherRegistrationWizard = ({ email, onBack, onSuccess }) => {
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();
    const { showSuccess, showError } = useNotification();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        displayName: '',
        university: '',
        department: '',
        subjects: [''],
        password: '',
        confirmPassword: '',
        image: '',
        imageFile: null,
        imagePreview: null,
        bio: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [focusedFields, setFocusedFields] = useState({});
    
    const totalSteps = 6;
    
    const handleFocus = (field) => {
        setFocusedFields(prev => ({ ...prev, [field]: true }));
    };
    
    const handleBlur = (field) => {
        setFocusedFields(prev => ({ ...prev, [field]: false }));
    };
    
    const getInputClassName = (field, hasError = false, baseClasses = 'w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 focus:outline-none transition-all duration-300') => {
        const hasValue = formData[field] && formData[field].trim().length > 0;
        const isFocused = focusedFields[field];
        const shouldShowBlueBorder = hasValue || isFocused;
        
        if (hasError) {
            return `${baseClasses} border border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]`;
        }
        
        if (shouldShowBlueBorder) {
            return `${baseClasses} border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]`;
        }
        
        // Сіре обведення за замовчуванням
        return `${baseClasses} border border-gray-500`;
    };

    useEffect(() => {
        if (formData.firstName && formData.lastName && !formData.displayName) {
            setFormData(prev => ({
                ...prev,
                displayName: `${prev.firstName} ${prev.middleName ? prev.middleName + ' ' : ''}${prev.lastName}`.trim()
            }));
        }
    }, [formData.firstName, formData.lastName, formData.middleName]);

    const steps = [
        { number: 1, title: 'Особисті дані', icon: User },
        { number: 2, title: 'Університет', icon: GraduationCap },
        { number: 3, title: 'Предмети', icon: BookOpen },
        { number: 4, title: 'Пароль', icon: Lock },
        { number: 5, title: 'Фото', icon: Image },
        { number: 6, title: 'Біо', icon: FileText }
    ];

    const handleChange = (field, value) => {
        let formattedValue = value;
        
        // Для полів імен автоматично форматуємо: перша літера велика, решта малі
        if (field === 'firstName' || field === 'lastName' || field === 'middleName') {
            if (value.length > 0) {
                // Перша літера велика, решта малі
                formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: formattedValue
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index] = value;
        setFormData(prev => ({
            ...prev,
            subjects: newSubjects
        }));
    };

    const addSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, '']
        }));
    };

    const removeSubject = (index) => {
        if (formData.subjects.length > 1) {
            setFormData(prev => ({
                ...prev,
                subjects: prev.subjects.filter((_, i) => i !== index)
            }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Ім\'я обов\'язкове';
            if (!formData.lastName.trim()) newErrors.lastName = 'Прізвище обов\'язкове';
            if (!formData.middleName.trim()) newErrors.middleName = 'По батькові обов\'язкове';
            // displayName генерується автоматично на основі firstName, lastName, middleName
            // phone не обов'язкове - пропускається якщо не вказано
        } else if (step === 2) {
            if (!formData.university.trim()) newErrors.university = 'Університет обов\'язковий';
            if (!formData.department.trim()) newErrors.department = 'Кафедра обов\'язкова';
        } else if (step === 3) {
            const validSubjects = formData.subjects.filter(s => s.trim());
            if (validSubjects.length === 0) {
                newErrors.subjects = 'Додайте хоча б один предмет';
            }
        } else if (step === 4) {
            if (!formData.password) newErrors.password = 'Пароль обов\'язковий';
            else if (formData.password.length < 8) newErrors.password = 'Пароль має бути мінімум 8 символів';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Підтвердження пароля обов\'язкове';
            else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Паролі не співпадають';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        
        setLoading(true);
        try {
            const validSubjects = formData.subjects.filter(s => s.trim());
            const registrationData = {
                email,
                password: formData.password,
                displayName: formData.displayName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName || undefined,
                university: formData.university,
                department: formData.department,
                subjects: validSubjects,
                image: formData.image || undefined,
                bio: formData.bio || undefined
            };
            
                    const { token, user, teacher } = await registerTeacher(registrationData);
                    loginSuccess({ token, user });
                    showSuccess('Реєстрацію успішно завершено! Ваш профіль очікує верифікації адміністратором.');
                    
                    // Визначаємо правильний редирект для викладачів
                    const teacherProfile = teacher ? { id: teacher.id || teacher._id } : null;
                    const redirectPath = await getRedirectAfterLogin(user, teacherProfile);
                    
                    setTimeout(() => {
                        onSuccess?.();
                        navigate(redirectPath);
                    }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            showError(error.response?.data?.error || 'Помилка реєстрації. Спробуйте ще раз.');
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Ім'я:</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                onFocus={() => handleFocus('firstName')}
                                onBlur={() => handleBlur('firstName')}
                                className={getInputClassName('firstName', errors.firstName)}
                                placeholder="Олександр"
                            />
                            {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Прізвище:</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                onFocus={() => handleFocus('lastName')}
                                onBlur={() => handleBlur('lastName')}
                                className={getInputClassName('lastName', errors.lastName)}
                                placeholder="Петренко"
                            />
                            {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">По батькові:</label>
                            <input
                                type="text"
                                value={formData.middleName}
                                onChange={(e) => handleChange('middleName', e.target.value)}
                                onFocus={() => handleFocus('middleName')}
                                onBlur={() => handleBlur('middleName')}
                                className={getInputClassName('middleName', errors.middleName)}
                                placeholder="Володимирович"
                            />
                            {errors.middleName && <p className="text-red-400 text-sm mt-1">{errors.middleName}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Номер телефону: <span className="text-gray-400 text-xs">(не обов'язково)</span></label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                onFocus={() => handleFocus('phone')}
                                onBlur={() => handleBlur('phone')}
                                className={getInputClassName('phone')}
                                placeholder="+380 12 345 67 89"
                            />
                        </div>
                    </div>
                );
                
            case 2:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Університет:</label>
                            <input
                                type="text"
                                value={formData.university}
                                onChange={(e) => handleChange('university', e.target.value)}
                                onFocus={() => handleFocus('university')}
                                onBlur={() => handleBlur('university')}
                                className={getInputClassName('university', errors.university)}
                                placeholder="Львівський національний університет"
                            />
                            {errors.university && <p className="text-red-400 text-sm mt-1">{errors.university}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Кафедра:</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                onFocus={() => handleFocus('department')}
                                onBlur={() => handleBlur('department')}
                                className={getInputClassName('department', errors.department)}
                                placeholder="Кафедра комп'ютерних наук"
                            />
                            {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
                        </div>
                    </div>
                );
                
            case 3:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Предмети:</label>
                            {formData.subjects.map((subject, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                                        onFocus={() => handleFocus(`subject-${index}`)}
                                        onBlur={() => handleBlur(`subject-${index}`)}
                                        className={subject.trim() || focusedFields[`subject-${index}`] 
                                            ? 'flex-1 px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 focus:outline-none transition-all duration-300 border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                                            : 'flex-1 px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 focus:outline-none transition-all duration-300 border border-gray-500'
                                        }
                                        placeholder={`Предмет ${index + 1}`}
                                    />
                                    {formData.subjects.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSubject(index)}
                                        className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white transition"
                                    >
                                        Видалити
                                    </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSubject}
                                className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition"
                            >
                                + Додати предмет
                            </button>
                            {errors.subjects && <p className="text-red-400 text-sm mt-1">{errors.subjects}</p>}
                        </div>
                    </div>
                );
                
            case 4:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Пароль:</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onFocus={() => handleFocus('password')}
                                onBlur={() => handleBlur('password')}
                                className={getInputClassName('password', errors.password)}
                                placeholder="Мінімум 8 символів"
                            />
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Підтвердження пароля:</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                onFocus={() => handleFocus('confirmPassword')}
                                onBlur={() => handleBlur('confirmPassword')}
                                className={getInputClassName('confirmPassword', errors.confirmPassword)}
                                placeholder="Підтвердіть пароль"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                );
                
            case 5:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Фото профілю:</label>
                            <div className="flex flex-col items-center gap-4">
                                {formData.imagePreview && (
                                    <div className="relative">
                                        <img 
                                            src={formData.imagePreview} 
                                            alt="Preview" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null, image: '' }));
                                            }}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                
                                <label className="cursor-pointer">
                                    <div className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium flex items-center gap-2">
                                        <Image className="w-5 h-5" />
                                        <span>{formData.imagePreview ? 'Змінити фото' : 'Вибрати фото'}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    showError('Розмір файлу не повинен перевищувати 5MB');
                                                    return;
                                                }
                                                
                                                if (!file.type.startsWith('image/')) {
                                                    showError('Будь ласка, виберіть зображення');
                                                    return;
                                                }

                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        imageFile: file,
                                                        imagePreview: event.target.result,
                                                        image: event.target.result // Зберігаємо base64 для відправки
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-400 text-center">
                                    {formData.imagePreview 
                                        ? 'Фото вибрано. Якщо не вибрано, буде використано фото за замовчуванням'
                                        : 'Якщо не вибрано, буде використано фото за замовчуванням'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
                
            case 6:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Біографія (опціонально)</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                onFocus={() => handleFocus('bio')}
                                onBlur={() => handleBlur('bio')}
                                rows="6"
                                maxLength="500"
                                className={getInputClassName('bio', false, 'w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 resize-none focus:outline-none transition-all duration-300')}
                                placeholder="Коротка інформація про себе..."
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {formData.bio.length}/500 символів
                            </p>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 p-10 w-full text-white">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Реєстрація викладача</h2>
                
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Крок {currentStep} з {totalSteps}</span>
                        <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>
                
                <div className="flex items-center mb-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;
                        
                        return (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '54px' }}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-500/50' 
                                            : isCompleted 
                                                ? 'bg-green-500 shadow-md' 
                                                : 'bg-gray-600'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        ) : (
                                            <Icon className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <p className={`text-xs mt-2 text-center whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}>
                                        {step.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 min-w-[20px] transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            <div className="min-h-[400px] bg-gray-800/30 rounded-lg p-6">
                <div className="animate-[slideIn_0.4s_ease-out]">
                    {renderStep()}
                </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                    type="button"
                    onClick={currentStep === 1 ? onBack : handlePrev}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    {currentStep === 1 ? 'Назад до вибору' : 'Попередній крок'}
                </button>
                
                {currentStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition"
                    >
                        Наступний крок
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 font-semibold"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Обробка...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Завершити реєстрацію
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeacherRegistrationWizard;

