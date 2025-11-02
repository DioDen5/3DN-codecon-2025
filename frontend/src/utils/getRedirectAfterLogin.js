import { getMyTeacherProfile } from '../api/teachers';

/**
 * Визначає правильний редирект після входу на основі ролі користувача
 * @param {Object} user - Об'єкт користувача з login/loginWithCode відповіді
 * @param {Object} teacherProfile - Профіль викладача (якщо є в відповіді)
 * @returns {Promise<string>} - URL для редиректу
 */
export async function getRedirectAfterLogin(user, teacherProfile = null) {
    // Якщо користувач - викладач, перекидаємо на його профіль
    if (user?.role === 'teacher') {
        // Якщо teacherProfile вже є в відповіді (з login/loginWithCode)
        if (teacherProfile?.id) {
            return `/teachers/${teacherProfile.id}`;
        }
        
        // Якщо немає в відповіді, робимо запит на my-profile
        try {
            const data = await getMyTeacherProfile();
            if (data?.teacher?.id || data?.teacher?._id) {
                const teacherId = data.teacher.id || data.teacher._id;
                return `/teachers/${teacherId}`;
            }
        } catch (error) {
            console.error('Error fetching teacher profile for redirect:', error);
            // Якщо не вдалося отримати профіль, залишаємося на форумі
        }
    }
    
    // Для студентів та інших ролей - завжди на форум
    return '/forum';
}

