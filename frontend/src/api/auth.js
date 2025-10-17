import { http } from './httpClient';
import { tokenStore } from './tokenStore';

export async function login(email, password) {
    const { data } = await http.post('/auth/login', { email, password });
    if (data?.token) tokenStore.set(data.token);
    return data?.user || null;
}

export async function register(a, b, c, d, e) {
    let payload;
    if (typeof a === 'object') {
        const { firstName, lastName, email, password, passwordConfirm } = a || {};
        payload = { firstName, lastName, email, password, passwordConfirm, displayName: `${firstName || ''} ${lastName || ''}`.trim() };
    } else {
        const firstName = a, lastName = b, email = c, password = d, passwordConfirm = e;
        payload = { firstName, lastName, email, password, passwordConfirm, displayName: `${firstName || ''} ${lastName || ''}`.trim() };
    }
    const { data } = await http.post('/auth/register', payload);
    if (data?.token) tokenStore.set(data.token);
    return data?.user || null;
}

export async function me() {
    const { data } = await http.get('/auth/me');
    return data || null;
}

export function getToken() {
    return tokenStore.get();
}

export function logout() {
    tokenStore.clear();
}
