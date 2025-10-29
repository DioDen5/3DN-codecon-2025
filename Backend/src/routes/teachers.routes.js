import express from 'express';
import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';
import { Reaction } from '../models/Reaction.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
        console.log('Teachers route hit:', req.url);
        try {
            const { q, page = 1, limit = 8, sort = 'rating', university, department, subject } = req.query;
            const skip = (page - 1) * limit;

            let filter = {};

            if (q) {
                const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                filter = {
                    $or: [
                        { name: { $regex: searchRegex } },
                        { university: { $regex: searchRegex } },
                        { department: { $regex: searchRegex } },
                        { subject: { $regex: searchRegex } }
                    ]
                };
            }

            if (university) {
                filter.university = university;
            }

            if (department) {
                filter.department = department;
            }

            if (subject) {
                filter.subject = subject;
            }

            let sortOptions = {};
            switch (sort) {
                case 'rating':
                    sortOptions = { rating: -1 };
                    break;
                case 'likes':
                    sortOptions = { likes: -1 };
                    break;
                case 'comments':
                    sortOptions = { comments: -1 };
                    break;
                default:
                    sortOptions = { rating: -1 };
            }

            const teachers = await Teacher.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit));

            const teachersWithRating = teachers.map(teacher => {
                const rating = teacher.calculateRating();
                return {
                    ...teacher.toObject(),
                    rating: rating
                };
            });

            const total = await Teacher.countDocuments(filter);

            res.json({
                teachers: teachersWithRating,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Teachers fetch error:', error);
            res.status(500).json({ error: 'Failed to fetch teachers' });
        }
    });

router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        const teacherWithRating = {
            ...teacher.toObject(),
            rating: teacher.calculateRating()
        };
        
        res.json(teacherWithRating);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teacher' });
    }
});

router.post('/', authRequired, async (req, res) => {
    try {
        const { name, university, department, subject, image } = req.body;
        
        const teacher = new Teacher({
            name,
            university,
            department,
            subject,
            image
        });
        
        await teacher.save();
        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create teacher' });
    }
});

router.post('/:id/vote', authRequired, async (req, res) => {
    try {
        console.log('Vote request:', req.params, req.body, req.user);
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.user.id;
        
        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }
        
        const existingReaction = await Reaction.findOne({
            targetType: 'teacher',
            targetId: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId)
        });
        
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        let newValue = type === 'like' ? 1 : -1;
        let userReaction = 0;
        
        if (existingReaction) {
            if (existingReaction.value === newValue) {
                await Reaction.findByIdAndDelete(existingReaction._id);
                teacher.likes -= type === 'like' ? 1 : 0;
                teacher.dislikes -= type === 'dislike' ? 1 : 0;
                teacher.totalVotes -= 1;
                userReaction = 0;
            } else {
                const oldValue = existingReaction.value;
                existingReaction.value = newValue;
                await existingReaction.save();
                
                teacher.likes -= oldValue === 1 ? 1 : 0;
                teacher.dislikes -= oldValue === -1 ? 1 : 0;
                
                teacher.likes += newValue === 1 ? 1 : 0;
                teacher.dislikes += newValue === -1 ? 1 : 0;
                
                userReaction = newValue;
            }
        } else {
            await Reaction.create({
                targetType: 'teacher',
                targetId: new mongoose.Types.ObjectId(id),
                userId: new mongoose.Types.ObjectId(userId),
                value: newValue
            });
            teacher.likes += type === 'like' ? 1 : 0;
            teacher.dislikes += type === 'dislike' ? 1 : 0;
            teacher.totalVotes += 1;
            userReaction = newValue;
        }
        
        teacher.rating = teacher.calculateRating();
        await teacher.save();
        
        res.json({
            teacher,
            userReaction,
            message: 'Vote updated successfully'
        });
        } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: 'Failed to vote', details: error.message });
    }
});

router.get('/:id/reactions', authRequired, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const reactions = await Reaction.aggregate([
            { $match: { targetType: 'teacher', targetId: new mongoose.Types.ObjectId(id) } },
            { $group: { 
                _id: '$value', 
                count: { $sum: 1 } 
            }}
        ]);
        
        const userReaction = await Reaction.findOne({
            targetType: 'teacher',
            targetId: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId)
        });
        
        const counts = {
            likes: 0,
            dislikes: 0,
            userReaction: userReaction ? userReaction.value : 0
        };
        
        reactions.forEach(reaction => {
            if (reaction._id === 1) counts.likes = reaction.count;
            if (reaction._id === -1) counts.dislikes = reaction.count;
        });
        
        res.json(counts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reactions' });
    }
});

export default router;
