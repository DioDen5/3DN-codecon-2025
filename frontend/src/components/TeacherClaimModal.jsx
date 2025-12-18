import React, { useState, useEffect } from 'react';
import { X, Search, GraduationCap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { claimTeacher, getMyClaimRequests } from '../api/teachers';
import { getTeachers } from '../api/teachers';
import { useNotification } from '../contexts/NotificationContext';

const TeacherClaimModal = ({ isOpen, onClose, onSuccess }) => {
    const { showSuccess, showError } = useNotification();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [myRequests, setMyRequests] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadTeachers();
            loadMyRequests();
        }
    }, [isOpen]);

    const loadTeachers = async () => {
        setLoading(true);
        try {

            const data = await getTeachers({ limit: 50 });

            const unclaimedTeachers = (data.teachers || []).filter(t => !t.userId);
            setTeachers(unclaimedTeachers);
        } catch (error) {
            console.error('Error loading teachers:', error);
            showError('Помилка завантаження списку викладачів');
        } finally {
            setLoading(false);
        }
    };

    const loadMyRequests = async () => {
        try {
            const data = await getMyClaimRequests();
            setMyRequests(data.requests || []);
        } catch (error) {
            console.error('Error loading my requests:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            setLoading(true);
            try {
                const data = await getTeachers({ q: query, limit: 20 });
                const unclaimedTeachers = (data.teachers || []).filter(t => !t.userId);
                setTeachers(unclaimedTeachers);
            } catch (error) {
                console.error('Error searching teachers:', error);
            } finally {
                setLoading(false);
            }
        } else {
            loadTeachers();
        }
    };

    const handleSelectTeacher = (teacher) => {

        const hasPendingRequest = myRequests.some(
            req => req.teacherId._id === teacher._id && req.status === 'pending'
        );

        if (hasPendingRequest) {
            showError('Ви вже подали заявку на цього викладача');
            return;
        }

        setSelectedTeacher(teacher);
    };

    const handleSubmit = async () => {
        if (!selectedTeacher) return;

        setSubmitting(true);
        try {
            await claimTeacher(selectedTeacher._id);
            showSuccess('Заявку успішно подано! Адміністратор розгляне її найближчим часом.');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error submitting claim:', error);
            showError(error.response?.data?.error || 'Помилка при поданні заявки');
        } finally {
            setSubmitting(false);
        }
    };

    const getRequestStatus = (teacherId) => {
        const request = myRequests.find(req => req.teacherId._id === teacherId);
        if (!request) return null;

        return {
            status: request.status,
            createdAt: request.createdAt
        };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-[slideInFromLeft_0.3s_ease-out]">
                
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Подати заявку на профіль</h2>
                            <p className="text-sm text-gray-600">Оберіть ваш профіль викладача</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Пошук викладача за ім'ям, університетом, кафедрою..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">Завантаження...</p>
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">
                                {searchQuery ? 'Викладачів не знайдено' : 'Немає доступних профілів для заявки'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {teachers.map((teacher) => {
                                const requestStatus = getRequestStatus(teacher._id);

                                return (
                                    <div
                                        key={teacher._id}
                                        onClick={() => !requestStatus && handleSelectTeacher(teacher)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            selectedTeacher?._id === teacher._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : requestStatus
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                                                    {requestStatus && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                                            requestStatus.status === 'approved'
                                                                ? 'bg-green-100 text-green-700'
                                                                : requestStatus.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {requestStatus.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                            {requestStatus.status === 'pending' && <Clock className="w-3 h-3" />}
                                                            {requestStatus.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                                                            {requestStatus.status === 'approved' && 'Схвалено'}
                                                            {requestStatus.status === 'pending' && 'На розгляді'}
                                                            {requestStatus.status === 'rejected' && 'Відхилено'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{teacher.university}</p>
                                                <p className="text-sm text-gray-600">{teacher.department}</p>
                                                {teacher.subject && (
                                                    <p className="text-sm text-gray-500 mt-1">Предмет: {teacher.subject}</p>
                                                )}
                                            </div>
                                            {!requestStatus && selectedTeacher?._id === teacher._id && (
                                                <div className="ml-4">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        {selectedTeacher ? `Обрано: ${selectedTeacher.name}` : 'Оберіть викладача зі списку'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            Скасувати
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedTeacher || submitting}
                            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Відправка...' : 'Подати заявку'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherClaimModal;

