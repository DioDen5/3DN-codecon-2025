import { LoginAttempt } from '../models/LoginAttempt.js';
import { SecuritySettings } from '../models/SecuritySettings.js';

export const checkLoginAttempts = async (req, res, next) => {
    try {
        const { email } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        if (!email) {
            return next();
        }

        // Нормалізуємо email для пошуку (незалежно від регістру)
        const normalizedEmail = email?.toLowerCase().trim();

        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const maxAttempts = settings?.maxLoginAttempts || 5;
        const lockoutDuration = settings?.lockoutDuration || 15;

        // ТИМЧАСОВО ВИМКНЕНО: Блокування через занадто багато спроб
        // Шукаємо спроби з нормалізованим email (case-insensitive)
        // const recentAttempts = await LoginAttempt.find({
        //     email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        //     attemptTime: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
        // }).sort({ attemptTime: -1 });

        // const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
        
        // if (failedAttempts.length >= maxAttempts) {
        //     const lastAttempt = failedAttempts[0];
        //     const blockUntil = new Date(lastAttempt.attemptTime.getTime() + lockoutDuration * 60 * 1000);
            
        //     if (new Date() < blockUntil) {
        //         await LoginAttempt.create({
        //             email: normalizedEmail, // Зберігаємо нормалізований email
        //             ipAddress,
        //             userAgent: req.get('User-Agent'),
        //             success: false,
        //             failureReason: 'account_locked',
        //             isBlocked: true,
        //             blockedUntil: blockUntil
        //         });

        //         return res.status(429).json({
        //             error: 'Account temporarily locked',
        //             message: `Занадто багато невдалих спроб входу. Спробуйте знову через ${lockoutDuration} хвилин.`,
        //             retryAfter: Math.ceil((blockUntil - new Date()) / 1000)
        //         });
        //     }
        // }

        req.loginAttempt = {
            email: normalizedEmail, // Зберігаємо нормалізований email для подальшого логування
            ipAddress,
            userAgent: req.get('User-Agent')
        };

        next();
    } catch (error) {
        console.error('Error checking login attempts:', error);
        next();
    }
};

export const logLoginAttempt = async (req, res, next) => {
    try {
        if (req.loginAttempt) {
            const { email, ipAddress, userAgent } = req.loginAttempt;
            const success = res.statusCode >= 200 && res.statusCode < 300;
            
            await LoginAttempt.create({
                email,
                ipAddress,
                userAgent,
                success,
                failureReason: success ? null : 'invalid_credentials'
            });
        }
        if (next) next();
    } catch (error) {
        console.error('Error logging login attempt:', error);
        if (next) next();
    }
};

export const logLoginAttemptSync = async (req, success, failureReason = null) => {
    try {
        if (req.loginAttempt) {
            const { email, ipAddress, userAgent } = req.loginAttempt;
            
            // Валідні значення для failureReason
            const validReasons = ['invalid_credentials', 'account_locked', 'account_not_verified', 'other'];
            const reason = success ? null : (validReasons.includes(failureReason) ? failureReason : 'invalid_credentials');
            
            await LoginAttempt.create({
                email,
                ipAddress,
                userAgent,
                success,
                failureReason: reason
            });
        }
    } catch (error) {
        console.error('Error logging login attempt:', error);
    }
};
