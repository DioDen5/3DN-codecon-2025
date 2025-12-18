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

export const getMyTeacherProfile = async () => {
    const response = await http.get('/teachers/my-profile');
    return response.data;
};

export const claimTeacher = async (teacherId) => {
    const response = await http.post('/teachers/claim', { teacherId });
    return response.data;
};

export const getMyClaimRequests = async () => {
    const response = await http.get('/teachers/claim/my-requests');
    return response.data;
};

export const setTeacherPassword = async (password) => {
    const response = await http.post('/teachers/set-password', { password });
    return response.data;
};

export const submitTeacherChangeRequest = async (changes) => {
    const response = await http.post('/teachers/me/change-request', changes);
    return response.data;
};
