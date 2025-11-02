import express from 'express';
import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';
import { TeacherClaimRequest } from '../models/TeacherClaimRequest.js';
import { Reaction } from '../models/Reaction.js';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
        console.log('Teachers route hit:', req.url);
        try {
            const { q, page = 1, limit = 8, sort = 'rating', university, faculty, department, subject } = req.query;
            const skip = (page - 1) * limit;

            let filter = {};

            if (q) {
                const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                        filter = {
                            $or: [
                                { name: { $regex: searchRegex } },
                                { university: { $regex: searchRegex } },
                                { faculty: { $regex: searchRegex } },
                                { department: { $regex: searchRegex } },
                                { subject: { $regex: searchRegex } }
                            ]
                        };
            }

                    if (university) {
                        filter.university = university;
                    }

                    if (faculty) {
                        filter.faculty = faculty;
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

// ВАЖЛИВО: специфічні роути мають бути ПЕРЕД параметризованими (/:id)
// Отримати свій Teacher профіль (якщо є) - ПЕРЕД /:id
router.get('/my-profile', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can access this endpoint' });
        }
        
        // Безпечно конвертуємо userId в ObjectId
        let teacher = null;
        try {
            const userIdObjectId = userId instanceof mongoose.Types.ObjectId 
                ? userId 
                : new mongoose.Types.ObjectId(userId);
            teacher = await Teacher.findOne({ userId: userIdObjectId });
        } catch (findError) {
            console.error('Error finding teacher:', findError);
            return res.json({ teacher: null, hasClaimRequest: false });
        }
        
        if (!teacher) {
            return res.json({ teacher: null, hasClaimRequest: false });
        }
        
        // Перевіряємо чи є активна заявка (безпечно)
        let hasClaimRequest = false;
        try {
            hasClaimRequest = await TeacherClaimRequest.exists({
                userId: new mongoose.Types.ObjectId(userId),
                status: 'pending'
            }) || false;
        } catch (claimRequestError) {
            console.error('Error checking claim request:', claimRequestError);
            hasClaimRequest = false;
        }
        
        // Безпечне обчислення рейтингу
        let rating = 0;
        try {
            rating = teacher.calculateRating ? teacher.calculateRating() : (teacher.rating || 0);
        } catch (ratingError) {
            console.error('Error calculating rating:', ratingError);
            rating = teacher.rating || 0;
        }
        
        // Безпечно конвертуємо teacher в об'єкт
        let teacherWithRating;
        try {
            // Спробуємо різні способи конвертації
            let teacherObject;
            if (teacher.toObject && typeof teacher.toObject === 'function') {
                teacherObject = teacher.toObject({ virtuals: true });
            } else if (teacher.toJSON && typeof teacher.toJSON === 'function') {
                teacherObject = teacher.toJSON();
            } else {
                // Якщо методи не працюють, використовуємо JSON parse/stringify
                teacherObject = JSON.parse(JSON.stringify(teacher));
            }
            
            teacherWithRating = {
                ...teacherObject,
                rating: rating
            };
        } catch (toObjectError) {
            console.error('Error converting teacher to object:', toObjectError);
            // Якщо всі методи не працюють, використовуємо явне вказання полів
                teacherWithRating = {
                    _id: teacher._id.toString(),
                    name: teacher.name || '',
                    email: teacher.email || '',
                    university: teacher.university || '',
                    faculty: teacher.faculty || '',
                    department: teacher.department || '',
                    subject: teacher.subject || '',
                    subjects: teacher.subjects || [],
                    image: teacher.image || '',
                    bio: teacher.bio || '',
                    status: teacher.status || 'pending',
                    userId: teacher.userId ? teacher.userId.toString() : null,
                    rating: rating,
                    likes: teacher.likes || 0,
                dislikes: teacher.dislikes || 0,
                comments: teacher.comments || 0,
                totalVotes: teacher.totalVotes || 0,
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt
            };
        }
        
        res.json({ teacher: teacherWithRating, hasClaimRequest: !!hasClaimRequest });
    } catch (error) {
        console.error('Get my profile error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to fetch profile', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
        const { name, university, faculty, department, subject, image, email } = req.body;
        
        const teacher = new Teacher({
            name,
            university,
            faculty,
            department: department || null,
            subject,
            image,
            email: email ? email.toLowerCase().trim() : null
        });
        
        await teacher.save();
        res.status(201).json(teacher);
    } catch (error) {
        console.error('Create teacher error:', error);
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

// Створити заявку на отримання Teacher профілю
router.post('/claim', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { teacherId } = req.body;
        
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can create claim requests' });
        }
        
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }
        
        // Перевіряємо чи вже є прив'язаний профіль
        const existingTeacher = await Teacher.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (existingTeacher) {
            return res.status(400).json({ error: 'You already have a teacher profile' });
        }
        
        // Перевіряємо чи Teacher існує
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        // Перевіряємо чи Teacher вже прив'язаний
        if (teacher.userId) {
            return res.status(400).json({ error: 'This teacher profile is already claimed' });
        }
        
        // Перевіряємо чи вже є активна заявка від цього користувача
        const existingRequest = await TeacherClaimRequest.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            teacherId: new mongoose.Types.ObjectId(teacherId),
            status: 'pending'
        });
        
        if (existingRequest) {
            return res.status(400).json({ error: 'You already have a pending claim request for this teacher' });
        }
        
        // Отримуємо дані користувача
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Створюємо заявку
        const claimRequest = await TeacherClaimRequest.create({
            teacherId: new mongoose.Types.ObjectId(teacherId),
            userId: new mongoose.Types.ObjectId(userId),
            userEmail: user.email,
            teacherName: teacher.name
        });
        
        res.status(201).json({
            message: 'Claim request created successfully',
            request: claimRequest
        });
    } catch (error) {
        console.error('Create claim request error:', error);
        res.status(500).json({ error: 'Failed to create claim request' });
    }
});

