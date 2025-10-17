import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../api/tokenStore';
import { http } from '../api/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
    });
    const [isAuth, setIsAuth] = useState(() => !!tokenStore.get());
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let alive = true;
        const boot = async () => {
            try {
                if (!tokenStore.get()) {
                    const { data } = await http.post('/auth/refresh', null, { _skipAuthHandler: true });
                    if (data?.token) tokenStore.set(data.token);
                }
                setIsAuth(!!tokenStore.get());
            } catch {
                tokenStore.clear();
                setIsAuth(false);
            } finally {
                if (alive) setLoading(false);
            }
        };
        boot();
        return () => { alive = false; };
    }, []);

    const loginSuccess = ({ token, user }) => {
        tokenStore.set(token);
        setUser(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
        setIsAuth(true);
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { isAuth: true } }));
    };

    const logoutLocal = () => {
        tokenStore.clear();
        setUser(null);
        localStorage.removeItem('auth_user');
        setIsAuth(false);
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { isAuth: false } }));
    };

    const value = useMemo(() => ({ user, isAuth, loading, loginSuccess, logoutLocal }), [user, isAuth, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
