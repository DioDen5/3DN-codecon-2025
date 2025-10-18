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
