import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, Settings, Mail, Calendar, Award, MessageCircle, MessageSquare, ThumbsUp, Star, GraduationCap, BookOpen, Building2, Shield, Lock, Key, Power, ToggleRight, Play, Smartphone, ShieldCheck, Eye, EyeOff, Edit3, Clock, CheckCircle, AlertCircle, FileQuestion, Sparkles, Wind, Inbox, MessageSquarePlus, Zap, X } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import facultiesData from '../data/faculties.json';
import subjectsData from '../data/subjects.json';
import academicPositionsData from '../data/academicPositions.json';
import { useAuthState } from '../api/useAuthState';
import { getNameChangeStatus } from '../api/name-change';
import { getMyTeacherProfile, getTeacher, submitTeacherChangeRequest } from '../api/teachers';
import { getTeacherComments } from '../api/teacher-comments';
import { useNotification } from '../contexts/NotificationContext';
import StarRating from '../components/StarRating';
import NameChangeModal from '../components/NameChangeModal';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import TeacherClaimModal from '../components/TeacherClaimModal';
import { getTeacherSpecialization } from '../utils/getSpecialization';

const TeacherProfilePageNew = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthState();
    const { showSuccess, showError } = useNotification();

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
    const [dismissedStatusBanner, setDismissedStatusBanner] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        position: '',
        phone: '',
        university: '',
        faculty: '',
        department: '',
        subjects: [],
        bio: '',
        image: ''
    });
    const [editErrors, setEditErrors] = useState({});
    const [submittingChanges, setSubmittingChanges] = useState(false);
    const [changeSubmittedBanner, setChangeSubmittedBanner] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);

    const bannerStorageKey = myTeacherProfile?._id
        ? `teacherStatusBannerDismissed:${myTeacherProfile._id}:${myTeacherProfile.status || 'unknown'}`
        : null;

    useEffect(() => {
        if (bannerStorageKey) {
            const stored = localStorage.getItem(bannerStorageKey);
            setDismissedStatusBanner(stored === '1');
        } else {
            setDismissedStatusBanner(false);
        }
    }, [bannerStorageKey]);

    useEffect(() => {
        if (teacher) {
            const nameParts = (teacher.name || '').split(/\s+/);
            const [fn = '', mn = '', ln = ''] = [nameParts[0] || '', nameParts.length === 3 ? nameParts[1] : '', nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''];
            const draftKey = teacher?._id ? `teacherEditDraft:${teacher._id}` : null;
            let draft = null;
            if (draftKey) {
                try { draft = JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch {}
            }
            const base = {
                firstName: fn,
                lastName: ln,
                middleName: mn,
                position: teacher.position || '',
                phone: teacher.phone || '',
                university: teacher.university || '',
                faculty: teacher.faculty || '',
                department: teacher.department || '',
                subjects: Array.isArray(teacher.subjects) ? teacher.subjects : (teacher.subject ? [teacher.subject] : []),
                bio: teacher.bio || '',
                image: teacher.image || ''
            };

            let merged = base;
            if (draft && typeof draft === 'object') {
                merged = { ...base };
                for (const [k, v] of Object.entries(draft)) {
                    if (k === 'subjects') {
                        if (Array.isArray(v) && v.length > 0 && JSON.stringify(v) !== JSON.stringify(base.subjects)) {
                            merged.subjects = v;
                        }
                    } else if (typeof v === 'string') {
                        if (v.trim() && v !== base[k]) merged[k] = v;
                    }
                }
            }
            setEditForm(merged);
            setEditErrors({});
        }
    }, [teacher]);

    useEffect(() => {
        const draftKey = teacher?._id ? `teacherEditDraft:${teacher._id}` : null;
        if (!draftKey) return;
        try { localStorage.setItem(draftKey, JSON.stringify(editForm)); } catch {}
    }, [editForm, teacher?._id]);

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const validateEdit = () => {
        const errs = {};
        const original = teacher || {};
        const origSubjects = Array.isArray(original.subjects) ? original.subjects : (original.subject ? [original.subject] : []);

        if ((editForm.university || '') !== (original.university || '')) {
            if (!editForm.university.trim()) errs.university = 'Університет обов\'язковий';
        }
        if ((editForm.faculty || '') !== (original.faculty || '')) {
            if (!editForm.faculty.trim()) errs.faculty = 'Факультет обов\'язковий';
        }
        if ((editForm.department || '') !== (original.department || '')) {

        }
        if (JSON.stringify(editForm.subjects) !== JSON.stringify(origSubjects)) {
            if (!Array.isArray(editForm.subjects) || editForm.subjects.filter(s => s.trim()).length === 0) {
                errs.subjects = 'Додайте щонайменше один предмет';
            }
        }
        if ((editForm.bio || '') !== (original.bio || '')) {
            if (!editForm.bio || editForm.bio.trim().length < 10) errs.bio = 'Біо має містити від 10 символів';
        }
        setEditErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const computeDiff = () => {
        const diff = {};
        const original = teacher || {};
        if ((editForm.position || '') !== (original.position || '')) diff.position = editForm.position || null;
        if ((editForm.phone || '') !== (original.phone || '')) diff.phone = editForm.phone || null;
        if ((editForm.university || '') !== (original.university || '')) diff.university = editForm.university;
        if ((editForm.faculty || '') !== (original.faculty || '')) diff.faculty = editForm.faculty;
        if ((editForm.department || '') !== (original.department || '')) diff.department = editForm.department || null;
        const origSubjects = Array.isArray(original.subjects) ? original.subjects : (original.subject ? [original.subject] : []);
        if (JSON.stringify(origSubjects) !== JSON.stringify(editForm.subjects)) diff.subjects = editForm.subjects;
        if ((editForm.bio || '') !== (original.bio || '')) diff.bio = editForm.bio;
        if ((editForm.image || '') !== (original.image || '')) diff.image = editForm.image;
        return diff;
    };

    const handleSubmitChanges = async () => {
        if (!validateEdit()) return;
        const diff = computeDiff();
        if (Object.keys(diff).length === 0) {
            showSuccess?.('Немає змін для надсилання');
            return;
        }
        setSubmittingChanges(true);
        try {
            await submitTeacherChangeRequest(diff);
            showSuccess?.('Зміни надіслано на розгляд');
            if (myTeacherProfile?._id) {
                try { localStorage.setItem(`teacherChangeSubmitted:${myTeacherProfile._id}`, '1'); } catch {}
            }
            setChangeSubmittedBanner(true);
            setEditMode(false);
        } catch (e) {
            console.error(e);
            showError?.(e?.response?.data?.error || 'Не вдалося надіслати зміни');
        } finally {
            setSubmittingChanges(false);
        }
    };

    useEffect(() => {
        if (myTeacherProfile?._id) {
            try {
                setChangeSubmittedBanner(localStorage.getItem(`teacherChangeSubmitted:${myTeacherProfile._id}`) === '1');
            } catch {}
        }
    }, [myTeacherProfile?._id]);

    const universityOptions = Array.from(new Set((facultiesData || []).map(u => u.universityName)))
        .map(name => ({ name }));
    const facultyOptions = (() => {
        const u = (facultiesData || []).find(x => x.universityName === editForm.university);
        return u ? u.faculties.map(f => ({ name: f.name })) : [];
    })();
    const departmentOptions = (() => {
        const u = (facultiesData || []).find(x => x.universityName === editForm.university);
        const f = u?.faculties?.find(ff => ff.name === editForm.faculty);
        return f ? (f.departments || []).map(d => ({ name: d })) : [];
    })();

    const facultySubjects = (() => {
        const s = (subjectsData || []).find(x => x.facultyName === editForm.faculty);
        return s ? s.subjects.map(name => ({ name })) : [];
    })();

    const positionOptions = (academicPositionsData || []).map(p => ({ name: p.name }));

    const handleSubjectChange = (index, value) => {
        setEditForm(prev => {
            const list = [...prev.subjects];
            list[index] = value;
            return { ...prev, subjects: list };
        });
    };
    const addSubject = () => setEditForm(prev => ({ ...prev, subjects: [...(prev.subjects||[]), ''] }));
    const removeSubject = (idx) => setEditForm(prev => ({ ...prev, subjects: prev.subjects.filter((_,i)=>i!==idx) }));

    const loadReviews = async (teacherId) => {
        if (!teacherId) {
            setReviews([]);
            setReviewsLoading(false);
            return;
        }

        setReviewsLoading(true);
        try {
            const commentsData = await getTeacherComments(teacherId);
            const comments = commentsData.comments || [];

            const formattedReviews = comments.map((comment) => {

                const rating = comment.rating || 0;
                const ratingOutOf10 = rating > 0 ? (rating / 5) * 10 : 0;

                let authorName = 'Анонімний користувач';
                if (comment.authorId) {
                    if (typeof comment.authorId === 'object') {
                        authorName = comment.authorId.displayName || comment.authorId.name || authorName;
                    } else {
                        authorName = comment.authorName || authorName;
                    }
                }

                return {
                    id: comment._id || comment.id,
                    author: authorName,
                    comment: comment.body || comment.text || '',
                    rating: ratingOutOf10,
                    date: comment.createdAt || comment.date || new Date().toISOString()
                };
            });

            setReviews(formattedReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== user?.id) {

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

    }, [id, user]);

    useEffect(() => {
        if (user && user.role === 'teacher') {
            loadNameChangeStatus();
            loadUserProfile();
            loadMyTeacherProfile();
        }
    }, [user]);

    useEffect(() => {
        if (teacher && teacher._id) {

            const teacherId = (id && id !== user?.id) ? id : teacher._id;
            loadReviews(teacherId);
        }
    }, [teacher?._id, id, user?.id]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        localStorage.setItem('teacherProfileActiveTab', tabId);
    };

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

        loadNameChangeStatus();
    };

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

    const loadMyTeacherProfile = async () => {
        if (!user || user.role !== 'teacher') {

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

                setTeacher(data.teacher);

                console.log('Teacher position from API:', data.teacher.position);

                setStats({
                    reviews: data.teacher.comments || 0,
                    averageRating: data.teacher.rating || 0,
                    totalLikes: data.teacher.likes || 0,
                    totalDislikes: data.teacher.dislikes || 0
                });

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

        if (value) {
            setFieldAnimations(prev => ({
                ...prev,
                [setting]: true
            }));

            setTimeout(() => {
                setFieldAnimations(prev => ({
                    ...prev,
                    [setting]: false
                }));
            }, 600);
        }

        setCheckboxAnimations(prev => ({
            ...prev,
            [setting]: true
        }));

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
            {user?.role === 'teacher' && myTeacherProfile && !dismissedStatusBanner && (myTeacherProfile.status === 'pending' || myTeacherProfile.status === 'rejected') && (
                <div className={`relative rounded-2xl p-4 border shadow-sm flex items-start gap-3 ${myTeacherProfile.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-yellow-50 border-yellow-200 text-gray-900'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${myTeacherProfile.status === 'rejected' ? 'bg-red-200/40' : 'bg-yellow-400/30'}`}>
                        {myTeacherProfile.status === 'rejected' ? (
                            <AlertCircle className="w-4 h-4 text-red-700" />
                        ) : (
                            <Clock className="w-4 h-4 text-yellow-700" />
                        )}
                    </div>
                    <div className="pr-8">
                        <p className="font-semibold">{myTeacherProfile.status === 'rejected' ? 'Профіль відхилено' : 'Ваш профіль на перевірці'}</p>
                        <p className="text-sm ${myTeacherProfile.status === 'rejected' ? 'text-red-800' : 'text-gray-700'}">
                            {myTeacherProfile.status === 'rejected'
                                ? (myTeacherProfile.rejectionReason ? `Причина: ${myTeacherProfile.rejectionReason}` : 'Ваш профіль було відхилено модератором.')
                                : 'Після модерації адміністратором статус зміниться на «Верифіковано», і профіль буде опубліковано.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setDismissedStatusBanner(true);
                            if (bannerStorageKey) localStorage.setItem(bannerStorageKey, '1');
                        }}
                        className={`group absolute top-2 right-2 p-1.5 rounded-full border transition-all duration-300 ease-out ${myTeacherProfile.status === 'rejected' ? 'border-red-300 hover:bg-red-100' : 'border-yellow-300 hover:bg-yellow-100'}`}
                        aria-label="Закрити"
                        title="Закрити повідомлення"
                    >
                        <X className={`${myTeacherProfile.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'} w-4 h-4 transition-transform duration-300 group-hover:rotate-90`} />
                    </button>
                </div>
            )}
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-card">
                {teacher?.status && (
                    (() => {
                        const st = (teacher.status || '').toLowerCase();
                        const isVerified = st === 'verified';
                        const isPending = st === 'pending';
                        const isRejected = st === 'rejected';
                        const cls = isVerified
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : isPending
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200';
                        const label = isVerified ? 'Верифіковано' : isPending ? 'На перевірці' : 'Відхилено';
                        return (
                            <span className={`absolute top-4 right-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${cls}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse"></span>
                                {label}
                            </span>
                        );
                    })()
                )}
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{teacher?.name}</h1>
                            </div>
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

            {reviews.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 rounded-2xl p-12 shadow-2xl border-2 border-blue-200 animate-[slideInFromLeft_0.6s_ease-out_both] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full -translate-y-32 translate-x-32 animate-pulse blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full translate-y-24 -translate-x-24 animate-pulse blur-xl"></div>

                    <div className="text-center py-8 relative z-10">
                        <div className="relative mb-10 mx-auto w-40 h-40 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-2xl animate-pulse"></div>

                            <div className="relative bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-2xl border-4 border-blue-200 transform transition-all duration-500 hover:scale-110">
                                <Inbox className="w-16 h-16 text-blue-500 relative z-10" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <MessageSquarePlus className="w-4 h-4 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                    <Zap className="w-3 h-3 text-white" />
                                </div>
                            </div>

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
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group profile-settings-card">
                {changeSubmittedBanner && (
                    <div className="mb-4 p-3 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 flex items-center justify-between">
                        <span className="font-semibold">Зміни успішно надіслані на модерацію</span>
                          <button onClick={() => { setChangeSubmittedBanner(false); if (myTeacherProfile?._id) { try { localStorage.removeItem(`teacherChangeSubmitted:${myTeacherProfile._id}`); } catch {} } }} className="px-2 py-1 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer">Закрити</button>
                    </div>
                )}
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

                    {user?.role === 'teacher' && !myTeacherProfile && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-[slideInFromLeft_0.6s_ease-out_both]">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                <h4 className="font-semibold text-gray-900">
                                    Профіль викладача не прив'язано
                                </h4>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Щоб мати доступ до редагування свого профілю викладача, подайте заявку на отримання профілю.
                            </p>
                            <button
                                onClick={handleOpenClaimModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                            >
                                Подати заявку на профіль
                            </button>
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

            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16 animate-pulse decorative-element-1"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                            <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        Редагування профілю
                    </h3>
                    {!editMode ? (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">Оновіть свої академічні дані, предмети, фото та біографію. Зміни підуть на модерацію.</p>
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 cursor-pointer">Редагувати профіль</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Особисті дані</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Посада</label>
                                        <AutocompleteInput
                                            value={editForm.position}
                                            onChange={(v)=>handleEditChange('position', v)}
                                            options={positionOptions}
                                            placeholder="Оберіть або введіть посаду"
                                        />
                                        {teacher?.position && teacher.position !== editForm.position && (
                                            <div className="text-xs text-gray-500 mt-1">Зараз: {teacher.position}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Телефон</label>
                                        <input
                                            value={editForm.phone}
                                            onChange={e=>handleEditChange('phone', e.target.value)}
                                            onFocus={()=>setPhoneFocused(true)}
                                            onBlur={()=>setPhoneFocused(false)}
                                            className={`w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 border transition-all duration-300 focus:outline-none ${
                                                (phoneFocused || (editForm.phone && editForm.phone.trim().length > 0))
                                                    ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="+380..."
                                        />
                                        {teacher && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Зараз: {teacher.phone ? teacher.phone : 'не вказано'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                                <h4 className="font-semibold text-gray-900 mb-3">Академія</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Університет</label>
                                        <AutocompleteInput
                                            value={editForm.university}
                                            onChange={(v)=>{ handleEditChange('university', v); handleEditChange('faculty',''); handleEditChange('department',''); }}
                                            options={universityOptions}
                                            placeholder="Оберіть або введіть університет"
                                            error={!!editErrors.university}
                                        />
                                        {teacher?.university && teacher.university !== editForm.university && (
                                            <div className="text-xs text-gray-500 mt-1">Зараз: {teacher.university}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Факультет</label>
                                        <AutocompleteInput
                                            value={editForm.faculty}
                                            onChange={(v)=>{ handleEditChange('faculty', v); handleEditChange('department',''); }}
                                            options={facultyOptions}
                                            placeholder={editForm.university ? 'Оберіть факультет' : 'Спочатку оберіть університет'}
                                            disabled={!editForm.university}
                                            error={!!editErrors.faculty}
                                        />
                                        {teacher?.faculty && teacher.faculty !== editForm.faculty && (
                                            <div className="text-xs text-gray-500 mt-1">Зараз: {teacher.faculty}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Кафедра</label>
                                        <AutocompleteInput
                                            value={editForm.department}
                                            onChange={(v)=>handleEditChange('department', v)}
                                            options={departmentOptions}
                                            placeholder={editForm.faculty ? 'Оберіть кафедру' : 'Спочатку оберіть факультет'}
                                            disabled={!editForm.faculty}
                                        />
                                        {teacher?.department && teacher.department !== editForm.department && (
                                            <div className="text-xs text-gray-500 mt-1">Зараз: {teacher.department}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                                <h4 className="font-semibold text-gray-900 mb-3">Предмети</h4>
                                <div className="space-y-2">
                                    {(editForm.subjects || []).map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <AutocompleteInput
                                                    value={s}
                                                    onChange={(v)=>handleSubjectChange(idx, v)}
                                                    options={facultySubjects}
                                                    placeholder={editForm.faculty ? 'Оберіть предмет' : 'Спочатку оберіть факультет'}
                                                    disabled={!editForm.faculty}
                                                />
                                            </div>
                                            <button onClick={()=>removeSubject(idx)} className="px-2 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">Видалити</button>
                                        </div>
                                    ))}
                                    <button onClick={addSubject} className="mt-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer">Додати предмет</button>
                                </div>
                                {editErrors.subjects && <p className="text-sm text-red-500 mt-2">{editErrors.subjects}</p>}
                                {teacher?.subjects && JSON.stringify(teacher.subjects) !== JSON.stringify(editForm.subjects) && (
                                    <div className="text-xs text-gray-500 mt-2">Зараз: {teacher.subjects.join(', ')}</div>
                                )}
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 relative overflow-hidden">
                                <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/30" />
                                <h4 className="font-semibold text-gray-900 mb-3">Фото та Біографія</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Фото профілю</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
                                                {(editForm.image || teacher?.image) ? (
                                                    <img src={editForm.image || teacher?.image} alt="preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">{(teacher?.name||'U').charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors">
                                                    <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onloadend=()=>handleEditChange('image', r.result); r.readAsDataURL(f); }} className="hidden" />
                                                    Обрати фото
                                                </label>
                                                {(editForm.image || teacher?.image) && (
                                                    <p className="text-xs text-gray-500 mt-1">Зараз відображається попередній перегляд фото</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Біографія</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={e=>handleEditChange('bio', e.target.value)}
                                            rows={6}
                                            maxLength={500}
                                            className={`w-full px-3 py-2 rounded-lg border ${editErrors.bio?'border-red-400':'border-gray-300'} focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40`}
                                            placeholder={editForm.bio?.trim() ? '' : 'Коротка інформація про себе...'}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">{editForm.bio.length}/500</div>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-2 z-10">
                                <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-3 flex items-center justify-end gap-3 shadow-lg">
                                    <button onClick={()=>setEditMode(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Скасувати</button>
                                    <button disabled={submittingChanges} onClick={handleSubmitChanges} className={`px-4 py-2 rounded-lg text-white cursor-pointer transition-colors ${submittingChanges? 'bg-blue-400':'bg-blue-600 hover:bg-blue-700'}`}>Надіслати на розгляд</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group privacy-card">
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
                <button
                    onClick={() => navigate('/teachers')}
                    className="text-sm underline text-white hover:text-blue-300 transition mb-6 cursor-pointer"
                >
                    ← Назад до списку викладачів
                </button>

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

                <div key={activeTab} className="animate-[slideInFromLeft_0.6s_ease-out_both]">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'reviews' && renderReviewsTab()}
                    {activeTab === 'settings' && renderSettingsTab()}
                </div>
            </div>

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
