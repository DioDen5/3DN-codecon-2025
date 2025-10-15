import { http } from './httpClient';
import { tokenStore } from './tokenStore';

export async function login(email, password) {
    const { data } = await http.post('/auth/login', { email, password });
    if (data?.token) tokenStore.set(data.token);
    return data?.user || null;
}

export function getToken() {
    return tokenStore.get();
}

export function logout() {
    tokenStore.clear();
}
