import express from 'express';
import { SecuritySettings } from '../models/SecuritySettings.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Middleware для перевірки прав адміністратора
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Отримати налаштування безпеки
router.get('/security', authRequired, requireAdmin, async (req, res) => {
    try {
        let settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        
        // Якщо налаштувань немає, створюємо дефолтні
        if (!settings) {
            settings = new SecuritySettings({
                updatedBy: req.user.id
            });
            await settings.save();
        }
        
        res.json({
            success: true,
            settings: {
                twoFactorEnabled: settings.twoFactorEnabled,
                sessionTimeout: settings.sessionTimeout,
                idleTimeout: settings.idleTimeout,
                maxLoginAttempts: settings.maxLoginAttempts,
                lockoutDuration: settings.lockoutDuration,
                passwordMinLength: settings.passwordMinLength,
                requireSpecialChars: settings.requireSpecialChars,
                requireNumbers: settings.requireNumbers,
                requireUppercase: settings.requireUppercase,
                lastUpdated: settings.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching security settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Зберегти налаштування безпеки
router.post('/security', authRequired, requireAdmin, async (req, res) => {
    try {
        const {
            twoFactorEnabled,
            sessionTimeout,
            idleTimeout,
            maxLoginAttempts,
            lockoutDuration,
            passwordMinLength,
            requireSpecialChars,
            requireNumbers,
            requireUppercase
        } = req.body;

        // Валідація даних
        if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 480)) {
            return res.status(400).json({ error: 'Session timeout must be between 5 and 480 minutes' });
        }

        if (idleTimeout && (idleTimeout < 5 || idleTimeout > 120)) {
            return res.status(400).json({ error: 'Idle timeout must be between 5 and 120 minutes' });
        }

        if (maxLoginAttempts && (maxLoginAttempts < 3 || maxLoginAttempts > 10)) {
            return res.status(400).json({ error: 'Max login attempts must be between 3 and 10' });
        }

        if (lockoutDuration && (lockoutDuration < 5 || lockoutDuration > 60)) {
            return res.status(400).json({ error: 'Lockout duration must be between 5 and 60 minutes' });
        }

        if (passwordMinLength && (passwordMinLength < 6 || passwordMinLength > 20)) {
            return res.status(400).json({ error: 'Password minimum length must be between 6 and 20 characters' });
        }

        // Отримуємо поточні налаштування або створюємо нові
        let settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        
        if (!settings) {
            settings = new SecuritySettings();
        }

        // Оновлюємо налаштування
        settings.twoFactorEnabled = twoFactorEnabled !== undefined ? twoFactorEnabled : settings.twoFactorEnabled;
        settings.sessionTimeout = sessionTimeout !== undefined ? sessionTimeout : settings.sessionTimeout;
        settings.idleTimeout = idleTimeout !== undefined ? idleTimeout : settings.idleTimeout;
        settings.maxLoginAttempts = maxLoginAttempts !== undefined ? maxLoginAttempts : settings.maxLoginAttempts;
        settings.lockoutDuration = lockoutDuration !== undefined ? lockoutDuration : settings.lockoutDuration;
        settings.passwordMinLength = passwordMinLength !== undefined ? passwordMinLength : settings.passwordMinLength;
        settings.requireSpecialChars = requireSpecialChars !== undefined ? requireSpecialChars : settings.requireSpecialChars;
        settings.requireNumbers = requireNumbers !== undefined ? requireNumbers : settings.requireNumbers;
        settings.requireUppercase = requireUppercase !== undefined ? requireUppercase : settings.requireUppercase;
        settings.updatedBy = req.user.id;
        settings.lastUpdated = new Date();

        await settings.save();

        res.json({
            success: true,
            message: 'Security settings saved successfully',
            settings: {
                twoFactorEnabled: settings.twoFactorEnabled,
                sessionTimeout: settings.sessionTimeout,
                idleTimeout: settings.idleTimeout,
                maxLoginAttempts: settings.maxLoginAttempts,
                lockoutDuration: settings.lockoutDuration,
                passwordMinLength: settings.passwordMinLength,
                requireSpecialChars: settings.requireSpecialChars,
                requireNumbers: settings.requireNumbers,
                requireUppercase: settings.requireUppercase,
                lastUpdated: settings.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error saving security settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Оновити налаштування безпеки (PUT)
router.put('/security', authRequired, requireAdmin, async (req, res) => {
    try {
        const {
            twoFactorEnabled,
            sessionTimeout,
            idleTimeout,
            maxLoginAttempts,
            lockoutDuration,
            passwordMinLength,
            requireSpecialChars,
            requireNumbers,
            requireUppercase
        } = req.body;

        // Валідація даних
        if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 480)) {
            return res.status(400).json({ error: 'Session timeout must be between 5 and 480 minutes' });
        }

        if (idleTimeout && (idleTimeout < 5 || idleTimeout > 120)) {
            return res.status(400).json({ error: 'Idle timeout must be between 5 and 120 minutes' });
        }

        if (maxLoginAttempts && (maxLoginAttempts < 3 || maxLoginAttempts > 10)) {
            return res.status(400).json({ error: 'Max login attempts must be between 3 and 10' });
        }

        if (lockoutDuration && (lockoutDuration < 5 || lockoutDuration > 60)) {
            return res.status(400).json({ error: 'Lockout duration must be between 5 and 60 minutes' });
        }

        if (passwordMinLength && (passwordMinLength < 6 || passwordMinLength > 20)) {
            return res.status(400).json({ error: 'Password minimum length must be between 6 and 20 characters' });
        }

        // Отримуємо поточні налаштування
        let settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        
        if (!settings) {
            settings = new SecuritySettings();
        }

        // Оновлюємо налаштування
        if (twoFactorEnabled !== undefined) settings.twoFactorEnabled = twoFactorEnabled;
        if (sessionTimeout !== undefined) settings.sessionTimeout = sessionTimeout;
        if (idleTimeout !== undefined) settings.idleTimeout = idleTimeout;
        if (maxLoginAttempts !== undefined) settings.maxLoginAttempts = maxLoginAttempts;
        if (lockoutDuration !== undefined) settings.lockoutDuration = lockoutDuration;
        if (passwordMinLength !== undefined) settings.passwordMinLength = passwordMinLength;
        if (requireSpecialChars !== undefined) settings.requireSpecialChars = requireSpecialChars;
        if (requireNumbers !== undefined) settings.requireNumbers = requireNumbers;
        if (requireUppercase !== undefined) settings.requireUppercase = requireUppercase;
        
        settings.updatedBy = req.user.id;
        settings.lastUpdated = new Date();

        await settings.save();

        res.json({
            success: true,
            message: 'Security settings updated successfully',
            settings: {
                twoFactorEnabled: settings.twoFactorEnabled,
                sessionTimeout: settings.sessionTimeout,
                idleTimeout: settings.idleTimeout,
                maxLoginAttempts: settings.maxLoginAttempts,
                lockoutDuration: settings.lockoutDuration,
                passwordMinLength: settings.passwordMinLength,
                requireSpecialChars: settings.requireSpecialChars,
                requireNumbers: settings.requireNumbers,
                requireUppercase: settings.requireUppercase,
                lastUpdated: settings.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error updating security settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;