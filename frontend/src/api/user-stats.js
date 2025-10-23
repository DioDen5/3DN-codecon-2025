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
