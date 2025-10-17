import * as Ann from './announcements';
import * as Com from './comments';
import * as Rx from './reactions';

// Безпечне форматування дати
function asDateString(d) {
    try {
        if (!d) return '';
        const s = typeof d === 'string' ? d : d?.toString?.();
        const dt = new Date(s);
        return isNaN(dt.getTime()) ? '' : dt.toISOString();
    } catch {
        return '';
    }
}

function mapPost(a = {}, counts = {}) {
    const likes = Number(counts?.likes ?? 0) || 0;
    const dislikes = Number(counts?.dislikes ?? 0) || 0;

    return {
        id: a._id || a.id || '',
        title: a.title || '',
        content: a.body || a.content || '',
        image_url: a.image_url || null,
        rating_positive: likes < 0 ? 0 : likes,
        rating_negative: dislikes < 0 ? 0 : dislikes,
        comment_count: Number(a?.metrics?.comments ?? 0) || 0,
        user: {
            first_name: a.authorFirstName || a.user?.first_name || 'User',
            last_name:  a.authorLastName  || a.user?.last_name  || '',
        },
        created_at: asDateString(a.createdAt || a.publishedAt || a.created_at || Date.now()),
        voted: null,
    };
}

function mapReply(c = {}, counts = {}) {
    const likes = Number(counts?.likes ?? 0) || 0;
    const dislikes = Number(counts?.dislikes ?? 0) || 0;

    return {
        id: c._id || c.id || '',
        user: {
            first_name: c.authorFirstName || c.user?.first_name || 'User',
            last_name:  c.authorLastName  || c.user?.last_name  || '',
        },
        message: c.body || c.message || '',
        rating_positive: likes < 0 ? 0 : likes,
        rating_negative: dislikes < 0 ? 0 : dislikes,
        created_at: asDateString(c.createdAt || c.created_at || Date.now()),
    };
}

// ----- posts -----
export async function articleList() {
    const items = await Ann.listPublished();
    const mapped = await Promise.all(items.map(async a => {
        const cnt = await Rx.countsAnnouncement(a._id).catch(()=>null);
        return mapPost(a, cnt);
    }));
    return mapped;
}

export async function articleDetail(id) {
    const a = await Ann.getById(id);
    if (!a) return null;
    const cnt = await Rx.countsAnnouncement(a._id).catch(()=>null);
    return mapPost(a, cnt);
}

export async function voteArticle(id, type) {
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

export async function voteComment(commentId, action) {
    const value = action === 'upvote' ? 1 : -1;
    const res = await Rx.toggleComment(commentId, value);
    return res;
}

// ----- create (published) -----
export async function articleCreate(title, content, imageFile) {
    const doc = await Ann.createPublished({ title, body: content, tags: [] });
    return { id: doc._id };
}
