import { LoginAttempt } from '../models/LoginAttempt.js';
import { SecuritySettings } from '../models/SecuritySettings.js';

export const checkLoginAttempts = async (req, res, next) => {
    try {
        const { email } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!email) {
            return next();
        }

        const normalizedEmail = email?.toLowerCase().trim();

        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const maxAttempts = settings?.maxLoginAttempts || 5;
        const lockoutDuration = settings?.lockoutDuration || 15;

        req.loginAttempt = {
            email: normalizedEmail,
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
