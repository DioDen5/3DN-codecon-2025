import express from 'express';
import { User } from '../models/User.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { Report } from '../models/Report.js';
import { NameChangeRequest } from '../models/NameChangeRequest.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Middleware для перевірки прав адміністратора
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Статистика для адміністратора
router.get('/stats', authRequired, requireAdmin, async (req, res) => {
    try {
        // Підрахунок користувачів за ролями
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const admins = await User.countDocuments({ role: 'admin' });

        // Підрахунок активних оголошень
        const activeAnnouncements = await Announcement.countDocuments({ 
            status: 'published' 
        });

        // Підрахунок коментарів (тільки до оголошень, не відгуки до викладачів)
        const totalComments = await Comment.countDocuments();

        // Підрахунок скарг на розгляді
        const pendingReports = await Report.countDocuments({ 
            status: 'open' 
        });

        // Підрахунок запитів на зміну імені
        const nameChangeRequests = await NameChangeRequest.countDocuments({ 
            status: 'pending' 
        });

        res.json({
            totalUsers,
            students,
            teachers,
            admins,
            activeAnnouncements,
            totalComments,
            pendingReports,
            nameChangeRequests
        });
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання списку користувачів
router.get('/users', authRequired, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, {
            _id: 1,
            displayName: 1,
            email: 1,
            role: 1,
            status: 1,
            createdAt: 1
        }).sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання скарг
router.get('/reports', authRequired, requireAdmin, async (req, res) => {
    try {
        const reports = await Report.find({ status: 'open' })
            .populate('reporterId', 'displayName email')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        console.error('Error getting reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання запитів на зміну імені
router.get('/name-change-requests', authRequired, requireAdmin, async (req, res) => {
    try {
        const requests = await NameChangeRequest.find({ status: 'pending' })
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error getting name change requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
