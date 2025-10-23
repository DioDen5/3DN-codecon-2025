import { http } from './httpClient';

export async function getUserStats() {
    try {
        const { data } = await http.get('/user/stats');
        return data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
}

export async function getUserActivity(limit = 20) {
    try {
        const { data } = await http.get(`/user/activity?limit=${limit}`);
        return data;
    } catch (error) {
        console.error('Error fetching user activity:', error);
        throw error;
    }
}
