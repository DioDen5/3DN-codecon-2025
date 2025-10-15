import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';
import { Announcement } from '../models/Announcement.js';

const router = express.Router();

router.get('/', authRequired, requireVerified, async (req,res) => {
    const q = req.query.q?.trim();
    const filter = { status: 'published', visibility: 'students' };
    const cursor = q ? Announcement.find(filter, { score: { $meta: 'textScore' }})
            .sort({ score: { $meta: 'textScore' }, pinned: -1, publishedAt: -1 })
        : Announcement.find(filter).sort({ pinned: -1, publishedAt: -1 });

    const docs = await cursor.limit(20);
    res.json(docs);
});

router.post('/', authRequired, requireVerified, async (req,res) => {
    const { title, body, tags } = req.body ?? {};
    const doc = await Announcement.create({
        title, body, tags, authorId: req.user.id, status: 'draft'
    });
    res.status(201).json(doc);
});

router.post('/:id/submit', authRequired, requireVerified, async (req,res) => {
    const { id } = req.params;
    const doc = await Announcement.findOne({ _id: id, authorId: req.user.id });
    if (!doc) return res.status(404).json({error:'Not found'});
    doc.status = 'pending';
    doc.moderation = { lastAction: 'submit', by: req.user.id, at: new Date() };
    await doc.save();
    res.json(doc);
});

export default router;
