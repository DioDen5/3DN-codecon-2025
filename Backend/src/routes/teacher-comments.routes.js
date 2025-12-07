import express from 'express';
import mongoose from 'mongoose';
import { TeacherComment } from '../models/TeacherComment.js';
import { Teacher } from '../models/Teacher.js';
import { authRequired } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';
import { logTeacherReviewCreated, logTeacherReviewDeleted } from '../utils/activityLogger.js';

const router = express.Router();

// Get comments for a teacher
router.get('/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        if (!mongoose.isValidObjectId(teacherId)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        const comments = await TeacherComment.find({ 
            teacherId, 
            status: 'visible' 
        })
        .populate('authorId', 'displayName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await TeacherComment.countDocuments({ 
            teacherId, 
            status: 'visible' 
        });

        res.json({
            comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching teacher comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Create a new comment
router.post('/:teacherId', authRequired, async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { body, rating } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(teacherId)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        // body може бути порожнім, але rating обов'язковий
        const commentBody = body ? body.trim() : '';

        if (!rating || ![1, 2, 3, 4, 5].includes(rating)) {
            return res.status(400).json({ error: 'Rating is required and must be between 1 and 5' });
        }

        // Перевіряємо, чи користувач не намагається залишити відгук самому собі
        const teacher = await Teacher.findById(teacherId);
        if (teacher && teacher.userId) {
            const teacherUserId = teacher.userId instanceof mongoose.Types.ObjectId 
                ? teacher.userId.toString() 
                : teacher.userId.toString();
            const currentUserId = userId instanceof mongoose.Types.ObjectId 
                ? userId.toString() 
                : userId.toString();
            
            if (teacherUserId === currentUserId) {
                return res.status(403).json({ error: 'Ви не можете залишити відгук самому собі' });
            }
        }

        // Перевіряємо, чи користувач вже залишив відгук для цього викладача
        const existingComment = await TeacherComment.findOne({
            teacherId,
            authorId: userId,
            status: 'visible'
        });

        if (existingComment) {
            return res.status(400).json({ error: 'Ви вже залишили відгук для цього викладача' });
        }

        const comment = new TeacherComment({
            teacherId,
            authorId: userId,
            body: commentBody,
            rating
        });


        await comment.save();
        await comment.populate('authorId', 'displayName email');
        
        // Оновлюємо лічильники викладача (використовуємо вже завантажений вище teacher)
        
        // Логуємо створення відгуку
        if (teacher) {
            await logTeacherReviewCreated(userId, teacher.name, rating);
        }
        
        if (teacher) {
            
            // Додаємо коментар до загальної кількості
            teacher.comments += 1;
            
            // Визначаємо чи це позитивна чи негативна оцінка
            if (rating >= 3) {
                teacher.likes += 1;
            } else {
                teacher.dislikes += 1;
            }
            
            // Оновлюємо загальну кількість голосів
            teacher.totalVotes += 1;
            
            // Перераховуємо рейтинг на основі зірок (1-5 -> 0-10)
            const allComments = await TeacherComment.find({ teacherId, status: 'visible' });
            if (allComments.length > 0) {
                const totalStars = allComments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
                const averageStars = totalStars / allComments.length;
                // Конвертуємо з 1-5 зірок в 0-10 рейтинг
                teacher.rating = Math.round((averageStars / 5) * 10);
            } else {
                teacher.rating = 0;
            }
            
            await teacher.save();
        }

        
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating teacher comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Get comment counts for reactions
router.get('/:commentId/counts', authRequired, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        // Use the existing reactions system for teacher comments
        const { Reaction } = await import('../models/Reaction.js');
        
        const [agg] = await Reaction.aggregate([
            { $match: { targetType: 'comment', targetId: new mongoose.Types.ObjectId(commentId) } },
            {
                $group: {
                    _id: null,
                    likes:    { $sum: { $cond: [{ $eq: ['$value', 1] }, 1, 0] } },
                    dislikes: { $sum: { $cond: [{ $eq: ['$value',-1] }, 1, 0] } },
                },
            },
        ]);
        const likes = agg?.likes || 0;
        const dislikes = agg?.dislikes || 0;
        
        // Get user reaction
        const userReaction = await Reaction.findOne({ 
            targetType: 'comment', 
            targetId: new mongoose.Types.ObjectId(commentId), 
            userId: new mongoose.Types.ObjectId(userId)
        });
        
        const counts = { 
            likes, 
            dislikes, 
            score: likes - dislikes,
            userReaction: userReaction?.value || 0
        };

        res.json(counts);
    } catch (error) {
        console.error('Error fetching comment counts:', error);
        res.status(500).json({ error: 'Failed to fetch comment counts' });
    }
});

// Delete a comment
router.delete('/:commentId', authRequired, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const comment = await TeacherComment.findOne({
            _id: commentId,
            authorId: userId,
            status: 'visible'
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        await TeacherComment.findByIdAndDelete(commentId);

        const teacher = await Teacher.findById(comment.teacherId);
        
        if (teacher) {
            teacher.comments = Math.max(0, teacher.comments - 1);
            
            if (comment.rating >= 3) {
                teacher.likes = Math.max(0, teacher.likes - 1);
            } else {
                teacher.dislikes = Math.max(0, teacher.dislikes - 1);
            }
            
            teacher.totalVotes = Math.max(0, teacher.totalVotes - 1);
            
            const allComments = await TeacherComment.find({ teacherId: comment.teacherId, status: 'visible' });
            if (allComments.length > 0) {
                const totalStars = allComments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
                const averageStars = totalStars / allComments.length;
                teacher.rating = Math.round((averageStars / 5) * 10);
            } else {
                teacher.rating = 0;
                teacher.likes = 0;
                teacher.dislikes = 0;
                teacher.totalVotes = 0;
            }
            
            await teacher.save();
        }

        if (teacher) {
            await logTeacherReviewDeleted(userId, teacher.name);
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// Update a comment (text and/or rating)
router.patch('/:commentId', authRequired, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { body, rating } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const comment = await TeacherComment.findOne({ _id: commentId, authorId: userId, status: 'visible' });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const teacher = await Teacher.findById(comment.teacherId);

        const prevRating = comment.rating;
        if (typeof body === 'string') {
            comment.body = body.trim();
        }
        if (rating !== undefined) {
            if (![1, 2, 3, 4, 5].includes(Number(rating))) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }
            comment.rating = Number(rating);
        }

        await comment.save();
        await comment.populate('authorId', 'displayName email');

        // If rating changed, recalc teacher aggregates and rating
        if (teacher && rating !== undefined && Number(prevRating) !== Number(rating)) {
            // Recompute likes/dislikes/totalVotes from all visible comments to keep consistency
            const allComments = await TeacherComment.find({ teacherId: comment.teacherId, status: 'visible' });
            teacher.comments = allComments.length;
            teacher.likes = allComments.reduce((sum, c) => sum + (c.rating >= 3 ? 1 : 0), 0);
            teacher.dislikes = allComments.reduce((sum, c) => sum + (c.rating < 3 ? 1 : 0), 0);
            teacher.totalVotes = allComments.length;

            if (allComments.length > 0) {
                const totalStars = allComments.reduce((sum, c) => sum + (c.rating || 0), 0);
                const averageStars = totalStars / allComments.length;
                teacher.rating = Math.round((averageStars / 5) * 10);
            } else {
                teacher.rating = 0;
            }

            await teacher.save();
        }

        res.json(comment);
    } catch (error) {
        console.error('Error updating teacher comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Toggle reaction for teacher comment
router.post('/:commentId/toggle', authRequired, requireVerified, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { value } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        if (![1, -1].includes(Number(value))) {
            return res.status(400).json({ error: 'Invalid value' });
        }

        const { Reaction } = await import('../models/Reaction.js');
        
        const filter = { targetType: 'comment', targetId: new mongoose.Types.ObjectId(commentId), userId: new mongoose.Types.ObjectId(userId) };
        const existing = await Reaction.findOne(filter);

        if (!existing) {
            await Reaction.create({ ...filter, value: Number(value) });
        } else if (existing.value === Number(value)) {
            await Reaction.deleteOne({ _id: existing._id });
        } else {
            existing.value = Number(value);
            await existing.save();
        }

        // Get updated counts
        const [agg] = await Reaction.aggregate([
            { $match: { targetType: 'comment', targetId: new mongoose.Types.ObjectId(commentId) } },
            {
                $group: {
                    _id: null,
                    likes:    { $sum: { $cond: [{ $eq: ['$value', 1] }, 1, 0] } },
                    dislikes: { $sum: { $cond: [{ $eq: ['$value',-1] }, 1, 0] } },
                },
            },
        ]);
        const likes = agg?.likes || 0;
        const dislikes = agg?.dislikes || 0;
        
        const userReaction = await Reaction.findOne({ 
            targetType: 'comment', 
            targetId: new mongoose.Types.ObjectId(commentId), 
            userId: new mongoose.Types.ObjectId(userId)
        });

        const counts = { 
            likes, 
            dislikes, 
            score: likes - dislikes,
            userReaction: userReaction?.value || 0
        };

        res.json({ ok: true, counts });
    } catch (error) {
        console.error('Error toggling comment reaction:', error);
        res.status(500).json({ error: 'Failed to toggle reaction' });
    }
});

export default router;
