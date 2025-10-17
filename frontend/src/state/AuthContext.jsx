import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { tokenStore } from '../api/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('auth_user') || 'null');
        } catch {
            return null;
        }
    });

    const [isAuth, setIsAuth] = useState(() => !!tokenStore.get());

    useEffect(() => {
        setIsAuth(!!tokenStore.get());
    }, []);

    const loginSuccess = ({ token, user }) => {
        tokenStore.set(token);
        setUser(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
        setIsAuth(true);
    };

    const logoutLocal = () => {
        tokenStore.clear();
        setUser(null);
        localStorage.removeItem('auth_user');
        setIsAuth(false);
    };

    const value = useMemo(
        () => ({ isAuth, user, loginSuccess, logoutLocal }),
        [isAuth, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
