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

export async function getUserActivity(page = 1, limit = 5) {
    try {
        const { data } = await http.get(`/user/activity?page=${page}&limit=${limit}`);
        return data;
    } catch (error) {
        console.error('Error fetching user activity:', error);
        throw error;
    }
}
