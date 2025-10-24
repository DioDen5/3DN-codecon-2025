import { http } from './httpClient.js';

export const getAdminStats = async () => {
    try {
        const response = await http.get('/api/admin/stats');
        return response.data;
    } catch (error) {
        console.error('Error getting admin stats:', error);
        throw error;
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await http.get('/api/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error getting admin users:', error);
        throw error;
    }
};

export const getAdminReports = async () => {
    try {
        const response = await http.get('/api/admin/reports');
        return response.data;
    } catch (error) {
        console.error('Error getting admin reports:', error);
        throw error;
    }
};

export const getAdminNameChangeRequests = async () => {
    try {
        const response = await http.get('/api/admin/name-change-requests');
        return response.data;
    } catch (error) {
        console.error('Error getting admin name change requests:', error);
        throw error;
    }
};
