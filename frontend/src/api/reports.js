import { http } from './httpClient';

export async function createReport(targetType, targetId, reason = '') {
    try {
        const response = await http.post('/reports', {
            targetType,
            targetId,
            reason
        });
        return response.data;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}

export async function getMyReports() {
    try {
        const response = await http.get('/reports/my');
        return response.data;
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}
