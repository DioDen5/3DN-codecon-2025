import { useState, useCallback } from 'react';

// Глобальний стан для оновлення форуму
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

// Функція для тригера оновлення з будь-якого місця
export const triggerForumRefresh = () => {
    refreshTrigger++;
    refreshCallbacks.forEach(callback => callback());
};
