import { http } from './httpClient';

export async function toggleAnnouncement(announcementId, value) {
    const { data } = await http.post('/reactions/toggle', {
        targetType: 'announcement',
        targetId: announcementId,
        value, 
    });
    return data?.counts || { likes: 0, dislikes: 0, score: 0 };
}

export async function countsAnnouncement(announcementId) {
    const { data } = await http.get(`/reactions/announcement/${announcementId}/counts`);
    return data;
}

export async function toggleComment(commentId, value) {
    const { data } = await http.post('/reactions/toggle', {
        targetType: 'comment',
        targetId: commentId,
        value,
    });
    return data?.counts || { likes: 0, dislikes: 0, score: 0 };
}

export async function countsComment(commentId) {
    const { data } = await http.get(`/reactions/comment/${commentId}/counts`);
    return data;
}
