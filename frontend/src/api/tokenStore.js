const KEY = 'studlink_access_token';

export const tokenStore = {
    get() {
        try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
    },
    set(t) {
        try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {}
    },
    clear() { try { localStorage.removeItem(KEY); } catch {} },
};