// Отримати список заявок користувача
router.get('/claim/my-requests', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can access this endpoint' });
        }
        
        const requests = await TeacherClaimRequest.find({
            userId: new mongoose.Types.ObjectId(userId)
        })
        .populate('teacherId', 'name university department subject')
        .sort({ createdAt: -1 });
        
        res.json({ requests });
    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Встановити пароль для викладача
router.post('/set-password', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can set password' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Пароль повинен містити мінімум 8 символів' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bcrypt = (await import('bcrypt')).default;
        const teacherPasswordHash = await bcrypt.hash(password, 10);

        user.teacherPassword = teacherPasswordHash;
        user.teacherPasswordSetAt = new Date();
        await user.save();

        res.json({ 
            message: 'Пароль успішно встановлено. Тепер ви можете входити як за кодом, так і за паролем' 
        });
    } catch (error) {
        console.error('Set teacher password error:', error);
        res.status(500).json({ error: 'Failed to set password' });
    }
});

// Оновити профіль викладача
router.put('/my-profile', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can update profile' });
        }

        const teacher = await Teacher.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher profile not found' });
        }

        const { 
            firstName, 
            lastName, 
            middleName, 
            displayName,
            university, 
            faculty,
            department, 
            subjects, 
            image, 
            bio 
        } = req.body;

        const updates = {};
        const pendingChanges = {};

        if (firstName !== undefined || lastName !== undefined || middleName !== undefined || displayName !== undefined) {
            const name = `${firstName || teacher.name.split(' ')[0]} ${middleName || ''} ${lastName || teacher.name.split(' ').slice(-1)[0]}`.trim();
            if (teacher.status === 'verified') {
                pendingChanges.name = name;
                pendingChanges.firstName = firstName;
                pendingChanges.lastName = lastName;
                pendingChanges.middleName = middleName;
                pendingChanges.displayName = displayName;
            } else {
                updates.name = name;
            }
        }

        if (university !== undefined) {
            if (teacher.status === 'verified') {
                pendingChanges.university = university;
            } else {
                updates.university = university;
            }
        }

        if (faculty !== undefined) {
            if (teacher.status === 'verified') {
                pendingChanges.faculty = faculty;
            } else {
                updates.faculty = faculty;
            }
        }

        if (department !== undefined) {
            if (teacher.status === 'verified') {
                pendingChanges.department = department;
            } else {
                updates.department = department || null; // Опціональне поле
            }
        }

        if (subjects !== undefined && Array.isArray(subjects)) {
            if (teacher.status === 'verified') {
                pendingChanges.subjects = subjects;
                pendingChanges.subject = subjects.length > 0 ? subjects[0] : '';
            } else {
                updates.subjects = subjects;
                updates.subject = subjects.length > 0 ? subjects[0] : '';
            }
        }

        if (image !== undefined) {
            if (teacher.status === 'verified') {
                pendingChanges.image = image;
            } else {
                updates.image = image;
            }
        }

        if (bio !== undefined) {
            if (teacher.status === 'verified') {
                pendingChanges.bio = bio;
            } else {
                updates.bio = bio;
            }
        }

        if (teacher.status === 'verified' && Object.keys(pendingChanges).length > 0) {
            teacher.pendingChanges = pendingChanges;
            teacher.lastEditedAt = new Date();
            await teacher.save();
            return res.json({
                message: 'Ваші зміни збережено. Адміністратор перевірить їх найближчим часом',
                pendingChanges
            });
        }

        if (Object.keys(updates).length > 0) {
            Object.assign(teacher, updates);
            teacher.lastEditedAt = new Date();
            await teacher.save();
        }

        const teacherWithRating = {
            ...teacher.toObject(),
            rating: teacher.calculateRating()
        };

        res.json({
            message: 'Профіль успішно оновлено',
            teacher: teacherWithRating
        });
    } catch (error) {
        console.error('Update teacher profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Отримати зміни що очікують модерації
router.get('/my-profile/pending-changes', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can access this endpoint' });
        }

        const teacher = await Teacher.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher profile not found' });
        }

        res.json({
            pendingChanges: teacher.pendingChanges || null,
            hasPendingChanges: !!teacher.pendingChanges
        });
    } catch (error) {
        console.error('Get pending changes error:', error);
        res.status(500).json({ error: 'Failed to fetch pending changes' });
    }
});

export default router;
