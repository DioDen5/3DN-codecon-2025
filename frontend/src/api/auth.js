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

export async function login(email, password, rememberMe = false) {
    const { data } = await http.post('/auth/login', { email, password, rememberMe });
    if (data?.token) tokenStore.set(data.token);
    if (data?.user)  setMe(data.user);

    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
    }

    return data;
}

export async function register({ email, password, displayName, firstName, lastName }) {
    const { data } = await http.post('/auth/register', { email, password, displayName, firstName, lastName });
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

export async function getRememberedLogin() {
    try {
        const { data } = await http.get('/auth/remembered-login');
        return data;
    } catch (error) {
        console.error('Error fetching remembered login:', error);
        return { email: null, rememberMe: false };
    }
}

export function getLocalRememberedLogin() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const email = localStorage.getItem('rememberedEmail');
    return { email, rememberMe };
}

export async function forgotPassword(email) {
    const { data } = await http.post('/auth/forgot-password', { email });
    return data;
}

export async function verifyResetToken(token) {
    const { data } = await http.get(`/auth/reset-password/verify?token=${token}`);
    return data;
}

export async function resetPassword(token, password) {
    const { data } = await http.post('/auth/reset-password', { token, password });
    return data;
}

export async function checkEmailForRegistration(email, role) {
    const { data } = await http.post('/auth/register/check-email', { email, role });
    return data;
}

export async function registerTeacher(formData) {
    const { data } = await http.post('/auth/register/teacher', formData);
    if (data?.token) tokenStore.set(data.token);
    if (data?.user)  setMe(data.user);
    return data;
}

export async function sendVerificationCode(email, type = 'login') {
    const { data } = await http.post('/auth/send-verification-code', { email, type });
    return data;
}

export async function verifyCode(email, code, type = 'login') {
    const { data } = await http.post('/auth/verify-code', { email, code, type });
    return data;
}

export async function loginWithCode(email, code) {
    const { data } = await http.post('/auth/login-with-code', { email, code });
    if (data?.token) tokenStore.set(data.token);
    if (data?.user)  setMe(data.user);
    return data;
}
