import { http } from './httpClient';
import { tokenStore } from './tokenStore';

const USER_KEY = 'me';

export function getMe() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
}

function setMe(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user || null)); } catch {}
    window.dispatchEvent(new Event('studlink:auth-changed'));
}

export async function login(email, password) {
    const { data } = await http.post('/auth/login', { email, password });
    if (data?.token) tokenStore.set(data.token);
    if (data?.user)  setMe(data.user);
    return data;
}

export async function register({ email, password, displayName }) {
    const { data } = await http.post('/auth/register', { email, password, displayName });
    if (data?.token) tokenStore.set(data.token);
    if (data?.user)  setMe(data.user);
    return data;
}

export async function refresh() {
    const { data } = await http.post('/auth/refresh');
    if (data?.token) tokenStore.set(data.token);
    return data;
}

export async function logout() {
    await http.post('/auth/logout', null, { _skipAuthHandler: true }).catch(()=>{});
    tokenStore.clear();
    setMe(null);
}
