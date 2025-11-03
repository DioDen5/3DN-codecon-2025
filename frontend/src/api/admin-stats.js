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

export const deleteContent = async (targetId, targetType) => {
    try {
        console.log(`Making DELETE request to /admin/content/${targetType}/${targetId}`);
        const response = await http.delete(`/admin/content/${targetType}/${targetId}`);
        console.log('Delete content response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting content:', error);
        throw error;
    }
};

export const approveContent = async (contentId, contentType) => {
    try {
        console.log(`Making POST request to /admin/approve/${contentType}/${contentId}`);
        const response = await http.post(`/admin/approve/${contentType}/${contentId}`);
        console.log('Approve content response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error approving content:', error);
        throw error;
    }
};

export const unapproveContent = async (contentId, contentType) => {
    try {
        console.log(`Making DELETE request to /admin/approve/${contentType}/${contentId}`);
        const response = await http.delete(`/admin/approve/${contentType}/${contentId}`);
        console.log('Unapprove content response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error unapproving content:', error);
        throw error;
    }
};

export const approveNameChangeRequest = async (requestId) => {
    const response = await http.post(`/admin/name-change-requests/${requestId}/approve`);
    return response.data;
};

export const rejectNameChangeRequest = async (requestId) => {
    const response = await http.post(`/admin/name-change-requests/${requestId}/reject`);
    return response.data;
};

// Teacher Claim Requests
export const getAdminTeacherClaimRequests = async () => {
    try {
        const response = await http.get('/admin/teacher-claim-requests');
        return response.data;
    } catch (error) {
        console.error('Error getting admin teacher claim requests:', error);
        throw error;
    }
};

export const approveTeacherClaimRequest = async (requestId, adminNotes = '') => {
    try {
        const response = await http.post(`/admin/teacher-claim-requests/${requestId}/approve`, { adminNotes });
        return response.data;
    } catch (error) {
        console.error('Error approving teacher claim request:', error);
        throw error;
    }
};

export const rejectTeacherClaimRequest = async (requestId, adminNotes = '') => {
    try {
        const response = await http.post(`/admin/teacher-claim-requests/${requestId}/reject`, { adminNotes });
        return response.data;
    } catch (error) {
        console.error('Error rejecting teacher claim request:', error);
        throw error;
    }
};

// Teacher pending profile changes
export const getTeacherPendingChanges = async () => {
    try {
        const response = await http.get('/admin/teacher-pending-changes');
        return response.data;
    } catch (error) {
        console.error('Error getting teacher pending changes:', error);
        throw error;
    }
};

export const approveTeacherPendingChanges = async (teacherId) => {
    try {
        const response = await http.post(`/admin/teacher-pending-changes/${teacherId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Error approving teacher pending changes:', error);
        throw error;
    }
};

export const rejectTeacherPendingChanges = async (teacherId) => {
    try {
        const response = await http.post(`/admin/teacher-pending-changes/${teacherId}/reject`);
        return response.data;
    } catch (error) {
        console.error('Error rejecting teacher pending changes:', error);
        throw error;
    }
};

// Teacher verification requests
export const getTeacherVerificationRequests = async () => {
    try {
        const response = await http.get('/admin/teacher-verification-requests');
        return response.data;
    } catch (error) {
        console.error('Error getting teacher verification requests:', error);
        throw error;
    }
};

export const approveTeacherVerification = async (teacherId) => {
    try {
        const response = await http.post(`/admin/teacher-verification-requests/${teacherId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Error approving teacher verification:', error);
        throw error;
    }
};

export const rejectTeacherVerification = async (teacherId, rejectionReason) => {
    try {
        const response = await http.post(`/admin/teacher-verification-requests/${teacherId}/reject`, { rejectionReason });
        return response.data;
    } catch (error) {
        console.error('Error rejecting teacher verification:', error);
        throw error;
    }
};
