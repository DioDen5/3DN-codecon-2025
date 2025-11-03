import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, Settings, Mail, Calendar, Award, MessageCircle, MessageSquare, ThumbsUp, Star, GraduationCap, BookOpen, Building2, Shield, Lock, Key, Power, ToggleRight, Play, Smartphone, ShieldCheck, Eye, EyeOff, Edit3, Clock, CheckCircle, AlertCircle, FileQuestion, Sparkles, Wind, Inbox, MessageSquarePlus, Zap } from 'lucide-react';
import { useAuthState } from '../api/useAuthState';
import { getNameChangeStatus } from '../api/name-change';
import { getMyTeacherProfile, getTeacher } from '../api/teachers';
import StarRating from '../components/StarRating';
import NameChangeModal from '../components/NameChangeModal';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import TeacherClaimModal from '../components/TeacherClaimModal';
import { getTeacherSpecialization } from '../utils/getSpecialization';

const TeacherProfilePageNew = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthState();
    
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('teacherProfileActiveTab') || 'profile';
    });
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        reviews: 0,
        averageRating: 0,
        totalLikes: 0,
        totalDislikes: 0
    });
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [privacySettings, setPrivacySettings] = useState({
        showContactInfo: true,
        emailOnNewReviews: true
    });
    const [checkboxAnimations, setCheckboxAnimations] = useState({
        showContactInfo: false,
        emailOnNewReviews: false
    });
    const [fieldAnimations, setFieldAnimations] = useState({
        showContactInfo: false,
        emailOnNewReviews: false
    });
    const [nameChangeRequest, setNameChangeRequest] = useState(null);
    const [showNameChangeModal, setShowNameChangeModal] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const [myTeacherProfile, setMyTeacherProfile] = useState(null);
    const [hasClaimRequest, setHasClaimRequest] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);

    // Завантаження профілю викладача за ID (якщо переглядається чужий профіль)
    useEffect(() => {
        if (id && id !== user?.id) {
            // Завантаження профілю іншого викладача
            const loadTeacherProfile = async () => {
                try {
                    const data = await getTeacher(id);
                    setTeacher(data);
                    setStats({
                        reviews: data.comments || 0,
                        averageRating: data.rating || 0,
                        totalLikes: data.likes || 0,
                        totalDislikes: data.dislikes || 0
                    });
                    setLoading(false);
                } catch (error) {
                    console.error('Error loading teacher profile:', error);
                    setLoading(false);
                }
            };
            loadTeacherProfile();
        }
        // Якщо це свій профіль викладача, teacher буде встановлено через loadMyTeacherProfile
        // Не встановлюємо loading = false тут, щоб дочекатися завантаження
    }, [id, user]);

    // Завантаження статусу запиту на зміну імені та Teacher профілю
    useEffect(() => {
        if (user && user.role === 'teacher') {
            loadNameChangeStatus();
            loadUserProfile();
            loadMyTeacherProfile();
        }
    }, [user]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        localStorage.setItem('teacherProfileActiveTab', tabId);
    };

    // Функції для роботи з модальним вікном зміни імені
    const loadNameChangeStatus = async () => {
        try {
            const response = await getNameChangeStatus();
            if (response.hasRequest) {
                setNameChangeRequest(response.request);
            } else {
                setNameChangeRequest(null);
            }
        } catch (error) {
            console.error('Error loading name change status:', error);
            setNameChangeRequest(null);
        }
    };

    const handleOpenNameChangeModal = () => {
        setShowNameChangeModal(true);
    };

    const handleCloseNameChangeModal = () => {
        setShowNameChangeModal(false);
        // Перезавантажуємо статус після закриття модального вікна
        loadNameChangeStatus();
    };

    // Функція для отримання поточного імені
    const getCurrentDisplayName = () => {
        return user?.displayName || teacher?.name || 'Викладач';
    };

    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/user/profile/profile', {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.profile.profilePicture) {
                    setProfilePicture(data.profile.profilePicture);
                }
            }
        } catch (e) {
            console.error('Error loading profile picture:', e);
        }
    };

    // Завантаження свого Teacher профілю
    const loadMyTeacherProfile = async () => {
        if (!user || user.role !== 'teacher') {
            // Якщо не викладач, встановлюємо loading = false
            if (!id || id === user?.id) {
                setLoading(false);
            }
            return;
        }
        
        try {
            const data = await getMyTeacherProfile();
            console.log('Loaded teacher profile data:', data);
            if (data.teacher) {
                setMyTeacherProfile(data.teacher);
                setHasClaimRequest(data.hasClaimRequest || false);
                // Якщо є прив'язаний профіль, завантажуємо його дані
                setTeacher(data.teacher);
                // Логуємо position для діагностики
                console.log('Teacher position from API:', data.teacher.position);
                // Встановлюємо статистику з даних учителя
                setStats({
                    reviews: data.teacher.comments || 0,
                    averageRating: data.teacher.rating || 0,
                    totalLikes: data.teacher.likes || 0,
                    totalDislikes: data.teacher.dislikes || 0
                });
                // Встановлюємо фото профілю з Teacher профілю, якщо воно є та не є placeholder
                if (data.teacher.image && 
                    data.teacher.image !== '/api/placeholder/300/400' && 
                    data.teacher.image.trim() !== '') {
                    console.log('Setting profile picture from teacher.image');
                    setProfilePicture(data.teacher.image);
                }
                setLoading(false);
            } else {
                setMyTeacherProfile(null);
                setHasClaimRequest(data.hasClaimRequest || false);
                // Якщо немає профілю викладача і це свій профіль, встановлюємо loading = false
                if (!id || id === user?.id) {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error loading my teacher profile:', error);
            if (error.response?.data) {
                console.error('Server error details:', error.response.data);
            }
            setMyTeacherProfile(null);
            setHasClaimRequest(false);
            // При помилці також встановлюємо loading = false
            if (!id || id === user?.id) {
                setLoading(false);
            }
        }
    };

    const handleOpenClaimModal = () => {
        setShowClaimModal(true);
    };

    const handleCloseClaimModal = () => {
        setShowClaimModal(false);
        loadMyTeacherProfile();
    };

    const handleClaimSuccess = () => {
        loadMyTeacherProfile();
    };

    const handleProfilePictureChange = async (file) => {
        if (!file) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch('/api/user/profile/profile-picture', {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setProfilePicture(null);
                }
            } catch (error) {
                console.error('Error deleting profile picture:', error);
            }
            return;
        }

        setIsUploadingPicture(true);
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/user/profile/profile-picture', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setProfilePicture(result.profilePictureUrl);
            } else {
                throw new Error('Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Помилка при завантаженні фото профілю');
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const handlePrivacySettingChange = (setting, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: value
        }));
        
        // Запускаємо анімацію тільки при зміні на активний стан
        if (value) {
            setFieldAnimations(prev => ({
                ...prev,
                [setting]: true
            }));
            
            // Вимикаємо анімацію через час
            setTimeout(() => {
                setFieldAnimations(prev => ({
                    ...prev,
                    [setting]: false
                }));
            }, 600);
        }
        
        // Запускаємо анімацію чекбокса
        setCheckboxAnimations(prev => ({
            ...prev,
            [setting]: true
        }));
        
        // Вимикаємо анімацію через час
        setTimeout(() => {
            setCheckboxAnimations(prev => ({
                ...prev,
                [setting]: false
            }));
        }, 800);
        
        console.log(`Privacy setting ${setting} changed to:`, value);
    };

    const tabs = [
        { id: 'profile', label: 'Профіль', icon: User },
        { id: 'reviews', label: 'Відгуки', icon: MessageCircle },
        { id: 'settings', label: 'Налаштування', icon: Settings }
    ];

    const renderProfileTab = () => (
        <div className="space-y-6 md:space-y-8">
            {/* Заголовок профілю */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex flex-col items-center">
                            <ProfilePictureUpload
                                currentAvatar={profilePicture || teacher?.image}
                                userName={getCurrentDisplayName()}
                                onImageChange={handleProfilePictureChange}
                                size="large"
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-23 md:h-23"
                            />
                            {teacher?.position && (
                                <div className="flex items-center gap-1 text-blue-600 font-semibold -mt-1.5 -ml-3">
                                    <Award size={16} />
                                    <span className="text-xs sm:text-sm">{teacher.position}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{teacher?.name}</h1>
                            <div className="flex flex-col gap-2">
                                {teacher?.university && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <GraduationCap size={18} />
                                        <span className="text-sm sm:text-base">{teacher.university}</span>
                                    </div>
                                )}
                                {teacher?.faculty && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building2 size={18} />
                                        <span className="text-sm sm:text-base">{teacher.faculty}</span>
                                    </div>
                                )}
                                {teacher?.department && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <BookOpen size={18} />
                                        <span className="text-sm sm:text-base">{teacher.department}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900 stat-number-pop">{stats.averageRating}/10</div>
                    <div className="text-xs md:text-sm text-gray-600">Середня оцінка</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900 stat-number-pop">{stats.reviews}</div>
                    <div className="text-xs md:text-sm text-gray-600">Відгуків</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    <ThumbsUp className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900 stat-number-pop">{stats.totalLikes}</div>
                    <div className="text-xs md:text-sm text-gray-600">Подобається</div>
                </div>
                
                <div className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                    {(() => {
                        const specialization = teacher ? getTeacherSpecialization(teacher) : null;
                        const specColor = specialization?.color || '#FF6B9D';
                        const specName = specialization?.name || 'Не вказано';
                        
                        return (
                            <>
                                <GraduationCap 
                                    className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" 
                                    style={{ color: specColor }}
                                />
                                <div className="text-lg md:text-2xl font-bold text-gray-900 stat-number-pop line-clamp-2" title={specName}>
                                    {specName.length > 20 ? `${specName.substring(0, 20)}...` : specName}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600">Спеціалізація</div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Біографія */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-800 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Біографія
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{teacher?.bio}</p>
                </div>
            </div>

            {/* Контактна інформація */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/50 to-blue-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-800 to-blue-500 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        Контактна інформація
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">{teacher?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">{teacher?.phone || 'Номер - не вказано'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReviewsTab = () => (
        <div className="space-y-6">
            {/* Статистика відгуків - показуємо тільки якщо є відгуки */}
            {reviews.length > 0 && (
                <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                    <div className="relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                                <Star className="w-4 h-4 text-white" />
                            </div>
                            Статистика відгуків
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-gray-900">{stats.averageRating}</div>
                            <div className="flex-1">
                                <StarRating rating={stats.averageRating} maxRating={10} size="lg" showNumber={false} />
                                <p className="text-sm text-gray-600 mt-1">Середня оцінка з {stats.reviews} відгуків</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Список відгуків */}
            {reviews.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 rounded-2xl p-12 shadow-2xl border-2 border-blue-200 animate-[slideInFromLeft_0.6s_ease-out_both] relative overflow-hidden">
                    {/* Анімовані декоративні елементи */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full -translate-y-32 translate-x-32 animate-pulse blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full translate-y-24 -translate-x-24 animate-pulse blur-xl"></div>
                    
                    <div className="text-center py-8 relative z-10">
                        {/* Центральна іконка з анімацією */}
                        <div className="relative mb-10 mx-auto w-40 h-40 flex items-center justify-center">
                            {/* Оболонка з анімацією */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-2xl animate-pulse"></div>
                            
                            {/* Основна іконка Inbox */}
                            <div className="relative bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-2xl border-4 border-blue-200 transform transition-all duration-500 hover:scale-110">
                                <Inbox className="w-16 h-16 text-blue-500 relative z-10" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <MessageSquarePlus className="w-4 h-4 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                    <Zap className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            
                            {/* Плаваючі елементи */}
                            <div className="absolute -top-4 right-4 w-6 h-6 bg-blue-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}></div>
                            <div className="absolute -bottom-4 left-4 w-4 h-4 bg-indigo-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                        </div>
                        
                        <div className="space-y-5">
                            <h4 className="text-4xl font-extrabold text-gray-900 mb-3">
                                Тут порожньо
                            </h4>
                            
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
                                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>
                            </div>
                            
                            <p className="text-xl text-gray-700 font-semibold">Поки що ніхто не залишив відгуків</p>
                            
                            <div className="max-w-lg mx-auto mt-8">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Студенти збираються з думками...</p>
                                            <p className="text-xs text-gray-500 italic">Перший відгук з'явиться тут найближчим часом</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white text-black rounded-xl p-4 shadow-lg border border-gray-200 relative overflow-hidden group review-card">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                            <div className="relative">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {review.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.author}</p>
                                            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('uk-UA')}</p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} maxRating={10} size="sm" showNumber={false} />
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Налаштування профілю */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-settings-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        Налаштування профілю
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Поточне ім'я, прізвище та по батькові
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium">{teacher?.name}</span>
                                </div>
                                <button 
                                    onClick={handleOpenNameChangeModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer"
                                >
                                    <Edit3 size={16} />
                                    Редагувати
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{teacher?.email}</span>
                                <span className="text-xs text-gray-400 ml-auto">Не можна змінити</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Статус Teacher профілю */}
                    {user?.role === 'teacher' && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-[slideInFromLeft_0.6s_ease-out_both]">
                            {!myTeacherProfile ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        <h4 className="font-semibold text-gray-900">
                                            Профіль викладача не прив'язано
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-4">
                                        Щоб мати доступ до редагування свого профілю викладача, вам потрібно подати заявку на отримання профілю.
                                    </p>
                                    <button
                                        onClick={handleOpenClaimModal}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                    >
                                        Подати заявку на профіль
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <h4 className="font-semibold text-gray-900">
                                            Профіль викладача прив'язано
                                        </h4>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p><strong>Ім'я:</strong> {myTeacherProfile.name}</p>
                                        <p><strong>Університет:</strong> {myTeacherProfile.university}</p>
                                        <p><strong>Кафедра:</strong> {myTeacherProfile.department}</p>
                                        {myTeacherProfile.subject && (
                                            <p><strong>Предмет:</strong> {myTeacherProfile.subject}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {hasClaimRequest && (
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <p className="text-sm text-yellow-800">
                                            У вас є активна заявка, яка очікує розгляду адміністратором
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Статус запиту на зміну імені */}
                    {nameChangeRequest && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                {nameChangeRequest.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                                {nameChangeRequest.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {nameChangeRequest.status === 'rejected' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                <h4 className="font-semibold text-gray-900">
                                    {nameChangeRequest.status === 'pending' && 'Запит на зміну імені очікує розгляду'}
                                    {nameChangeRequest.status === 'approved' && 'Запит на зміну імені схвалено'}
                                    {nameChangeRequest.status === 'rejected' && 'Запит на зміну імені відхилено'}
                                </h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Нове ім'я:</strong> {nameChangeRequest.newFirstName} {nameChangeRequest.newMiddleName ? nameChangeRequest.newMiddleName + ' ' : ''}{nameChangeRequest.newLastName}</p>
                                <p><strong>Відображуване ім'я:</strong> {nameChangeRequest.newDisplayName}</p>
                                {nameChangeRequest.reason && (
                                    <p><strong>Причина:</strong> {nameChangeRequest.reason}</p>
                                )}
                                <p><strong>Дата створення:</strong> {new Date(nameChangeRequest.createdAt).toLocaleDateString('uk-UA')}</p>
                                {nameChangeRequest.reviewComment && (
                                    <p><strong>Коментар модератора:</strong> {nameChangeRequest.reviewComment}</p>
                                )}
                            </div>
                            {nameChangeRequest.status === 'pending' && (
                                <button
                                    onClick={handleOpenNameChangeModal}
                                    className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm cursor-pointer"
                                >
                                    Переглянути деталі
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Налаштування приватності */}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group privacy-card">
                {/* Декоративні елементи */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/30 rounded-full translate-y-12 -translate-x-12 animate-bounce decorative-element-2" style={{animationDuration: '3s'}}></div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                            <Eye className="w-4 h-4 text-white" />
                        </div>
                        Приватність
                    </h3>
                    <div className="space-y-4">
                        <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-500 ease-in-out ${
                            privacySettings.showContactInfo 
                                ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                                : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                        } ${fieldAnimations.showContactInfo ? 'privacy-field-active-animation' : ''}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={privacySettings.showContactInfo}
                                        onChange={(e) => handlePrivacySettingChange('showContactInfo', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                        privacySettings.showContactInfo 
                                            ? 'bg-blue-600 border-blue-600' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    } ${checkboxAnimations.showContactInfo ? 'checkbox-pulse' : ''}`}>
                                        {privacySettings.showContactInfo && (
                                            <svg className={`w-3 h-3 text-white ${checkboxAnimations.showContactInfo ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm font-medium transition-colors duration-500 ease-in-out ${
                                        privacySettings.showContactInfo ? 'text-gray-800' : 'text-gray-600'
                                    }`}>Показувати контактну інформацію</span>
                                    <p className={`text-xs mt-1 transition-colors duration-500 ease-in-out ${
                                        privacySettings.showContactInfo ? 'text-gray-600' : 'text-gray-500'
                                    }`}>Дозволити студентам бачити ваш телефон</p>
                                </div>
                            </label>
                        </div>
                        
                        <div className={`rounded-xl p-4 border group/field privacy-field transition-all duration-500 ease-in-out ${
                            privacySettings.emailOnNewReviews 
                                ? 'bg-gradient-to-br from-blue-50/85 via-blue-100/70 to-blue-200/55 border-blue-200/85' 
                                : 'bg-gradient-to-br from-blue-50/60 via-blue-100/45 to-blue-150/35 border-blue-200/60'
                        } ${fieldAnimations.emailOnNewReviews ? 'privacy-field-active-animation' : ''}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={privacySettings.emailOnNewReviews}
                                        onChange={(e) => handlePrivacySettingChange('emailOnNewReviews', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                        privacySettings.emailOnNewReviews 
                                            ? 'bg-blue-600 border-blue-600' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    } ${checkboxAnimations.emailOnNewReviews ? 'checkbox-pulse' : ''}`}>
                                        {privacySettings.emailOnNewReviews && (
                                            <svg className={`w-3 h-3 text-white ${checkboxAnimations.emailOnNewReviews ? 'checkbox-animate' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm font-medium transition-colors duration-500 ease-in-out ${
                                        privacySettings.emailOnNewReviews ? 'text-gray-800' : 'text-gray-600'
                                    }`}>Email сповіщення про нові відгуки</span>
                                    <p className={`text-xs mt-1 transition-colors duration-500 ease-in-out ${
                                        privacySettings.emailOnNewReviews ? 'text-gray-600' : 'text-gray-500'
                                    }`}>Отримувати повідомлення на пошту про нові відгуки</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Завантаження профілю викладача...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Викладач не знайдений</p>
                    <button 
                        onClick={() => navigate('/teachers')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                        Повернутися до списку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white animate-[slideInFromLeft_0.6s_ease-out_both]">
            <div className="max-w-4xl mx-auto px-3 md:px-6 py-6 md:py-10">
                {/* Кнопка назад */}
                <button
                    onClick={() => navigate('/teachers')}
                    className="text-sm underline text-white hover:text-blue-300 transition mb-6 cursor-pointer"
                >
                    ← Назад до списку викладачів
                </button>

                {/* Таби */}
                <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 mb-6 md:mb-8 overflow-hidden">
                    <div className="bg-gray-200 p-1 md:p-2">
                        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 justify-center">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`profile-tab flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex-1 cursor-pointer ${
                                            tab.id === 'profile' ? 'ml-2' : tab.id === 'settings' ? 'mr-2' : ''
                                        } ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        <Icon size={18} className={
                                            activeTab === tab.id && tab.id === 'settings' ? 'profile-icon-once' :
                                            activeTab === tab.id && tab.id === 'reviews' ? 'profile-reviews-icon' :
                                            activeTab === tab.id && tab.id === 'profile' ? 'profile-profile-icon' : ''
                                        } />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Контент табів */}
                <div key={activeTab} className="animate-[slideInFromLeft_0.6s_ease-out_both]">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'reviews' && renderReviewsTab()}
                    {activeTab === 'settings' && renderSettingsTab()}
                </div>
            </div>

            {/* Модальне вікно для зміни імені */}
            <TeacherClaimModal
                isOpen={showClaimModal}
                onClose={handleCloseClaimModal}
                onSuccess={handleClaimSuccess}
            />
            <NameChangeModal
                isOpen={showNameChangeModal}
                onClose={handleCloseNameChangeModal}
                currentName={getCurrentDisplayName()}
            />
        </div>
    );
};

export default TeacherProfilePageNew;
