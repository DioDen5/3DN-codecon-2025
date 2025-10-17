import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import allowed from '../config/allowed-edu-domains.json' with { type: 'json' };

import { RefreshToken } from '../models/RefreshToken.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { sha256 } from '../utils/hash.js';

const router = express.Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2)
});

function isAllowedEduEmail(email) {
    const domain = email.trim().toLowerCase().split('@')[1] ?? '';
    return allowed.some(d => domain === d || domain.endsWith(`.${d}`));
}

function setRefreshCookie(res, refreshToken) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:  isProd ? true : false,
        sameSite: isProd ? 'Strict' : 'Lax',
        path: '/api/auth',
        maxAge: 30 * 24 * 3600 * 1000, // 30 днів
    });
}

router.post('/register', async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid input' });

    const { email, password, displayName } = parse.data;
    if (!isAllowedEduEmail(email)) {
        return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already used' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        email, passwordHash, displayName,
        role: 'student',
        status: 'pending',  // як і було
    });

    const access = signAccess({ id: user._id, role: user.role, status: user.status }, '1h');

    res.status(201).json({
        token: access,
        user: { id: user._id, displayName, role: user.role, status: user.status }
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });


    const access  = signAccess({ id: user._id, role: user.role, status: user.status }, '1h');
    const refresh = signRefresh({ id: user._id }, '30d');

    await RefreshToken.create({
        userId: user._id,
        tokenHash: sha256(refresh),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
    });

    setRefreshCookie(res, refresh);

    res.json({
        token: access,
        user: { id: user._id, displayName: user.displayName, role: user.role, status: user.status }
    });
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    try {
        const payload = verifyRefresh(refreshToken); // { id: userId }
        const doc = await RefreshToken.findOne({ tokenHash: sha256(refreshToken), userId: payload.id });
        if (!doc || doc.rotatedAt) return res.status(401).json({ error: 'Invalid/rotated refresh' });
        if (doc.expiresAt < new Date()) return res.status(401).json({ error: 'Expired refresh' });

        doc.rotatedAt = new Date();
        await doc.save();

        const newRefresh = signRefresh({ id: payload.id }, '30d');
        await RefreshToken.create({
            userId: payload.id,
            tokenHash: sha256(newRefresh),
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        });

        const newAccess = signAccess({ id: payload.id }, '1h');
        setRefreshCookie(res, newRefresh);

        res.json({ token: newAccess });
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

router.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies || {};
    if (refreshToken) {
        await RefreshToken.deleteOne({ tokenHash: sha256(refreshToken) });
        res.clearCookie('refreshToken', { path: '/api/auth' });
    }
    res.json({ ok: true });
});

export default router;
