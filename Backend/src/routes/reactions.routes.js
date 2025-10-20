import express from 'express';
import mongoose from 'mongoose';
import { Reaction } from '../models/Reaction.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { authRequired as auth } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';

const router = express.Router();

const getUid = (u) => (u && (u._id || u.id)) ? String(u._id || u.id) : null;

const isValidTarget = async (type, id) => {
    if (!mongoose.isValidObjectId(id)) return false;

    if (type === 'announcement') {
        const doc = await Announcement.findById(id).lean();
        return !!doc;
    }
    if (type === 'comment') {
        const doc = await Comment.findById(id).lean();
        return !!doc;
    }
    if (type === 'review') {
        return false;
    }
    return false;
};

const countsFor = async (targetType, targetId) => {
    const [agg] = await Reaction.aggregate([
        { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
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
    return { likes, dislikes, score: likes - dislikes };
};

const countsForWithUser = async (targetType, targetId, userId) => {
    const [agg] = await Reaction.aggregate([
        { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
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
        targetType, 
        targetId: new mongoose.Types.ObjectId(targetId), 
        userId 
    });
    
    return { 
        likes, 
        dislikes, 
        score: likes - dislikes,
        userReaction: userReaction?.value || 0
    };
};

router.post('/reactions/toggle', auth, requireVerified, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { targetType, targetId, value } = req.body;

        if (!['announcement','comment','review','teacher'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid targetType' });
        }
        if (![1,-1].includes(Number(value))) {
            return res.status(400).json({ error: 'Invalid value' });
        }

        const uid = getUid(req.user);
        if (!uid) return res.status(401).json({ error: 'No user id in auth context' });

        if (!(await isValidTarget(targetType, targetId))) {
            return res.status(404).json({ error: 'Target not found' });
        }

        const filter = { targetType, targetId, userId: uid };
        const existing = await Reaction.findOne(filter);

        if (!existing) {
            await Reaction.create({ ...filter, value: Number(value) });
        } else if (existing.value === Number(value)) {
            await Reaction.deleteOne({ _id: existing._id });
        } else {
            existing.value = Number(value);
            await existing.save();
        }

        const counts = await countsForWithUser(targetType, targetId, uid);
        res.json({ ok: true, counts });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/reactions/:targetType/:targetId/counts', auth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { targetType, targetId } = req.params;

        if (!['announcement','comment','review','teacher'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid targetType' });
        }
        if (!mongoose.isValidObjectId(targetId)) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const uid = getUid(req.user);
        if (!uid) return res.status(401).json({ error: 'No user id in auth context' });

        const counts = await countsForWithUser(targetType, targetId, uid);
        res.json(counts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
