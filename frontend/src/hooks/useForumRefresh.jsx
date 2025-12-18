import { useState, useCallback } from 'react';

let refreshTrigger = 0;
let refreshCallbacks = new Set();

export const useForumRefresh = () => {
    const [trigger, setTrigger] = useState(refreshTrigger);

    const refresh = useCallback(() => {
        refreshTrigger++;
        setTrigger(refreshTrigger);
        refreshCallbacks.forEach(callback => callback());
    }, []);

    const subscribe = useCallback((callback) => {
        refreshCallbacks.add(callback);
        return () => refreshCallbacks.delete(callback);
    }, []);

    return { refresh, subscribe, trigger };
};

export const triggerForumRefresh = () => {
    refreshTrigger++;
    refreshCallbacks.forEach(callback => callback());
};
