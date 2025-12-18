import { http } from './httpClient';

export async function list(announcementId, { limit = 1000, before } = {}) {
    const params = { limit };
    if (before) params.before = before;
    const { data } = await http.get(`/announcements/${announcementId}/comments`, { params });
    return Array.isArray(data) ? data : (data.items || []);
}

export async function create(announcementId, body) {
    const { data } = await http.post(`/announcements/${announcementId}/comments`, { body });
    return data;
}

export async function update(commentId, body) {
    const { data } = await http.patch(`/comments/${commentId}`, { body });
    return data;
}

export async function moderate(commentId, action) {
    const { data } = await http.patch(`/comments/${commentId}/moderate`, { action });
    return data;
}

export async function remove(commentId) {
    const { data } = await http.delete(`/comments/${commentId}`);
    return data;
}
