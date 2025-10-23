import express from 'express';
import mongoose from 'mongoose';
import { authRequired } from '../middleware/auth.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { TeacherComment } from '../models/TeacherComment.js';
import { Teacher } from '../models/Teacher.js';
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;


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
        } catch (error) {
            console.error('Error fetching comments:', error);
        }

        try {
            // Get user's teacher reviews
            
            // Спробуємо обидва варіанти пошуку
            let reviewsWithString = await TeacherComment.find({
                authorId: userId,
                status: 'visible'
            })
            .populate('teacherId', 'name')
            .select('body rating createdAt teacherId authorId')
            .sort({ createdAt: -1 })
            .limit(limit);
            
            let reviewsWithObjectId = await TeacherComment.find({
                authorId: new mongoose.Types.ObjectId(userId),
                status: 'visible'
            })
            .populate('teacherId', 'name')
            .select('body rating createdAt teacherId authorId')
            .sort({ createdAt: -1 })
            .limit(limit);
            
            // Використовуємо той результат, де знайшли більше відгуків
            if (reviewsWithObjectId.length > 0) {
                reviews = reviewsWithObjectId;
            } else if (reviewsWithString.length > 0) {
                reviews = reviewsWithString;
            } else {
                reviews = [];
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }

        // Get user's reactions (likes/dislikes)
        let reactions = [];
        try {
            reactions = await Reaction.find({
                userId: new mongoose.Types.ObjectId(userId)
            })
            .populate([
                {
                    path: 'targetId',
                    populate: [
                        {
                            path: 'authorId',
                            select: 'displayName'
                        },
                        {
                            path: 'teacherId',
                            select: 'name'
                        }
                    ]
                }
            ])
            .sort({ createdAt: -1 })
            .limit(limit);
        } catch (error) {
            console.error('Error fetching reactions:', error);
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

        // Add reactions (likes/dislikes)
        reactions.forEach(reaction => {
            const target = reaction.targetId;
            let title = '';
            let type = 'like';
            
            
            if (reaction.targetType === 'announcement') {
                const actionText = reaction.value === 1 ? 'Лайк' : 'Дизлайк';
                title = `${actionText} обговорення "${target?.title || 'Обговорення'}"`;
                type = reaction.value === 1 ? 'like' : 'dislike';
            } else if (reaction.targetType === 'comment') {
                const actionText = reaction.value === 1 ? 'Лайк' : 'Дизлайк';
                title = `${actionText} коментаря в "${target?.announcementId?.title || 'обговоренні'}"`;
                type = reaction.value === 1 ? 'like' : 'dislike';
            } else if (reaction.targetType === 'teacher') {
                const actionText = reaction.value === 1 ? 'Лайк' : 'Дизлайк';
                title = `${actionText} викладача ${target?.name || 'Невідомо'}`;
                type = reaction.value === 1 ? 'like' : 'dislike';
            } else if (reaction.targetType === 'review') {
                const actionText = reaction.value === 1 ? 'Лайк' : 'Дизлайк';
                title = `${actionText} відгуку про викладача ${target?.teacherId?.name || 'Невідомо'}`;
                type = reaction.value === 1 ? 'like' : 'dislike';
            }
            
            activities.push({
                type: type,
                title: title,
                date: reaction.createdAt,
                likes: 0,
                id: reaction._id
            });
        });

        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply pagination
        const totalActivities = activities.length;
        const paginatedActivities = activities.slice(skip, skip + limit);
        const totalPages = Math.ceil(totalActivities / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;


        res.json({
            activities: paginatedActivities,
            pagination: {
                currentPage: page,
                totalPages,
                hasNextPage,
                hasPrevPage,
                totalActivities,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

// Test endpoint for teacher reviews
router.get('/test-reviews', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('=== TEST REVIEWS ENDPOINT ===');
        console.log('User ID:', userId);
        console.log('User ID type:', typeof userId);
        
        const { TeacherComment: TeacherCommentModel } = await import('../models/TeacherComment.js');
        
        // Try different approaches
        const reviews1 = await TeacherCommentModel.find({
            authorId: userId,
            status: 'visible'
        });
        console.log('Reviews with string userId:', reviews1.length);
        
        const reviews2 = await TeacherCommentModel.find({
            authorId: new mongoose.Types.ObjectId(userId),
            status: 'visible'
        });
        console.log('Reviews with ObjectId userId:', reviews2.length);
        
        const allReviews = await TeacherCommentModel.find({});
        console.log('All reviews in database:', allReviews.length);
        
        res.json({
            userId,
            userIdType: typeof userId,
            reviewsWithString: reviews1.length,
            reviewsWithObjectId: reviews2.length,
            allReviews: allReviews.length,
            sampleReview: allReviews[0] || null
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
