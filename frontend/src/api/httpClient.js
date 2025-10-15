import axios from 'axios';
import { tokenStore } from './tokenStore';

const baseURL = `${import.meta.env.VITE_API_URL}/api`;

export const http = axios.create({
    baseURL,
    withCredentials: false,      // ⬅️ тимчасово OFF, щоби не ловити CORS-факапи
    timeout: 10000,
});

http.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
