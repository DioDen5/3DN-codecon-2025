import { SecuritySettings } from '../models/SecuritySettings.js';

// Мідлваре для перевірки таймауту сесії
export const checkSessionTimeout = async (req, res, next) => {
    try {
        // Отримуємо налаштування безпеки
        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const sessionTimeout = settings?.sessionTimeout || 30; // хвилини
        
        // Перевіряємо чи є токен
        if (!req.user) {
            return next();
        }
        
        // Отримуємо час створення токена з JWT
        const tokenCreatedAt = req.user.iat; // issued at time
        const currentTime = Math.floor(Date.now() / 1000);
        const sessionDuration = (currentTime - tokenCreatedAt) / 60; // хвилини
        
        // Якщо сесія перевищила таймаут
        if (sessionDuration > sessionTimeout) {
            console.log(`Session timeout: ${sessionDuration} minutes > ${sessionTimeout} minutes`);
            
            // Очищуємо токени
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            
            return res.status(401).json({ 
                error: 'Session expired',
                message: 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.',
                sessionExpired: true
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking session timeout:', error);
        next(); // Продовжуємо навіть при помилці
    }
};

// Мідлваре для перевірки неактивності
export const checkIdleTimeout = async (req, res, next) => {
    try {
        // Отримуємо налаштування безпеки
        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const idleTimeout = settings?.idleTimeout || 30; // хвилини
        
        // Перевіряємо чи є токен
        if (!req.user) {
            return next();
        }
        
        // Отримуємо час останньої активності з токена
        const lastActivity = req.user.lastActivity || req.user.iat;
        const currentTime = Math.floor(Date.now() / 1000);
        const idleDuration = (currentTime - lastActivity) / 60; // хвилини
        
        // Якщо користувач неактивний більше ніж дозволено
        if (idleDuration > idleTimeout) {
            console.log(`Idle timeout: ${idleDuration} minutes > ${idleTimeout} minutes`);
            
            // Очищуємо токени
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            
            return res.status(401).json({ 
                error: 'Idle timeout',
                message: 'Ви були неактивні занадто довго. Будь ласка, увійдіть знову.',
                sessionExpired: true
            });
        }
        
        // Оновлюємо час останньої активності
        req.user.lastActivity = currentTime;
        
        next();
    } catch (error) {
        console.error('Error checking idle timeout:', error);
        next(); // Продовжуємо навіть при помилці
    }
};
