const KEY = 'token';

const listeners = new Set();

export const tokenStore = {
    get() {
        try {
            return localStorage.getItem(KEY) || '';
        } catch { return ''; }
    },
    set(t) {
        try {
            localStorage.setItem(KEY, t || '');
            tokenStore._emit();
        } catch {}
    },
    clear() {
        try {
            localStorage.removeItem(KEY);
            tokenStore._emit();
        } catch {}
    },
    subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
    _emit() {
        listeners.forEach(fn => {
            try { fn(tokenStore.get()); } catch {}
        });
        try { window.dispatchEvent(new Event('studlink:auth-changed')); } catch {}
    }
};

try {
    window.addEventListener('storage', (e) => {
        if (e.key === KEY) tokenStore._emit();
    });
} catch {}
