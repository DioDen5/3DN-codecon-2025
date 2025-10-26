import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UserProfile } from '../models/UserProfile.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profile-pictures';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.post('/profile-picture', authRequired, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${req.file.filename}`;
        
        let userProfile = await UserProfile.findOne({ userId: req.user.id });
        
        if (userProfile) {
            if (userProfile.profilePicture) {
                // Витягуємо назву файлу з URL
                const oldFileName = userProfile.profilePicture.split('/').pop();
                const oldFilePath = path.join(process.cwd(), 'uploads', 'profile-pictures', oldFileName);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            userProfile.profilePicture = profilePictureUrl;
            await userProfile.save();
        } else {
            userProfile = new UserProfile({
                userId: req.user.id,
                profilePicture: profilePictureUrl
            });
            await userProfile.save();
        }

        res.json({
            success: true,
            profilePictureUrl: profilePictureUrl
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

router.delete('/profile-picture', authRequired, async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ userId: req.user.id });
        
        if (userProfile && userProfile.profilePicture) {
            // Витягуємо назву файлу з URL
            const fileName = userProfile.profilePicture.split('/').pop();
            const filePath = path.join(process.cwd(), 'uploads', 'profile-pictures', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            userProfile.profilePicture = null;
            await userProfile.save();
        }

        res.json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile picture:', error);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
});

router.get('/profile', authRequired, async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ userId: req.user.id });
        
        res.json({
            success: true,
            profile: userProfile || {
                userId: req.user.id,
                profilePicture: null,
                bio: '',
                socialLinks: {},
                preferences: {
                    theme: 'auto',
                    notifications: {
                        email: true,
                        push: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

export default router;
