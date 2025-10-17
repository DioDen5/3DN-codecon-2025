import express from 'express';
import mongoose from 'mongoose';
import { Announcement } from '../models/Announcement.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { authRequired as auth } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';

const router = express.Router();
const isAdmin = (u) => !!u && u.role === 'admin';
const getUid = (u) => (u && (u._id || u.id)) ? String(u._id || u.id) : null;

router.post('/announcements/:id/comments', auth, requireVerified, async (req, res) => {
    try {
        const announcementId = req.params.id;
        if (!mongoose.isValidObjectId(announcementId)) return res.status(400).json({ error: 'Invalid announcement id' });

        const ann = await Announcement.findById(announcementId).lean();
        if (!ann) return res.status(404).json({ error: 'Announcement not found' });

        console.log('Checking announcement for comments:', { 
            id: ann._id, 
            status: ann.status, 
            visibility: ann.visibility 
        });

        const uid = getUid(req.user);
        if (!uid) return res.status(401).json({ error: 'No user id in auth context' });

        if (ann.status !== 'published' || ann.visibility !== 'students') {
            console.log('Comment rejected:', { status: ann.status, visibility: ann.visibility });
            return res.status(403).json({ error: 'Comments allowed only for published announcements with students visibility' });
        }

        const { body } = req.body;
        if (!body || typeof body !== 'string' || !body.trim()) return res.status(400).json({ error: 'Comment body is required' });

        const doc = await Comment.create({ announcementId, authorId: uid, body: body.trim() });
        await Announcement.updateOne({ _id: announcementId }, { $inc: { 'metrics.comments': 1 } });

        // Отримуємо інформацію про користувача
        console.log('Looking for user with ID:', uid);
        const user = await User.findById(uid).select('email displayName');
        console.log('Found user:', user);
        
        // Створюємо об'єкт коментаря з інформацією про автора
        const commentWithAuthor = {
            ...doc.toObject(),
            authorId: {
                _id: user._id,
                email: user.email,
                displayName: user.displayName
            }
        };

        console.log('Created comment with populated author:', {
            id: commentWithAuthor._id,
            authorId: commentWithAuthor.authorId,
            body: commentWithAuthor.body?.substring(0, 20) + '...'
        });
        res.status(201).json(commentWithAuthor);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/announcements/:id/comments', auth, requireVerified, async (req, res) => {
    try {
        const announcementId = req.params.id;
        if (!mongoose.isValidObjectId(announcementId)) return res.status(400).json({ error: 'Invalid announcement id' });

        // Перевіряємо що оголошення існує та має правильний статус
        const ann = await Announcement.findById(announcementId).lean();
        if (!ann) return res.status(404).json({ error: 'Announcement not found' });
        if (ann.status !== 'published' || ann.visibility !== 'students') {
            return res.status(403).json({ error: 'Comments allowed only for published announcements with students visibility' });
        }

        const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
        const showAll = req.query.all === '1' && isAdmin(req.user);

        const query = { announcementId };
        if (!showAll) query.status = 'visible';

        if (req.query.before) {
            const before = new Date(req.query.before);
            if (!isNaN(before)) query.createdAt = { $lt: before };
        }

        const items = await Comment.find(query)
            .populate('authorId', 'email displayName')
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .lean();
        
        console.log('Fetched comments:', items.map(item => ({
            id: item._id,
            authorId: item.authorId,
            body: item.body?.substring(0, 20) + '...'
        })));
        
        res.json({ items, count: items.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/comments/:id', auth, requireVerified, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

        const doc = await Comment.findById(id);
        if (!doc) return res.status(404).json({ error: 'Not found' });

        const uid = getUid(req.user);
        const isOwner = String(doc.authorId) === uid;
        if (!isOwner && !isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });

        if (typeof req.body.body === 'string' && req.body.body.trim()) doc.body = req.body.body.trim();
        await doc.save();
        res.json(doc);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/comments/:id/moderate', auth, async (req, res) => {
    try {
        if (!isAdmin(req.user)) return res.status(403).json({ error: 'Admin role required' });
        const id = req.params.id;
        const { action } = req.body;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
        if (!['hide','unhide'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

        const doc = await Comment.findById(id);
        if (!doc) return res.status(404).json({ error: 'Not found' });

        const prev = doc.status;
        doc.status = action === 'hide' ? 'hidden' : 'visible';
        await doc.save();

        if (prev !== doc.status) {
            const delta = doc.status === 'visible' ? 1 : -1;
            await Announcement.updateOne({ _id: doc.announcementId }, { $inc: { 'metrics.comments': delta } });
        }

        res.json(doc);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/comments/:id', auth, requireVerified, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

        const doc = await Comment.findById(id);
        if (!doc) return res.status(404).json({ error: 'Not found' });

        const uid = getUid(req.user);
        const isOwner = String(doc.authorId) === uid;
        if (!isOwner && !isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden' });

        await Comment.deleteOne({ _id: id });
        if (doc.status === 'visible') {
            await Announcement.updateOne({ _id: doc.announcementId }, { $inc: { 'metrics.comments': -1 } });
        }

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
