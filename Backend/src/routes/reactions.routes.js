import express from 'express';
import mongoose from 'mongoose';
import { Reaction } from '../models/Reaction.js';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { Review } from '../models/Review.js'; // якщо немає — можна тимчасово закоментувати
import { authRequired as auth } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';

const router = express.Router();

const isValidTarget = async (type, id) => {
    if (!mongoose.isValidObjectId(id)) return false;
    if (type === 'announcement') return !!(await Announcement.findById(id).lean());
    if (type === 'comment')      return !!(await Comment.findById(id).lean());
    if (type === 'review')       return !!(await Review?.findById?.(id)?.lean?.());
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

// Toggle (create / switch / remove)
router.post('/reactions/toggle', auth, requireVerified, async (req, res) => {
    try {
        const { targetType, targetId, value } = req.body;
        if (!['announcement','comment','review'].includes(targetType)) return res.status(400).json({ error: 'Invalid targetType' });
        if (![1,-1].includes(Number(value))) return res.status(400).json({ error: 'Invalid value' });
        if (!(await isValidTarget(targetType, targetId))) return res.status(404).json({ error: 'Target not found' });

        const filter = { targetType, targetId, userId: req.user._id };
        const existing = await Reaction.findOne(filter);

        if (!existing) {
            await Reaction.create({ ...filter, value: Number(value) });
        } else if (existing.value === Number(value)) {
            await Reaction.deleteOne({ _id: existing._id }); // toggle off
        } else {
            existing.value = Number(value); // switch
            await existing.save();
        }

        const counts = await countsFor(targetType, targetId);
        res.json({ ok: true, counts });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get counts
router.get('/reactions/:targetType/:targetId/counts', async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        if (!['announcement','comment','review'].includes(targetType)) return res.status(400).json({ error: 'Invalid targetType' });
        if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid id' });

        const counts = await countsFor(targetType, targetId);
        res.json(counts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
