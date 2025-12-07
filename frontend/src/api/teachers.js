import { http } from './httpClient.js';

export const getTeachers = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await http.get(`/teachers${queryString ? `?${queryString}` : ''}`);
    return response.data;
};

export const getTeacher = async (id) => {
    const response = await http.get(`/teachers/${id}`);
    return response.data;
};

export const voteTeacher = async (id, type) => {
    const response = await http.post(`/teachers/${id}/vote`, { type });
    return response.data;
};

export const getTeacherReactions = async (id) => {
    const response = await http.get(`/teachers/${id}/reactions`);
    return response.data;
};

// Отримати свій Teacher профіль (якщо є)
export const getMyTeacherProfile = async () => {
    const response = await http.get('/teachers/my-profile');
    return response.data;
};

// Створити заявку на отримання Teacher профілю
export const claimTeacher = async (teacherId) => {
    const response = await http.post('/teachers/claim', { teacherId });
    return response.data;
};

// Отримати список моїх заявок
export const getMyClaimRequests = async () => {
    const response = await http.get('/teachers/claim/my-requests');
    return response.data;
};

// Встановити пароль для викладача
export const setTeacherPassword = async (password) => {
    const response = await http.post('/teachers/set-password', { password });
    return response.data;
};

// Надіслати запит на зміну профілю викладача (модерація змін)
export const submitTeacherChangeRequest = async (changes) => {
    const response = await http.post('/teachers/me/change-request', changes);
    return response.data;
};
