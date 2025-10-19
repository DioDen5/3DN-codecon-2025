import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import allowed from '../config/allowed-edu-domains.json' with { type: 'json' };
import { signJwt, verifyJwt } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
});

function isAllowedEduEmail(email) {
    const domain = email.trim().toLowerCase().split('@')[1] ?? '';
    return allowed.some(d => domain === d || domain.endsWith(`.${d}`));
}

function setRefreshCookie(res, token) {
    const prod = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: prod ? 'none' : 'lax',
        secure: prod,
        path: '/api/auth',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
}

router.post('/register', async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid input' });

    const { email, password, displayName, firstName, lastName } = parse.data;

    if (!isAllowedEduEmail(email)) {
        return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        email, passwordHash, displayName, firstName, lastName,
        role: 'student',
        status: 'pending'
    });

    const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
    const refresh = signJwt({ id: user._id }, 'refresh');

    setRefreshCookie(res, refresh);

    return res.status(201).json({
        token: access,
        user: { id: user._id, displayName, role: user.role, status: user.status }
    });
});

router.post('/login', async (req, res) => {
    const { email, password, rememberMe } = req.body ?? {};

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Оновлюємо налаштування rememberMe та зберігаємо email
    user.rememberMe = rememberMe || false;
    user.lastLoginEmail = rememberMe ? email : null;
    await user.save();

    const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
    const refresh = signJwt({ id: user._id }, 'refresh');

    setRefreshCookie(res, refresh);

    return res.json({
        token: access,
        user: { id: user._id, displayName: user.displayName, role: user.role, status: user.status },
        rememberMe: user.rememberMe,
        lastLoginEmail: user.lastLoginEmail
    });
});


router.post('/refresh', async (req, res) => {
    const token = req.cookies?.refreshToken || null;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = verifyJwt(token, 'refresh');
    if (!payload?.id) return res.status(401).json({ error: 'Invalid refresh' });

    // Отримуємо актуальну інформацію про користувача
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    console.log('Token refresh for user:', { id: user._id, role: user.role, status: user.status });

    const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');

    const newRefresh = signJwt({ id: user._id }, 'refresh');
    setRefreshCookie(res, newRefresh);

    return res.json({ token: access });
});


router.post('/logout', (_req, res) => {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.json({ ok: true });
});

// Новий endpoint для отримання збережених даних логіну
router.get('/remembered-login', async (req, res) => {
    try {
        // Шукаємо користувача, який має активне rememberMe
        const user = await User.findOne({ 
            rememberMe: true, 
            lastLoginEmail: { $exists: true, $ne: null } 
        });
        
        if (!user) {
            return res.json({ email: null, rememberMe: false });
        }

        return res.json({ 
            email: user.lastLoginEmail, 
            rememberMe: user.rememberMe 
        });
    } catch (error) {
        console.error('Error fetching remembered login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
