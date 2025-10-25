import { SecuritySettings } from '../models/SecuritySettings.js';

export const checkSessionTimeout = async (req, res, next) => {
    try {
        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const sessionTimeout = settings?.sessionTimeout || 30;
        
        if (!req.user) {
            return next();
        }
        
        const tokenCreatedAt = req.user.iat;
        const currentTime = Math.floor(Date.now() / 1000);
        const sessionDuration = (currentTime - tokenCreatedAt) / 60;
        
        if (sessionDuration > sessionTimeout) {
            console.log(`Session timeout: ${sessionDuration} minutes > ${sessionTimeout} minutes`);
            
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
        next();
    }
};

export const checkIdleTimeout = async (req, res, next) => {
    try {
        const settings = await SecuritySettings.findOne().sort({ createdAt: -1 });
        const idleTimeout = settings?.idleTimeout || 30;
        
        if (!req.user) {
            return next();
        }
        
        const lastActivity = req.user.lastActivity || req.user.iat;
        const currentTime = Math.floor(Date.now() / 1000);
        const idleDuration = (currentTime - lastActivity) / 60;
        
        if (idleDuration > idleTimeout) {
            console.log(`Idle timeout: ${idleDuration} minutes > ${idleTimeout} minutes`);
            
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            
            return res.status(401).json({ 
                error: 'Idle timeout',
                message: 'Ви були неактивні занадто довго. Будь ласка, увійдіть знову.',
                sessionExpired: true
            });
        }
        
        req.user.lastActivity = currentTime;
        
        next();
    } catch (error) {
        console.error('Error checking idle timeout:', error);
        next();
    }
};
