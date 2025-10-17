import express from 'express';
import mongoose from 'mongoose';
import { authRequired } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';
import { Announcement } from '../models/Announcement.js';
import { Reaction } from '../models/Reaction.js';
import { Comment } from '../models/Comment.js';

const router = express.Router();

router.get('/', authRequired, requireVerified, async (req, res) => {
    const q = req.query.q?.trim();
    const filter = { status: 'published', visibility: 'students' };

    const cursor = q
        ? Announcement.find(filter, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' }, pinned: -1, publishedAt: -1 })
        : Announcement.find(filter).sort({ pinned: -1, publishedAt: -1 });

    const docs = await cursor.limit(20);
    res.json(docs);
});


router.get('/:id', authRequired, requireVerified, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Валідація ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid announcement id' });
        }

        // Знаходимо оголошення з правильними умовами
        const doc = await Announcement.findOne({ 
            _id: id, 
            status: 'published', 
            visibility: 'students' 
        });
        
        console.log('Looking for announcement:', { id, found: !!doc });
        if (doc) {
            console.log('Found announcement:', { 
                id: doc._id, 
                status: doc.status, 
                visibility: doc.visibility,
                title: doc.title 
            });
        }
        
        if (!doc) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        // Збільшуємо лічильник переглядів
        await Announcement.updateOne(
            { _id: id }, 
            { $inc: { 'metrics.views': 1 } }
        );

        // Агрегуємо реакції
        const reactions = await Reaction.aggregate([
            { $match: { targetType: 'announcement', targetId: new mongoose.Types.ObjectId(id) } },
            { $group: { 
                _id: '$value', 
                count: { $sum: 1 } 
            }}
        ]);

        // Підраховуємо likes, dislikes та score
        let likes = 0, dislikes = 0;
        reactions.forEach(reaction => {
            if (reaction._id === 1) likes = reaction.count;
            if (reaction._id === -1) dislikes = reaction.count;
        });
        const score = likes - dislikes;

        // Підраховуємо кількість коментарів
        const commentsCount = await Comment.countDocuments({ 
            announcementId: new mongoose.Types.ObjectId(id),
            status: 'visible'
        });

        // Повертаємо документ з лічильниками
        const result = {
            ...doc.toObject(),
            counts: { likes, dislikes, score },
            commentsCount
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authRequired, requireVerified, async (req, res) => {
    const { title, body, tags, status = 'draft', visibility = 'students' } = req.body ?? {};
    
    console.log('Creating announcement:', { title, status, visibility });
    
    const doc = await Announcement.create({
        title,
        body,
        tags,
        authorId: req.user.id,
        status,
        visibility,
        publishedAt: status === 'published' ? new Date() : undefined,
    });
    
    console.log('Created announcement:', { id: doc._id, status: doc.status, visibility: doc.visibility });
    
    res.status(201).json(doc);
});

router.post('/:id/submit', authRequired, requireVerified, async (req, res) => {
    const { id } = req.params;
    const doc = await Announcement.findOne({ _id: id, authorId: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    doc.status = 'pending';
    doc.moderation = { lastAction: 'submit', by: req.user.id, at: new Date() };
    await doc.save();

    res.json(doc);
});

export default router;
