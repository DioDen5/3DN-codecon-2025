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

http.interceptors.response.use(
    (r) => r,
    async (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            tokenStore.clear();
        }
        return Promise.reject(err);
    }
);
