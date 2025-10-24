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

export const getAdminActivity = async (page = 1) => {
    try {
        console.log('Making request to /admin/activity...');
        const response = await http.get(`/admin/activity?page=${page}&limit=4`);
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

export const getModerationData = async () => {
    try {
        console.log('Making request to /admin/moderation...');
        const response = await http.get('/admin/moderation');
        console.log('Moderation data response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting moderation data:', error);
        throw error;
    }
};

export const getAllModerationContent = async (page = 1, limit = 20) => {
    try {
        console.log(`Making request to /admin/moderation/all?page=${page}&limit=${limit}...`);
        const response = await http.get(`/admin/moderation/all?page=${page}&limit=${limit}`);
        console.log('All moderation content response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting all moderation content:', error);
        throw error;
    }
};

export const getModerationAnnouncements = async (page = 1, limit = 10) => {
    try {
        console.log(`Making request to /admin/moderation/announcements?page=${page}&limit=${limit}...`);
        const response = await http.get(`/admin/moderation/announcements?page=${page}&limit=${limit}`);
        console.log('Moderation announcements response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting moderation announcements:', error);
        throw error;
    }
};

export const getModerationComments = async (page = 1, limit = 10) => {
    try {
        console.log(`Making request to /admin/moderation/comments?page=${page}&limit=${limit}...`);
        const response = await http.get(`/admin/moderation/comments?page=${page}&limit=${limit}`);
        console.log('Moderation comments response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting moderation comments:', error);
        throw error;
    }
};

export const getModerationReviews = async (page = 1, limit = 10) => {
    try {
        console.log(`Making request to /admin/moderation/reviews?page=${page}&limit=${limit}...`);
        const response = await http.get(`/admin/moderation/reviews?page=${page}&limit=${limit}`);
        console.log('Moderation reviews response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting moderation reviews:', error);
        throw error;
    }
};
