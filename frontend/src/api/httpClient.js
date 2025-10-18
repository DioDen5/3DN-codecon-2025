import axios from 'axios';
import { tokenStore } from './tokenStore';

const baseURL = '/api';

export const http = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 10000,
});

export const refreshHttp = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 10000,
});

http.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let queue = [];

http.interceptors.response.use(
    (r) => r,
    async (err) => {
        const { config, response } = err || {};
        if (!response) throw err;

        const url = new URL(config.url, window.location.origin);
        const isAuthPath = url.pathname.startsWith('/api/auth/');
        if (isAuthPath || response.status !== 401 || config._retry || config._skipAuthHandler) {
            throw err;
        }

        if (isRefreshing) {
            await new Promise((res) => queue.push(res));
        } else {
            isRefreshing = true;
            try {
                const { data } = await refreshHttp.post('/auth/refresh');
                if (data?.token) tokenStore.set(data.token);
                else throw new Error('No access token from /auth/refresh');
            } catch (refreshError) {
                console.log('Token refresh failed, redirecting to login');
                tokenStore.clear();
                // Очищаємо localStorage/sessionStorage
                localStorage.removeItem('studlink-token');
                sessionStorage.removeItem('studlink-token');
                // Перенаправляємо на логін
                window.location.href = '/login';
                isRefreshing = false;
                queue.forEach((r) => r());
                queue = [];
                throw err;
            }
            isRefreshing = false;
            queue.forEach((r) => r());
            queue = [];
        }

        config._retry = true;
        const fresh = tokenStore.get();
        config.headers = config.headers || {};
        if (fresh) config.headers.Authorization = `Bearer ${fresh}`;
        return http(config);
    }
);
