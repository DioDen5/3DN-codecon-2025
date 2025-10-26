import { http } from './httpClient.js';

// Створення запиту на зміну імені
export const requestNameChange = async (nameData) => {
    try {
        const response = await http.post('/name-change/request', nameData);
        return response.data;
    } catch (error) {
        console.error('Error requesting name change:', error);
        throw error;
    }
};

// Отримання статусу запиту на зміну імені
export const getNameChangeStatus = async () => {
    try {
        const response = await http.get('/name-change/status');
        return response.data;
    } catch (error) {
        console.error('Error getting name change status:', error);
        throw error;
    }
};

// Скасування запиту на зміну імені
export const cancelNameChangeRequest = async () => {
    try {
        const response = await http.delete('/name-change/cancel');
        return response.data;
    } catch (error) {
        console.error('Error canceling name change request:', error);
        throw error;
    }
};
