import { http } from './httpClient.js';

export const getAdminStats = async () => {
    try {
        console.log('Making request to /admin/stats...');
        const response = await http.get('/admin/stats');
        console.log('Admin stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting admin stats:', error);
        console.error('Error details:', error.response?.data);
        throw error;
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await http.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error getting admin users:', error);
        throw error;
    }
};

export const getAdminReports = async () => {
    try {
        const response = await http.get('/admin/reports');
        return response.data;
    } catch (error) {
        console.error('Error getting admin reports:', error);
        throw error;
    }
};

export const getAdminNameChangeRequests = async () => {
    try {
        const response = await http.get('/admin/name-change-requests');
        return response.data;
    } catch (error) {
        console.error('Error getting admin name change requests:', error);
        throw error;
    }
};

export const getAdminActivity = async () => {
    try {
        console.log('Making request to /admin/activity...');
        const response = await http.get('/admin/activity');
        console.log('Admin activity response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting admin activity:', error);
        console.error('Error details:', error.response?.data);
        throw error;
    }
};

export const resolveReport = async (reportId) => {
    try {
        const response = await http.patch(`/admin/reports/${reportId}/resolve`);
        return response.data;
    } catch (error) {
        console.error('Error resolving report:', error);
        throw error;
    }
};

export const rejectReport = async (reportId) => {
    try {
        const response = await http.patch(`/admin/reports/${reportId}/reject`);
        return response.data;
    } catch (error) {
        console.error('Error rejecting report:', error);
        throw error;
    }
};
