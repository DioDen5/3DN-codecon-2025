// src/api/article_comment.js
// Адаптер під старий фронт API, працює поверх нових модулів і бекенду.

import * as Ann from './announcements';
import * as Com from './comments';
import * as Rx from './reactions';

// ----- helpers -----
function mapPost(a, counts) {
    return {
        id: a._id,
        title: a.title,
        content: a.body,
        image_url: a.image_url || null,
        rating_positive: counts?.likes ?? 0,
        rating_negative: counts?.dislikes ?? 0,
        comment_count: a.metrics?.comments ?? 0,
        user: {
            first_name: a.authorFirstName || 'User',
            last_name:  a.authorLastName  || '',
        },
        created_at: a.createdAt || a.publishedAt,
        voted: null,
    };
}

function mapReply(c, counts) {
    return {
        id: c._id,
        user: { first_name: c.authorFirstName || 'User', last_name: c.authorLastName || '' },
        message: c.body,
        rating_positive: counts?.likes ?? 0,
        rating_negative: counts?.dislikes ?? 0,
        created_at: c.createdAt,
    };
}

// ----- posts -----
export async function articleList() {
    const items = await Ann.listPublished();
    const mapped = await Promise.all(items.map(async a => {
        try {
            const cnt = await Rx.countsAnnouncement(a._id);
            return mapPost(a, cnt);
        } catch {
            return mapPost(a, { likes: 0, dislikes: 0, score: 0 });
        }
    }));
    return mapped;
}

export async function articleDetail(id) {
    const a = await Ann.getById(id);
    if (!a) return null;
    const cnt = await Rx.countsAnnouncement(a._id).catch(()=>null);
    return mapPost(a, cnt);
}

export async function voteArticle(id, type /* 'like'|'dislike' */) {
    const value = type === 'like' ? 1 : -1;
    const res = await Rx.toggleAnnouncement(id, value);
    return res;
}

// ----- comments -----
export async function commentsList(postId) {
    const items = await Com.list(postId, { limit: 100 });
    const mapped = await Promise.all(items.map(async c => {
        const cnt = await Rx.countsComment(c._id).catch(()=>null);
        return mapReply(c, cnt);
    }));
    return mapped;
}

export async function createComment(postId, message) {
    const c = await Com.create(postId, message);
    const cnt = await Rx.countsComment(c._id).catch(()=>null);
    return mapReply(c, cnt);
}

export async function voteComment(commentId, action /* 'upvote'|'downvote' */) {
    const value = action === 'upvote' ? 1 : -1;
    const res = await Rx.toggleComment(commentId, value);
    return res;
}

// ----- create (draft) -----
export async function articleCreate(title, content, imageFile) {
    // TODO: image upload буде в M3/M4 (окремий ендпоїнт/форм-дані).
    // Зараз — створюємо чернетку з текстом.
    const doc = await Ann.createDraft({ title, body: content, tags: [] });
    // Повернемо мінімум, щоб форма показала success
    return { id: doc._id };
}
