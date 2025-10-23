import express from 'express';
import mongoose from 'mongoose';
import { authRequired } from '../middleware/auth.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { TeacherComment } from '../models/TeacherComment.js';
import { Reaction } from '../models/Reaction.js';

const router = express.Router();

// Get user statistics
router.get('/stats', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        // Count user's announcements
        const discussionsCount = await Announcement.countDocuments({
            authorId: new mongoose.Types.ObjectId(userId),
            status: 'published'
        });

        // Count user's comments
        const commentsCount = await Comment.countDocuments({
            authorId: new mongoose.Types.ObjectId(userId),
            status: 'visible'
        });

        // Count user's teacher reviews
        const reviewsCount = await TeacherComment.countDocuments({
            authorId: new mongoose.Types.ObjectId(userId),
            status: 'visible'
        });

        // Count total likes received by user
        const likesReceived = await Reaction.aggregate([
            {
                $lookup: {
                    from: 'announcements',
                    localField: 'targetId',
                    foreignField: '_id',
                    as: 'announcement'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'targetId',
                    foreignField: '_id',
                    as: 'comment'
                }
            },
            {
                $lookup: {
                    from: 'teachercomments',
                    localField: 'targetId',
                    foreignField: '_id',
                    as: 'teacherComment'
                }
            },
            {
                $match: {
                    $or: [
                        { 
                            targetType: 'announcement',
                            'announcement.authorId': new mongoose.Types.ObjectId(userId)
                        },
                        { 
                            targetType: 'comment',
                            'comment.authorId': new mongoose.Types.ObjectId(userId)
                        },
                        { 
                            targetType: 'comment',
                            'teacherComment.authorId': new mongoose.Types.ObjectId(userId)
                        }
                    ],
                    value: 1
                }
            },
            {
                $count: 'totalLikes'
            }
        ]);

        const totalLikes = likesReceived[0]?.totalLikes || 0;

        const stats = {
            discussions: discussionsCount,
            comments: commentsCount,
            reviews: reviewsCount,
            totalLikes: totalLikes
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

// Get user activity
router.get('/activity', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        console.log('Fetching activity for user:', userId);

        let announcements = [];
        let comments = [];
        let reviews = [];

        try {
            // Get user's announcements
            announcements = await Announcement.find({
                authorId: new mongoose.Types.ObjectId(userId),
                status: 'published'
            })
            .select('title createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);
            console.log('Found announcements:', announcements.length);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }

        try {
            // Get user's comments
            comments = await Comment.find({
                authorId: new mongoose.Types.ObjectId(userId),
                status: 'visible'
            })
            .populate('announcementId', 'title')
            .select('body createdAt announcementId')
            .sort({ createdAt: -1 })
            .limit(limit);
            console.log('Found comments:', comments.length);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }

        try {
            // Get user's teacher reviews
            const { TeacherComment: TeacherCommentModel } = await import('../models/TeacherComment.js');
            reviews = await TeacherCommentModel.find({
                authorId: new mongoose.Types.ObjectId(userId),
                status: 'visible'
            })
            .populate('teacherId', 'name')
            .select('body rating createdAt teacherId')
            .sort({ createdAt: -1 })
            .limit(limit);
            console.log('Found reviews:', reviews.length);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }

        // Combine and format activities
        const activities = [];

        // Add announcements
        announcements.forEach(announcement => {
            activities.push({
                type: 'discussion',
                title: announcement.title,
                date: announcement.createdAt,
                likes: 0, // Will be calculated separately if needed
                id: announcement._id
            });
        });

        // Add comments
        comments.forEach(comment => {
            activities.push({
                type: 'comment',
                title: `Коментар до "${comment.announcementId?.title || 'Обговорення'}"`,
                date: comment.createdAt,
                likes: 0,
                id: comment._id
            });
        });

        // Add reviews
        reviews.forEach(review => {
            activities.push({
                type: 'review',
                title: `Відгук про викладача ${review.teacherId?.name || 'Невідомо'}`,
                date: review.createdAt,
                likes: 0,
                id: review._id
            });
        });

        // Sort by date (newest first) and limit
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const limitedActivities = activities.slice(0, limit);

        console.log('Total activities found:', limitedActivities.length);
        console.log('Activities:', limitedActivities);

        res.json(limitedActivities);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

export default router;
