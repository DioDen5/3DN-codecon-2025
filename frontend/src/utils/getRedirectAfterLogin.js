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
        // Встановлюємо вкладку "Профіль" як активну для TeacherProfilePageNew
        localStorage.setItem('teacherProfileActiveTab', 'profile');
        
        // Для викладачів перекидаємо на /profile, де показується TeacherProfilePageNew з табами
        // Це забезпечує відображення вкладки "Профіль" одразу після реєстрації/входу
        return '/profile';
    }
    
    // Для студентів та інших ролей - завжди на форум
    return '/forum';
}

