import { http } from './httpClient';

// Отримати налаштування безпеки
export const getSecuritySettings = async () => {
    try {
        const response = await http.get('/admin/settings/security');
        return response.data;
    } catch (error) {
        console.error('Error fetching security settings:', error);
        throw error;
    }
};

// Зберегти налаштування безпеки
export const saveSecuritySettings = async (settings) => {
    try {
        const response = await http.post('/admin/settings/security', settings);
        return response.data;
    } catch (error) {
        console.error('Error saving security settings:', error);
        throw error;
    }
};

// Оновити налаштування безпеки
export const updateSecuritySettings = async (settings) => {
    try {
        const response = await http.put('/admin/settings/security', settings);
        return response.data;
    } catch (error) {
        console.error('Error updating security settings:', error);
        throw error;
    }
};