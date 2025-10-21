import { http } from './httpClient';

export async function getTeacherComments(teacherId, page = 1, limit = 50) {
    try {
        const { data } = await http.get(`/teacher-comments/${teacherId}?page=${page}&limit=${limit}`);
        return data;
    } catch (err) {
        console.error('Error fetching teacher comments:', err);
        throw err;
    }
}

export async function createTeacherComment(teacherId, body, rating) {
    try {
        const { data } = await http.post(`/teacher-comments/${teacherId}`, { body, rating });
        return data;
    } catch (err) {
        console.error('Error creating teacher comment:', err);
        throw err;
    }
}

export async function getTeacherCommentCounts(commentId) {
    try {
        const { data } = await http.get(`/teacher-comments/${commentId}/counts`);
        return data;
    } catch (err) {
        console.error('Error fetching teacher comment counts:', err);
        throw err;
    }
}

export async function toggleTeacherComment(commentId, value) {
    try {
        const { data } = await http.post(`/teacher-comments/${commentId}/toggle`, { value });
        return data;
    } catch (err) {
        console.error('Error toggling teacher comment reaction:', err);
        throw err;
    }
}

export async function deleteTeacherComment(commentId) {
    try {
        const { data } = await http.delete(`/teacher-comments/${commentId}`);
        return data;
    } catch (err) {
        console.error('Error deleting teacher comment:', err);
        throw err;
    }
}

export async function updateTeacherComment(commentId, body, rating) {
    try {
        const { data } = await http.patch(`/teacher-comments/${commentId}`, { body, rating });
        return data;
    } catch (err) {
        console.error('Error updating teacher comment:', err);
        throw err;
    }
}
