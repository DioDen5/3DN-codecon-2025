import { http } from './httpClient';

export async function listPublished() {
    const { data } = await http.get('/announcements', { params: { status: 'published' } });
    return Array.isArray(data) ? data : (data.items || []);
}

export async function getByIdFallback(id) {
    const items = await listPublished();
    return items.find(x => x._id === id) || null;
}

export async function getById(id) {
    try {
        const { data } = await http.get(`/announcements/${id}`);
        return data;
    } catch {
        return getByIdFallback(id);
    }
}

export async function createDraft({ title, body, tags = [] }) {
    const payload = { title, body, status: 'draft', tags };
    const { data } = await http.post('/announcements', payload);
    return data;
}
