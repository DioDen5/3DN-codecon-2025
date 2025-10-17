import { useEffect, useState } from 'react';
import { tokenStore } from './tokenStore';
import { getMe } from './auth';
import { refreshHttp } from './httpClient';

export function useAuthState() {
    const [token, setToken] = useState(() => tokenStore.get());
    const [user,  setUser ] = useState(() => getMe());

    useEffect(() => {
        const unsub = tokenStore.subscribe(setToken);
        const onChange = () => setUser(getMe());
        window.addEventListener('studlink:auth-changed', onChange);
        
        // Автоматичне оновлення токенів кожні 50 хвилин
        const refreshInterval = setInterval(async () => {
            if (token) {
                try {
                    console.log('Auto-refreshing token...');
                    const { data } = await refreshHttp.post('/auth/refresh');
                    if (data?.token) {
                        tokenStore.set(data.token);
                        console.log('Token refreshed successfully');
                    }
                } catch (error) {
                    console.log('Auto-refresh failed:', error);
                    // Не робимо нічого, користувач залишається залогіненим до наступного запиту
                }
            }
        }, 50 * 60 * 1000); // 50 хвилин
        
        return () => {
            unsub();
            window.removeEventListener('studlink:auth-changed', onChange);
            clearInterval(refreshInterval);
        };
    }, [token]);

    return { token, user, isAuthed: !!token };
}
