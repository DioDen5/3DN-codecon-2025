import { http } from './httpClient';

export async function toggleReaction(targetType, targetId, value) {
    try {
        const { data } = await http.post('/reactions/toggle', {
            targetType,
            targetId,
            value, // 1 | -1
        });
        return data?.counts || { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    } catch (err) {
        console.error('toggleReaction error:', err);
        return { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    }
}

export async function getAnnouncementCounts(announcementId) {
    try {
        const { data } = await http.get(`/reactions/announcement/${announcementId}/counts?t=${Date.now()}`);
        return data || { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    } catch (err) {
        console.error('getAnnouncementCounts error:', err);
        return { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    }
}

export async function getCommentCounts(commentId) {
    try {
        const { data } = await http.get(`/reactions/comment/${commentId}/counts?t=${Date.now()}`);
        return data || { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    } catch (err) {
        console.error('getCommentCounts error:', err);
        return { likes: 0, dislikes: 0, score: 0, userReaction: 0 };
    }
}

export async function toggleAnnouncement(announcementId, value) {
    return toggleReaction('announcement', announcementId, value);
}

export async function countsAnnouncement(announcementId) {
    return getAnnouncementCounts(announcementId);
}

export async function toggleComment(commentId, value) {
    return toggleReaction('comment', commentId, value);
}

export async function countsComment(commentId) {
    return getCommentCounts(commentId);
}
