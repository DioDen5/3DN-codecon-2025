import axios from 'axios';
import { tokenStore } from './tokenStore';

const baseURL = `${import.meta.env.VITE_API_URL}/api`;

export const http = axios.create({
    baseURL,
    withCredentials: true,  
    timeout: 10000,
});

http.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshing = null;

http.interceptors.response.use(
    (r) => r,
    async (err) => {
        const original = err.config;

        if (err.response?.status === 401 && !original.__retry) {
            original.__retry = true;
            try {
                if (!refreshing) {
                    refreshing = axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
                        .then(res => {
                            const newAccess = res.data?.token;
                            if (newAccess) tokenStore.set(newAccess);
                            return newAccess;
                        })
                        .finally(() => { refreshing = null; });
                }
                const token = await refreshing;
                if (token) {
                    original.headers.Authorization = `Bearer ${token}`;
                    return http(original);
                }
            } catch (_) {
            }
        }

        return Promise.reject(err);
    }
);
