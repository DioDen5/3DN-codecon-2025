import express from 'express';
import { User } from '../models/User.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { Report } from '../models/Report.js';
import { NameChangeRequest } from '../models/NameChangeRequest.js';
import { ActivityLog } from '../models/ActivityLog.js';
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

        // Підрахунок відгуків про викладачів
        const { TeacherComment } = await import('../models/TeacherComment.js');
        console.log('TeacherComment model imported:', !!TeacherComment);
        const totalReviews = await TeacherComment.countDocuments();
        console.log('Total reviews counted:', totalReviews);

        // Підрахунок скарг на розгляді
        const pendingReports = await Report.countDocuments({ 
            status: 'open' 
        });

        // Підрахунок запитів на зміну імені
        const nameChangeRequests = await NameChangeRequest.countDocuments({ 
            status: 'pending' 
        });

        const response = {
            totalUsers,
            students,
            teachers,
            admins,
            activeAnnouncements,
            totalComments,
            totalReviews,
            pendingReports,
            nameChangeRequests
        };
        
        console.log('Admin stats response:', response);
        res.json(response);
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

// Розгляд скарги (resolve)
router.patch('/reports/:reportId/resolve', authRequired, requireAdmin, async (req, res) => {
    try {
        const { reportId } = req.params;
        const adminId = req.user.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        report.status = 'resolved';
        report.handledBy = adminId;
        report.handledAt = new Date();
        await report.save();

        res.json({ message: 'Report resolved successfully', report });
    } catch (error) {
        console.error('Error resolving report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Відхилення скарги (reject)
router.patch('/reports/:reportId/reject', authRequired, requireAdmin, async (req, res) => {
    try {
        const { reportId } = req.params;
        const adminId = req.user.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        report.status = 'rejected';
        report.handledBy = adminId;
        report.handledAt = new Date();
        await report.save();

        res.json({ message: 'Report rejected successfully', report });
    } catch (error) {
        console.error('Error rejecting report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання даних для модерації
router.get('/moderation', authRequired, requireAdmin, async (req, res) => {
    try {
        const { Announcement } = await import('../models/Announcement.js');
        const { Comment } = await import('../models/Comment.js');
        const { TeacherComment } = await import('../models/TeacherComment.js');

        // Підрахунок оголошень
        const totalAnnouncements = await Announcement.countDocuments();
        const publishedAnnouncements = await Announcement.countDocuments({ status: 'published' });
        const draftAnnouncements = await Announcement.countDocuments({ status: 'draft' });

        // Підрахунок коментарів
        const totalComments = await Comment.countDocuments();

        // Підрахунок відгуків про викладачів
        const totalReviews = await TeacherComment.countDocuments();

        // Останні елементи для модерації
        const recentAnnouncements = await Announcement.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentComments = await Comment.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentReviews = await TeacherComment.find()
            .populate('authorId', 'displayName email')
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            statistics: {
                announcements: {
                    total: totalAnnouncements,
                    published: publishedAnnouncements,
                    draft: draftAnnouncements
                },
                comments: {
                    total: totalComments
                },
                reviews: {
                    total: totalReviews
                }
            },
            recentContent: {
                announcements: recentAnnouncements,
                comments: recentComments,
                reviews: recentReviews
            }
        });
    } catch (error) {
        console.error('Error getting moderation data:', error);
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

// Отримання останньої активності
router.get('/activity', authRequired, requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const activities = await ActivityLog.find({})
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Форматуємо дані для frontend
        const formattedActivities = activities.map(activity => {
            const user = activity.userId;
            const userName = user?.displayName || user?.email?.split('@')[0] || 'Невідомий';
            
            // Визначаємо статус на основі типу дії
            let status = 'info';
            if (activity.action.includes('approved') || activity.action.includes('verified')) {
                status = 'success';
            } else if (activity.action.includes('reported') || activity.action.includes('blocked')) {
                status = 'warning';
            } else if (activity.action.includes('rejected')) {
                status = 'error';
            }

            return {
                id: activity._id,
                type: activity.action,
                user: userName,
                time: activity.timeAgo,
                status: status,
                description: activity.description
            };
        });

        res.json(formattedActivities);
    } catch (error) {
        console.error('Error getting activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання всього контенту для модерації
router.get('/moderation/all', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('Getting all moderation content...');
        
        // Отримуємо останні оголошення
        const announcements = await Announcement.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Отримуємо останні коментарі
        const comments = await Comment.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Отримуємо останні відгуки про викладачів
        let reviews = [];
        try {
            const { TeacherComment } = await import('../models/TeacherComment.js');
            reviews = await TeacherComment.find()
                .populate('authorId', 'displayName email')
                .sort({ createdAt: -1 })
                .limit(10);
        } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            reviews = [];
        }

        // Об'єднуємо весь контент в один масив з типом
        const allContent = [
            ...announcements.map(item => ({ ...item.toObject(), contentType: 'announcement' })),
            ...comments.map(item => ({ ...item.toObject(), contentType: 'comment' })),
            ...reviews.map(item => ({ ...item.toObject(), contentType: 'review' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('All content prepared:', {
            announcements: announcements.length,
            comments: comments.length,
            reviews: reviews.length,
            total: allContent.length
        });

        res.json({
            content: allContent,
            statistics: {
                announcements: announcements.length,
                comments: comments.length,
                reviews: reviews.length,
                total: allContent.length
            }
        });
    } catch (error) {
        console.error('Error getting all moderation content:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
