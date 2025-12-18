import { getMyTeacherProfile } from '../api/teachers';

export async function getRedirectAfterLogin(user, teacherProfile = null) {

    if (user?.role === 'teacher') {

        localStorage.setItem('teacherProfileActiveTab', 'profile');

        return '/profile';
    }

    return '/forum';
}

