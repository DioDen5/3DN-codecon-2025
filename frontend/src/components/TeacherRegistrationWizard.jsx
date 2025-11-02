import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, GraduationCap, BookOpen, Lock, Image, FileText, CheckCircle, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { registerTeacher } from '../api/auth';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import AutocompleteInput from './AutocompleteInput';
import universitiesData from '../data/universities.json';
import facultiesData from '../data/faculties.json';
import subjectsData from '../data/subjects.json';
import { getRedirectAfterLogin } from '../utils/getRedirectAfterLogin';

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
        faculty: '',
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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

    // Очищуємо факультет і кафедру при зміні університету
    const [prevUniversity, setPrevUniversity] = useState('');
    useEffect(() => {
        if (formData.university !== prevUniversity && prevUniversity !== '') {
            setFormData(prev => ({ ...prev, faculty: '', department: '' }));
        }
        setPrevUniversity(formData.university);
    }, [formData.university, prevUniversity]);

    // Очищуємо кафедру при зміні факультету
    const [prevFaculty, setPrevFaculty] = useState('');
    useEffect(() => {
        if (formData.faculty !== prevFaculty && prevFaculty !== '') {
            setFormData(prev => ({ ...prev, department: '' }));
        }
        setPrevFaculty(formData.faculty);
    }, [formData.faculty, prevFaculty]);

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
        const trimmedValue = value.trim();
        
        // Перевіряємо мінімальну довжину
        if (trimmedValue && trimmedValue.length < 2) {
            setErrors(prev => ({
                ...prev,
                [`subject-${index}`]: 'Назва предмета має містити мінімум 2 символи'
            }));
        }
        
        // Перевіряємо на дублікати (тільки якщо значення не порожнє)
        if (trimmedValue) {
            const duplicateIndex = formData.subjects.findIndex((s, i) => 
                i !== index && s.trim().toLowerCase() === trimmedValue.toLowerCase()
            );
            
            if (duplicateIndex !== -1) {
                setErrors(prev => ({
                    ...prev,
                    [`subject-${index}`]: 'Цей предмет вже додано',
                    [`subject-${duplicateIndex}`]: 'Цей предмет вже додано'
                }));
                showError(`Предмет "${trimmedValue}" вже додано`);
            } else {
                // Очищуємо помилку дублікату, якщо вона була
                setErrors(prev => {
                    const newErrors = { ...prev };
                    if (newErrors[`subject-${index}`] === 'Цей предмет вже додано') {
                        delete newErrors[`subject-${index}`];
                    }
                    return newErrors;
                });
            }
        } else {
            // Якщо поле порожнє, очищуємо помилки
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`subject-${index}`];
                return newErrors;
            });
        }
        
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
            
            // Очищуємо помилки для видаленого предмета та зсуваємо індекси
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`subject-${index}`];
                // Зсуваємо помилки для наступних індексів
                const updatedErrors = {};
                Object.keys(newErrors).forEach(key => {
                    if (key.startsWith('subject-')) {
                        const subjectIndex = parseInt(key.split('-')[1]);
                        if (subjectIndex < index) {
                            updatedErrors[key] = newErrors[key];
                        } else if (subjectIndex > index) {
                            updatedErrors[`subject-${subjectIndex - 1}`] = newErrors[key];
                        }
                    } else {
                        updatedErrors[key] = newErrors[key];
                    }
                });
                return updatedErrors;
            });
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
            if (!formData.faculty.trim()) newErrors.faculty = 'Факультет обов\'язковий';
            // department опціональне - не перевіряємо
        } else if (step === 3) {
            const validSubjects = formData.subjects.filter(s => s.trim());
            if (validSubjects.length === 0) {
                newErrors.subjects = 'Додайте хоча б один предмет';
            }
            
            // Перевірка кожного предмета на мінімальну довжину
            formData.subjects.forEach((subject, index) => {
                const trimmed = subject.trim();
                if (trimmed && trimmed.length < 2) {
                    newErrors[`subject-${index}`] = 'Назва предмета має містити мінімум 2 символи';
                } else if (!trimmed && index < formData.subjects.length - 1) {
                    // Порожнє поле (крім останнього)
                    newErrors[`subject-${index}`] = 'Введіть назву предмета або видаліть поле';
                }
            });
            
            // Перевірка на дублікати
            const subjectsLower = validSubjects.map(s => s.trim().toLowerCase());
            const uniqueSubjects = new Set(subjectsLower);
            if (subjectsLower.length !== uniqueSubjects.size) {
                // Знаходимо дублікати
                formData.subjects.forEach((subject, index) => {
                    if (subject.trim()) {
                        const count = subjectsLower.filter(s => s === subject.trim().toLowerCase()).length;
                        if (count > 1) {
                            newErrors[`subject-${index}`] = 'Цей предмет вже додано';
                        }
                    }
                });
            }
        } else if (step === 4) {
            if (!formData.password) newErrors.password = 'Пароль обов\'язковий';
            else if (formData.password.length < 8) newErrors.password = 'Пароль має бути мінімум 8 символів';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Підтвердження пароля обов\'язкове';
            else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Паролі не співпадають';
            }
        } else if (step === 5) {
            if (!formData.imagePreview || !formData.image) {
                newErrors.image = 'Фото профілю обов\'язкове';
            }
        } else if (step === 6) {
            if (!formData.bio.trim()) {
                newErrors.bio = 'Біографія обов\'язкова';
            } else if (formData.bio.trim().length < 10) {
                newErrors.bio = 'Біографія має містити мінімум 10 символів';
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
        if (!validateStep(totalSteps)) return;
        
        setLoading(true);
        try {
            const validSubjects = formData.subjects.filter(s => s.trim());
            
            // Перевірка обов'язкових полів перед відправкою
            if (!formData.image || !formData.image.trim()) {
                showError('Фото профілю обов\'язкове');
                setErrors({ image: 'Фото профілю обов\'язкове' });
                setLoading(false);
                return;
            }
            
            const registrationData = {
                email,
                password: formData.password,
                displayName: formData.displayName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName || undefined,
                university: formData.university,
                faculty: formData.faculty,
                department: formData.department || undefined, // Опціональне поле
                subjects: validSubjects,
                image: formData.image, // Обов'язкове поле
                bio: formData.bio
            };
            
            console.log('Registration data:', { ...registrationData, image: registrationData.image ? 'base64 image (length: ' + registrationData.image.length + ')' : 'missing' });
            
                    const { token, user, teacher } = await registerTeacher(registrationData);
                    loginSuccess({ token, user });
                    showSuccess('Реєстрацію успішно завершено! Ваш профіль очікує верифікації адміністратором.');
                    
                    // Визначаємо правильний редирект для викладачів
                    const teacherProfile = teacher ? { id: teacher.id || teacher._id } : null;
                    const redirectPath = await getRedirectAfterLogin(user, teacherProfile);
                    
                    // Спочатку закриваємо модальне вікно реєстрації
                    onSuccess?.();
                    
                    // Потім перенаправляємо на профіль
                    setTimeout(() => {
                        navigate(redirectPath);
                    }, 100);
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Помилка реєстрації. Спробуйте ще раз.';
            
            if (error.response?.data) {
                console.error('Error response data:', error.response.data);
                
                // Якщо є деталі помилки валідації
                if (Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                    // Якщо Zod повертає масив помилок
                    const firstError = error.response.data.errors[0];
                    errorMessage = `${firstError.path?.join('.') || 'Поле'}: ${firstError.message || 'помилка валідації'}`;
                    console.error('Validation errors:', error.response.data.errors);
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                    if (error.response.data.field) {
                        errorMessage = `${error.response.data.field}: ${errorMessage}`;
                    }
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: errorMessage
            });
            
            showError(errorMessage);
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
                
            case 2: {
                // Крок 2: Університет + Факультет (обов'язкове) + Кафедра (опціональне)
                const selectedUniversity = formData.university.trim();
                const universityData = universitiesData.find(u => 
                    u.name === selectedUniversity || u.shortName === selectedUniversity
                );
                
                // Знаходимо факультети для вибраного університету
                let facultyOptions = [];
                if (universityData) {
                    const universityFaculties = facultiesData.find(f => 
                        f.universityName === universityData.name || f.universityName === universityData.shortName
                    );
                    
                    if (universityFaculties && universityFaculties.faculties) {
                        facultyOptions = universityFaculties.faculties.map((faculty, index) => ({
                            name: faculty.name,
                            shortName: faculty.name,
                            popular: index < 3, // Перші 3 факультети - найчастіші
                            departments: faculty.departments || []
                        }));
                    }
                }
                
                // Знаходимо кафедри для вибраного факультету
                const selectedFaculty = formData.faculty.trim();
                let departmentOptions = [];
                if (selectedFaculty && universityData) {
                    const facultyData = facultyOptions.find(f => f.name === selectedFaculty);
                    if (facultyData && facultyData.departments && facultyData.departments.length > 0) {
                        departmentOptions = facultyData.departments.map((dept, index) => ({
                            name: dept,
                            shortName: dept,
                            popular: index < 3 // Перші 3 кафедри - найчастіші
                        }));
                    }
                }
                
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Університет:</label>
                            <AutocompleteInput
                                value={formData.university}
                                onChange={(value) => handleChange('university', value)}
                                onFocus={() => handleFocus('university')}
                                onBlur={() => handleBlur('university')}
                                options={universitiesData}
                                placeholder="Оберіть або введіть університет"
                                error={!!errors.university}
                                showPopular={true}
                                maxResults={8}
                            />
                            {errors.university && <p className="text-red-400 text-sm mt-1">{errors.university}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Факультет:</label>
                            <AutocompleteInput
                                value={formData.faculty}
                                onChange={(value) => handleChange('faculty', value)}
                                onFocus={() => handleFocus('faculty')}
                                onBlur={() => handleBlur('faculty')}
                                options={facultyOptions}
                                placeholder={selectedUniversity ? "Оберіть або введіть факультет" : "Спочатку оберіть університет"}
                                error={!!errors.faculty}
                                showPopular={true}
                                maxResults={8}
                                allowCustomInput={true}
                                disabled={!selectedUniversity}
                            />
                            {errors.faculty && <p className="text-red-400 text-sm mt-1">{errors.faculty}</p>}
                            {!selectedUniversity && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    <span>Спочатку оберіть університет, щоб побачити список факультетів</span>
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Кафедра: <span className="text-gray-400 text-xs">(не обов'язково)</span></label>
                            <AutocompleteInput
                                value={formData.department}
                                onChange={(value) => handleChange('department', value)}
                                onFocus={() => handleFocus('department')}
                                onBlur={() => handleBlur('department')}
                                options={departmentOptions}
                                placeholder={selectedFaculty ? "Оберіть або введіть кафедру" : "Спочатку оберіть факультет"}
                                error={!!errors.department}
                                showPopular={true}
                                maxResults={8}
                                allowCustomInput={true}
                                disabled={!selectedFaculty}
                            />
                            {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
                            {!selectedFaculty && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    <span>Спочатку оберіть факультет, щоб побачити список кафедр</span>
                                </p>
                            )}
                            {selectedFaculty && departmentOptions.length > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                    ✓ Показано кафедри для <strong>{selectedFaculty}</strong>. Можна також ввести свою або пропустити.
                                </p>
                            )}
                            {selectedFaculty && departmentOptions.length === 0 && (
                                <p className="text-xs text-yellow-400 mt-2">
                                    ⚠ Кафедри для цього факультету не знайдено. Можна ввести назву вручну або пропустити.
                                </p>
                            )}
                        </div>
                    </div>
                );
            }
                
            case 3: {
                // Знаходимо предмети для вибраного факультету
                const selectedFaculty = formData.faculty.trim();
                let subjectOptions = [];
                
                if (selectedFaculty) {
                    const facultySubjects = subjectsData.find(s => s.facultyName === selectedFaculty);
                    if (facultySubjects && facultySubjects.subjects) {
                        // Конвертуємо масив рядків у формат для AutocompleteInput
                        // Перші 3 предмети позначаємо як популярні (найчастіші)
                        subjectOptions = facultySubjects.subjects.map((subj, idx) => ({
                            name: subj,
                            shortName: subj,
                            popular: idx < 3 // Перші 3 предмети - найчастіші
                        }));
                    }
                }
                
                // Якщо факультет не вибрано або предметів не знайдено, показуємо всі предмети
                if (subjectOptions.length === 0) {
                    const allSubjects = new Set();
                    subjectsData.forEach(faculty => {
                        faculty.subjects.forEach(subj => {
                            allSubjects.add(subj);
                        });
                    });
                    subjectOptions = Array.from(allSubjects).slice(0, 15).map(subj => ({
                        name: subj,
                        shortName: subj,
                        popular: false
                    }));
                }
                
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Предмети:</label>
                            {!selectedFaculty && (
                                <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    <span>Оберіть факультет, щоб побачити список предметів для цього факультету</span>
                                </p>
                            )}
                            <div className="space-y-3">
                                {formData.subjects.map((subject, index) => {
                                    const hasError = !!errors[`subject-${index}`];
                                    
                                    return (
                                        <div key={index} className="relative">
                                            <AutocompleteInput
                                                value={subject}
                                                onChange={(value) => handleSubjectChange(index, value)}
                                                onFocus={() => handleFocus(`subject-${index}`)}
                                                onBlur={() => handleBlur(`subject-${index}`)}
                                                options={subjectOptions}
                                                placeholder={selectedFaculty ? `Предмет ${index + 1}` : "Спочатку оберіть факультет"}
                                                error={hasError}
                                                showPopular={true}
                                                maxResults={8}
                                                allowCustomInput={true}
                                                disabled={!selectedFaculty}
                                            />
                                            {hasError && (
                                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>
                                                    {errors[`subject-${index}`]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <button
                                type="button"
                                onClick={addSubject}
                                className="w-full py-2 rounded-md text-white transition font-medium bg-blue-500 hover:bg-blue-600 hover:shadow-lg active:scale-95 mt-3"
                            >
                                + Додати предмет
                            </button>
                            
                            {errors.subjects && (
                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                                    <p className="text-red-400 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                        {errors.subjects}
                                    </p>
                                </div>
                            )}
                            
                            {selectedFaculty && subjectOptions.length > 0 && (
                                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-md">
                                    <p className="text-xs text-blue-300 flex items-center gap-2">
                                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                        <span>Показано предмети для <strong>{selectedFaculty}</strong>. Можна також ввести свої.</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
                
            case 4: {
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Пароль:</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                    className={getInputClassName('password', errors.password)}
                                    placeholder="Мінімум 8 символів"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm mb-2">Підтвердження пароля:</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    onFocus={() => handleFocus('confirmPassword')}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={getInputClassName('confirmPassword', errors.confirmPassword)}
                                    placeholder="Підтвердіть пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                );
            }
                
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
                                {errors.image && (
                                    <p className="text-red-400 text-sm mt-1 text-center">{errors.image}</p>
                                )}
                                {formData.imagePreview && (
                                    <p className="text-xs text-green-400 text-center">
                                        ✓ Фото вибрано
                                    </p>
                                )}
                                {!formData.imagePreview && (
                                    <p className="text-xs text-gray-400 text-center">
                                        Фото профілю обов'язкове
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
                
            case 6:
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                            <label className="block text-sm mb-2">Біографія:</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                onFocus={() => handleFocus('bio')}
                                onBlur={() => handleBlur('bio')}
                                rows="6"
                                maxLength="500"
                                className={getInputClassName('bio', errors.bio, 'w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 resize-none focus:outline-none transition-all duration-300')}
                                placeholder="Коротка інформація про себе..."
                            />
                            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
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

