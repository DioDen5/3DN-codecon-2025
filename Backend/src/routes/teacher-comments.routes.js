import express from 'express';
import mongoose from 'mongoose';
import { TeacherComment } from '../models/TeacherComment.js';
import { Teacher } from '../models/Teacher.js';
import { authRequired } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';

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

        // Оновлюємо лічильники викладача
        const teacher = await Teacher.findById(teacherId);
        
        if (teacher) {
            console.log('Before update - Teacher stats:', {
                comments: teacher.comments,
                likes: teacher.likes,
                dislikes: teacher.dislikes,
                totalVotes: teacher.totalVotes,
                rating: teacher.rating
            });
            
            // Додаємо коментар до загальної кількості
            teacher.comments += 1;
            
            // Визначаємо чи це позитивна чи негативна оцінка
            if (rating >= 3) {
                teacher.likes += 1;
                console.log('Added positive rating:', rating);
            } else {
                teacher.dislikes += 1;
                console.log('Added negative rating:', rating);
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
            
            console.log('After update - Teacher stats:', {
                comments: teacher.comments,
                likes: teacher.likes,
                dislikes: teacher.dislikes,
                totalVotes: teacher.totalVotes,
                rating: teacher.rating
            });
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

        // Оновлюємо лічильники викладача
        const teacher = await Teacher.findById(comment.teacherId);
        
        if (teacher) {
            // Віднімаємо коментар від загальної кількості
            teacher.comments -= 1;
            
            // Визначаємо чи це позитивна чи негативна оцінка
            if (comment.rating >= 3) {
                teacher.likes -= 1;
            } else {
                teacher.dislikes -= 1;
            }
            
            // Оновлюємо загальну кількість голосів
            teacher.totalVotes -= 1;
            
            // Перераховуємо рейтинг на основі зірок (1-5 -> 0-10)
            const allComments = await TeacherComment.find({ teacherId: comment.teacherId, status: 'visible' });
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

        // Видаляємо коментар
        await TeacherComment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
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
