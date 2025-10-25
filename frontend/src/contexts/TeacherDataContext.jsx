import React, { createContext, useContext, useState, useCallback } from 'react';

const TeacherDataContext = createContext();

export const useTeacherData = () => {
    const context = useContext(TeacherDataContext);
    if (!context) {
        throw new Error('useTeacherData must be used within a TeacherDataProvider');
    }
    return context;
};

export const TeacherDataProvider = ({ children }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const value = {
        refreshTrigger,
        triggerRefresh
    };

    return (
        <TeacherDataContext.Provider value={value}>
            {children}
        </TeacherDataContext.Provider>
    );
};
