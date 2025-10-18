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
    
    let pipeline;
    if (q) {
        const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        pipeline = [
            { 
                $match: { 
                    ...filter, 
                    $or: [
                        { title: { $regex: searchRegex } },
                        { body: { $regex: searchRegex } }
                    ]
                } 
            },
            { $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'authorId',
                pipeline: [{ $project: { email: 1, displayName: 1 } }]
            }},
            { $unwind: '$authorId' },
            { $sort: { publishedAt: -1 } },
            { $limit: 20 }
        ];
    } else {
        pipeline = [
            { $match: filter },
            { $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'authorId',
                pipeline: [{ $project: { email: 1, displayName: 1 } }]
            }},
            { $unwind: '$authorId' },
            { $sort: { publishedAt: -1 } },
            { $limit: 20 }
        ];
    }
    
    const docs = await Announcement.aggregate(pipeline);
    res.json(docs);
});


router.get('/:id', authRequired, requireVerified, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid announcement id' });
        }

        const doc = await Announcement.findOne({ 
            _id: id, 
            status: 'published', 
            visibility: 'students' 
        }).populate('authorId', 'email displayName');
        
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

        await Announcement.updateOne(
            { _id: id }, 
            { $inc: { 'metrics.views': 1 } }
        );

        const reactions = await Reaction.aggregate([
            { $match: { targetType: 'announcement', targetId: new mongoose.Types.ObjectId(id) } },
            { $group: { 
                _id: '$value', 
                count: { $sum: 1 } 
            }}
        ]);

        let likes = 0, dislikes = 0;
        reactions.forEach(reaction => {
            if (reaction._id === 1) likes = reaction.count;
            if (reaction._id === -1) dislikes = reaction.count;
        });
        const score = likes - dislikes;

        const commentsCount = await Comment.countDocuments({ 
            announcementId: new mongoose.Types.ObjectId(id),
            status: 'visible'
        });

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
