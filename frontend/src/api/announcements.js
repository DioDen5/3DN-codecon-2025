import { http } from './httpClient';

export async function listPublished(params = {}) {
    const { data } = await http.get('/announcements', { params: { status: 'published', ...params } });
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

export async function createPublished({ title, body, tags = [] }) {
    const payload = { title, body, status: 'published', visibility: 'students', tags };
    const { data } = await http.post('/announcements', payload);
    return data;
}

export async function remove(id) {
    const { data } = await http.delete(`/announcements/${id}`);
    return data;
}
