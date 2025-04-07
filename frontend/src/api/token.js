import axios from 'axios';
import {logout} from "./auth";


const BASE_URL = "http://127.0.0.1:8000"
const ACCESS_TOKEN_LIFETIME = 30;
const REFRESH_TOKEN_LIFETIME = 30

export const saveToken = (access_token, refresh_token) => {
    const now = new Date();

    const access_token_lifetime = new Date(now);
    access_token_lifetime.setDate(now.getDate() + ACCESS_TOKEN_LIFETIME);

    const refresh_token_lifetime = new Date(now);
    refresh_token_lifetime.setDate(now.getDate() + REFRESH_TOKEN_LIFETIME);

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("access_token_lifetime", String(access_token_lifetime.getTime()));
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("refresh_token_lifetime", String(refresh_token_lifetime.getTime()));
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const isAccessTokenExpired = () => {
    const accessTokenLifetime = Number(localStorage.getItem("access_token_lifetime"));
    return accessTokenLifetime ? Date.now() > accessTokenLifetime : true;
};

export const isRefreshTokenExpired = () => {
    const refreshTokenLifetime = Number(localStorage.getItem("refresh_token_lifetime"));
    return refreshTokenLifetime ? Date.now() > refreshTokenLifetime : true;
};

export const refreshAccessToken = async () => {
    const refresh_token = getRefreshToken();

    if (!refresh_token || isRefreshTokenExpired()) {
        logout();
        return null;
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh: refresh_token });
        const { access_token, refresh_token: new_refresh_token } = response.data;

        saveToken(access_token, new_refresh_token);
        return access_token;
    } catch {
        logout();
        return null;
    }
};

export const setAuthorizationHeader = async (config) => {
    let token = getAccessToken();

    if (isAccessTokenExpired() && !isRefreshTokenExpired()) {
        token = await refreshAccessToken();
    }

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
};

axios.interceptors.request.use(setAuthorizationHeader, (error) => Promise.reject(error));
