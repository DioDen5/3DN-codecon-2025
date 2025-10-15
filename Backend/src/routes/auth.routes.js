import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import allowed from '../config/allowed-edu-domains.json' with { type: 'json' };
import { signJwt } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2)
});

function isAllowedEduEmail(email) {
    const domain = email.trim().toLowerCase().split('@')[1] ?? '';
    return allowed.some(d => domain === d || domain.endsWith(`.${d}`));
    // приклад: sub.kpi.ua теж пройде
}

router.post('/register', async (req,res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({error:'Invalid input'});

    const { email, password, displayName } = parse.data;
    if (!isAllowedEduEmail(email)) {
        return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({error:'Email already used'});

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        email, passwordHash, displayName,
        role: 'student',
        status: 'pending' // далі адмін/AI верифікує
    });

    const token = signJwt({ id: user._id, role: user.role, status: user.status });
    res.status(201).json({ token, user: { id: user._id, displayName, role: user.role, status: user.status } });
});

router.post('/login', async (req,res) => {
    const { email, password } = req.body ?? {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({error:'Invalid credentials'});

    const token = signJwt({ id: user._id, role: user.role, status: user.status });
    res.json({ token, user: { id: user._id, displayName: user.displayName, role: user.role, status: user.status } });
});

export default router;
