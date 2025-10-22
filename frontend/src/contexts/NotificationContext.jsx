import React, { createContext, useContext, useState } from 'react';
import SuccessNotification from '../components/SuccessNotification';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    const showSuccess = (message, type = 'success') => {
        setNotification({
            isVisible: true,
            message,
            type
        });
    };

    const hideNotification = () => {
        setNotification({
            isVisible: false,
            message: '',
            type: 'success'
        });
    };

    return (
        <NotificationContext.Provider value={{ showSuccess, hideNotification }}>
            {children}
            <SuccessNotification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
        </NotificationContext.Provider>
    );
};
