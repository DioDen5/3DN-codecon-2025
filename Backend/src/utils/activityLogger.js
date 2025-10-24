import { ActivityLog } from '../models/ActivityLog.js';

export const logActivity = async (userId, action, description, metadata = {}) => {
    try {
        await ActivityLog.logActivity(userId, action, description, metadata);
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Не кидаємо помилку, щоб не ламати основну функціональність
    }
};

// Зручні функції для різних типів активності
export const logUserRegistration = async (userId, userEmail) => {
    await logActivity(
        userId,
        'user_registered',
        `Новий користувач зареєструвався: ${userEmail}`,
        { email: userEmail }
    );
};

export const logUserVerification = async (userId, userEmail) => {
    await logActivity(
        userId,
        'user_verified',
        `Користувач підтвердив email: ${userEmail}`,
        { email: userEmail }
    );
};

export const logAnnouncementCreated = async (userId, announcementTitle) => {
    await logActivity(
        userId,
        'announcement_created',
        `Створено оголошення: ${announcementTitle}`,
        { title: announcementTitle }
    );
};

export const logCommentCreated = async (userId, commentText) => {
    await logActivity(
        userId,
        'comment_created',
        `Додано коментар: ${commentText.substring(0, 50)}...`,
        { comment: commentText.substring(0, 100) }
    );
};

export const logCommentReported = async (userId, commentId, reason) => {
    await logActivity(
        userId,
        'comment_reported',
        `Скарга на коментар: ${reason}`,
        { commentId, reason }
    );
};

export const logNameChangeRequest = async (userId, oldName, newName) => {
    await logActivity(
        userId,
        'name_change_requested',
        `Запит на зміну імені: ${oldName} → ${newName}`,
        { oldName, newName }
    );
};

export const logNameChangeApproved = async (userId, newName) => {
    await logActivity(
        userId,
        'name_change_approved',
        `Зміна імені схвалена: ${newName}`,
        { newName }
    );
};

export const logNameChangeRejected = async (userId, newName) => {
    await logActivity(
        userId,
        'name_change_rejected',
        `Зміна імені відхилена: ${newName}`,
        { newName }
    );
};
