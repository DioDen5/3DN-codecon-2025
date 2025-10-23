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

export default router;
