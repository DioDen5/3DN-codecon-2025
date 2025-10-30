import express from 'express';
import { User } from '../models/User.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { Report } from '../models/Report.js';
import { NameChangeRequest } from '../models/NameChangeRequest.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { TeacherComment } from '../models/TeacherComment.js';
import { authRequired } from '../middleware/auth.js';
import { checkSessionTimeout, checkIdleTimeout } from '../middleware/sessionTimeout.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

const adminAuth = [authRequired, checkSessionTimeout, checkIdleTimeout, requireAdmin];

router.get('/stats', ...adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const admins = await User.countDocuments({ role: 'admin' });

        const activeAnnouncements = await Announcement.countDocuments({ 
            status: 'published' 
        });

        const totalComments = await Comment.countDocuments();

        const { TeacherComment } = await import('../models/TeacherComment.js');
        console.log('TeacherComment model imported:', !!TeacherComment);
        const totalReviews = await TeacherComment.countDocuments();
        console.log('Total reviews counted:', totalReviews);

        const pendingReports = await Report.countDocuments({ 
            status: 'open' 
        });

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
router.get('/users', ...adminAuth, async (req, res) => {
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
router.get('/reports', ...adminAuth, async (req, res) => {
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
        const requests = await NameChangeRequest.find({ status: { $in: ['pending','approved'] } })
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error getting name change requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Схвалити запит на зміну імені та оновити дані користувача
router.post('/name-change-requests/:id/approve', authRequired, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await NameChangeRequest.findById(id);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ error: 'Запит не знайдено або вже оброблено' });
        }

        const user = await User.findById(request.userId);
        if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

        user.firstName = request.newFirstName;
        user.lastName = request.newLastName;
        user.middleName = request.newMiddleName || null;
        user.displayName = request.newDisplayName;
        await user.save();

        request.status = 'approved';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        await ActivityLog.create({
            userId: user._id,
            action: 'name_change_approved',
            description: `Ім'я користувача оновлено на ${user.displayName}`,
            metadata: { requestId: request._id }
        });

        res.json({ message: 'Запит схвалено', request });
    } catch (error) {
        console.error('Approve name change request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Відхилити запит на зміну імені
router.post('/name-change-requests/:id/reject', authRequired, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await NameChangeRequest.findById(id);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ error: 'Запит не знайдено або вже оброблено' });
        }

        request.status = 'rejected';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        await ActivityLog.create({
            userId: request.userId,
            action: 'name_change_rejected',
            description: `Запит на зміну імені відхилено`,
            metadata: { requestId: request._id }
        });

        res.json({ message: 'Запит відхилено', request });
    } catch (error) {
        console.error('Reject name change request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання останньої активності
router.get('/activity', authRequired, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const activities = await ActivityLog.find({})
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await ActivityLog.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

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
                _id: activity._id,
                type: activity.action,
                user: userName,
                time: activity.timeAgo,
                status: status,
                description: activity.description
            };
        });

        res.json({
            content: formattedActivities,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Error getting activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання всього контенту для модерації
router.get('/moderation/all', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('Getting all moderation content...');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        // Отримуємо всі оголошення
        const announcements = await Announcement.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 });

        // Отримуємо всі коментарі
        const comments = await Comment.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 });

        // Отримуємо всі відгуки про викладачів
        let reviews = [];
        try {
            const { TeacherComment } = await import('../models/TeacherComment.js');
            reviews = await TeacherComment.find()
                .populate('authorId', 'displayName email')
                .sort({ createdAt: -1 });
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

        // Застосовуємо пагінацію
        const totalItems = allContent.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginatedContent = allContent.slice(skip, skip + limit);

        console.log('All content prepared:', {
            announcements: announcements.length,
            comments: comments.length,
            reviews: reviews.length,
            total: totalItems,
            page,
            limit,
            totalPages
        });

        // Логування для відгуків
        if (reviews.length > 0) {
            console.log('Sample review data:', {
                authorId: reviews[0].authorId,
                body: reviews[0].body,
                rating: reviews[0].rating,
                createdAt: reviews[0].createdAt
            });
        }

        res.json({
            content: paginatedContent,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            },
            statistics: {
                announcements: announcements.length,
                comments: comments.length,
                reviews: reviews.length,
                total: totalItems
            }
        });
    } catch (error) {
        console.error('Error getting all moderation content:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Отримання оголошень для модерації
router.get('/moderation/announcements', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('Getting moderation announcements...');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const announcements = await Announcement.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await Announcement.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            content: announcements,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Error getting moderation announcements:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Отримання коментарів для модерації
router.get('/moderation/comments', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('Getting moderation comments...');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const comments = await Comment.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await Comment.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            content: comments,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Error getting moderation comments:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Отримання відгуків для модерації
router.get('/moderation/reviews', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('Getting moderation reviews...');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { TeacherComment } = await import('../models/TeacherComment.js');
        
        const reviews = await TeacherComment.find()
            .populate('authorId', 'displayName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await TeacherComment.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            content: reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Error getting moderation reviews:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.delete('/content/:type/:id', authRequired, requireAdmin, async (req, res) => {
    try {
        console.log('DELETE /content route hit:', req.params);
        const { type, id } = req.params;
        console.log('Deleting content:', { type, id });
        
        let result;
        switch (type) {
            case 'announcement':
                result = await Announcement.findByIdAndDelete(id);
                break;
            case 'comment':
                result = await Comment.findByIdAndDelete(id);
                break;
            case 'review':
                result = await TeacherComment.findByIdAndDelete(id);
                // Оновлюємо статистику викладача після видалення відгуку
                if (result && result.teacherId) {
                    const { Teacher } = await import('../models/Teacher.js');
                    const teacher = await Teacher.findById(result.teacherId);
                    if (teacher) {
                        teacher.comments = Math.max(0, teacher.comments - 1);
                        
                        // Перераховуємо рейтинг викладача
                        const remainingReviews = await TeacherComment.find({ 
                            teacherId: result.teacherId 
                        });
                        
                        if (remainingReviews.length > 0) {
                            const totalRating = remainingReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                            teacher.rating = totalRating / remainingReviews.length;
                        } else {
                            teacher.rating = 0;
                        }
                        
                        await teacher.save();
                        console.log('Updated teacher statistics after review deletion');
                    }
                }
                break;
            default:
                console.log('Invalid content type:', type);
                return res.status(400).json({ error: 'Invalid content type' });
        }
        
        console.log('Delete result:', result);
        if (!result) {
            console.log('Content not found');
        }
        
        console.log('Content deleted successfully');
        
        // Оновлюємо статус скарги на "вирішена" після успішного видалення контенту
        try {
            console.log('Looking for report with targetId:', id, 'targetType:', type);
            const report = await Report.findOne({ targetId: id, targetType: type });
            console.log('Found report:', report ? 'YES' : 'NO');
            if (report) {
                console.log('Updating report status from', report.status, 'to resolved');
                report.status = 'resolved';
                report.resolvedAt = new Date();
                report.resolvedBy = req.user.id;
                report.resolutionReason = 'Контент видалено адміністратором';
                await report.save();
                console.log('Report status updated to resolved after content deletion');
            } else {
                console.log('No report found for targetId:', id, 'targetType:', type);
            }
        } catch (reportError) {
            console.error('Error updating report status:', reportError);
        }
        
        res.json({ 
            message: 'Content deleted successfully', 
            success: true 
        });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// POST /admin/approve/:type/:id - схвалити контент
router.post('/approve/:type/:id', authRequired, requireAdmin, async (req, res) => {
    console.log('POST /approve route hit:', req.params);
    const { type, id } = req.params;
    console.log('Approving content:', { type, id });
    
    try {
        let result;
        switch (type) {
            case 'announcement':
                result = await Announcement.findByIdAndUpdate(id, {
                    isApproved: true,
                    approvedBy: req.user.id,
                    approvedAt: new Date()
                }, { new: true });
                break;
            case 'comment':
                result = await Comment.findByIdAndUpdate(id, {
                    isApproved: true,
                    approvedBy: req.user.id,
                    approvedAt: new Date()
                }, { new: true });
                break;
            case 'review':
                result = await TeacherComment.findByIdAndUpdate(id, {
                    isApproved: true,
                    approvedBy: req.user.id,
                    approvedAt: new Date()
                }, { new: true });
                break;
            default:
                console.log('Invalid content type:', type);
                return res.status(400).json({ error: 'Invalid content type' });
        }
        
        console.log('Approve result:', result);
        if (!result) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        console.log('Content approved successfully');
        res.json({ 
            message: 'Content approved successfully', 
            success: true,
            isApproved: result.isApproved
        });
    } catch (error) {
        console.error('Error approving content:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE /admin/approve/:type/:id - скасувати схвалення контенту
router.delete('/approve/:type/:id', authRequired, requireAdmin, async (req, res) => {
    console.log('DELETE /approve route hit:', req.params);
    const { type, id } = req.params;
    console.log('Unapproving content:', { type, id });
    
    try {
        let result;
        switch (type) {
            case 'announcement':
                result = await Announcement.findByIdAndUpdate(id, {
                    isApproved: false,
                    approvedBy: null,
                    approvedAt: null
                }, { new: true });
                break;
            case 'comment':
                result = await Comment.findByIdAndUpdate(id, {
                    isApproved: false,
                    approvedBy: null,
                    approvedAt: null
                }, { new: true });
                break;
            case 'review':
                result = await TeacherComment.findByIdAndUpdate(id, {
                    isApproved: false,
                    approvedBy: null,
                    approvedAt: null
                }, { new: true });
                break;
            default:
                console.log('Invalid content type:', type);
                return res.status(400).json({ error: 'Invalid content type' });
        }
        
        console.log('Unapprove result:', result);
        if (!result) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        console.log('Content unapproved successfully');
        res.json({ 
            message: 'Content unapproved successfully', 
            success: true,
            isApproved: result.isApproved
        });
    } catch (error) {
        console.error('Error unapproving content:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
