import { useEffect, useState } from 'react';
import { tokenStore } from './tokenStore';
import { getMe } from './auth';

export function useAuthState() {
    const [token, setToken] = useState(() => tokenStore.get());
    const [user,  setUser ] = useState(() => getMe());

    useEffect(() => {
        const unsub = tokenStore.subscribe(setToken);
        const onChange = () => setUser(getMe());
        window.addEventListener('studlink:auth-changed', onChange);
        return () => {
            unsub();
            window.removeEventListener('studlink:auth-changed', onChange);
        };
    }, []);

    return { token, user, isAuthed: !!token };
}
