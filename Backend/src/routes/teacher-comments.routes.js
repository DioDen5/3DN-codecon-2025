import express from 'express';
import mongoose from 'mongoose';
import { TeacherComment } from '../models/TeacherComment.js';
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
router.post('/:teacherId', authRequired, requireVerified, async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { body } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(teacherId)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        if (!body || body.trim().length === 0) {
            return res.status(400).json({ error: 'Comment body is required' });
        }

        const comment = new TeacherComment({
            teacherId,
            authorId: userId,
            body: body.trim()
        });

        await comment.save();
        await comment.populate('authorId', 'displayName email');

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
