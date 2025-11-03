import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { EmailVerificationCode } from '../models/EmailVerificationCode.js';
import allowed from '../config/allowed-edu-domains.json' with { type: 'json' };
import { signJwt, verifyJwt } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendVerificationCodeEmail } from '../utils/emailService.js';
import { logUserRegistration, logUserVerification } from '../utils/activityLogger.js';
import { checkSessionTimeout, checkIdleTimeout } from '../middleware/sessionTimeout.js';
import { checkLoginAttempts, logLoginAttempt } from '../middleware/loginAttempts.js';

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
    if (!parse.success) {
        const errorMessage = parse.error?.errors?.[0]?.message || 'Invalid input';
        return res.status(400).json({ error: errorMessage });
    }

    const { email, password, displayName, firstName, lastName } = parse.data;

    if (!isAllowedEduEmail(email)) {
        return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
    }

    const isUkrainian = (text) => /^[а-яіїєґА-ЯІЇЄҐ\s]+$/.test(text);
    const isEnglish = (text) => /^[a-zA-Z\s]+$/.test(text);
    
    const firstNameLang = isUkrainian(firstName) ? 'uk' : isEnglish(firstName) ? 'en' : 'mixed';
    const lastNameLang = isUkrainian(lastName) ? 'uk' : isEnglish(lastName) ? 'en' : 'mixed';
    const displayNameLang = isUkrainian(displayName) ? 'uk' : isEnglish(displayName) ? 'en' : 'mixed';
    
    if (firstNameLang === 'mixed' || lastNameLang === 'mixed' || displayNameLang === 'mixed') {
        return res.status(400).json({ error: 'Ім\'я та прізвище мають містити тільки літери однієї мови (української або англійської)' });
    }
    
    if (firstNameLang !== lastNameLang || firstNameLang !== displayNameLang) {
        return res.status(400).json({ error: 'Всі імена мають бути написаними однією мовою (або українською, або англійською)' });
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

    // Логуємо реєстрацію користувача
    await logUserRegistration(user._id, email);

    return res.status(201).json({
        token: access,
        user: { id: user._id, displayName, role: user.role, status: user.status }
    });
});

router.post('/login', checkLoginAttempts, async (req, res) => {
    const { email, password, rememberMe } = req.body ?? {};

    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        const teacher = await Teacher.findOne({ email: normalizedEmail });
        if (teacher && !teacher.userId) {
            await logLoginAttempt(req, res, () => {});
            return res.status(401).json({ 
                error: 'Teacher profile exists',
                requiresCodeVerification: true,
                message: 'Профіль викладача з такою поштою існує. Підтвердіть вхід за кодом'
            });
        }
        
        await logLoginAttempt(req, res, () => {});
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    let passwordToCheck = user.passwordHash;
    if (user.role === 'teacher' && user.teacherPassword) {
        const teacherPasswordOk = await bcrypt.compare(password, user.teacherPassword);
        if (teacherPasswordOk) {
            passwordToCheck = user.teacherPassword;
        }
    }

    const ok = await bcrypt.compare(password, passwordToCheck);
    if (!ok) {
        await logLoginAttempt(req, res, () => {});
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'teacher') {
        const teacher = await Teacher.findOne({ email: normalizedEmail });
        if (teacher && !teacher.userId) {
            teacher.userId = user._id;
            if (teacher.status === 'pending' && user.status === 'verified') {
                teacher.status = 'verified';
            }
            await teacher.save();
        }
    }

    user.rememberMe = rememberMe || false;
    user.lastLoginEmail = rememberMe ? normalizedEmail : null;
    await user.save();

    let teacherProfile = null;
    if (user.role === 'teacher') {
        const existingTeacher = await Teacher.findOne({ userId: user._id });
        if (existingTeacher) {
            teacherProfile = {
                id: existingTeacher._id,
                name: existingTeacher.name,
                university: existingTeacher.university,
                department: existingTeacher.department,
                subjects: existingTeacher.subjects || [existingTeacher.subject].filter(Boolean),
                status: existingTeacher.status
            };
        }
    }

    const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
    const refresh = signJwt({ id: user._id }, 'refresh');

    setRefreshCookie(res, refresh);

    await logLoginAttempt(req, res, () => {});
    
    return res.json({
        token: access,
        user: { id: user._id, displayName: user.displayName, role: user.role, status: user.status },
        rememberMe: user.rememberMe,
        lastLoginEmail: user.lastLoginEmail,
        teacherProfile
    });
});


router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || null;
        if (!token) return res.status(401).json({ error: 'No refresh token' });

        let payload = null;
        try {
            payload = verifyJwt(token, 'refresh');
        } catch (e) {
            console.warn('Invalid refresh token:', e?.message || e);
            return res.status(401).json({ error: 'Invalid refresh' });
        }

        if (!payload?.id) return res.status(401).json({ error: 'Invalid refresh' });

        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ error: 'User not found' });

        console.log('Token refresh for user:', { id: user._id, role: user.role, status: user.status });

        const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
        const newRefresh = signJwt({ id: user._id }, 'refresh');
        setRefreshCookie(res, newRefresh);

        return res.json({ token: access });
    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
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

const forgotPasswordSchema = z.object({
    email: z.string().email()
});

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8)
});

router.post('/forgot-password', async (req, res) => {
    try {
        const parse = forgotPasswordSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const { email } = parse.data;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ 
                message: 'Якщо акаунт з такою поштою існує, ми надішлемо інструкції для відновлення пароля' 
            });
        }

        const token = PasswordResetToken.generateToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

        await PasswordResetToken.create({
            userId: user._id,
            token,
            expiresAt
        });

        const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5176'}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetUrl, user.displayName);

        return res.json({ 
            message: 'Якщо акаунт з такою поштою існує, ми надішлемо інструкції для відновлення пароля' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/profile', async (req, res) => {
    try {
        const { firstName, lastName, displayName } = req.body;
        
        if (!firstName || !lastName || !displayName) {
            return res.status(400).json({ error: 'Всі поля обов\'язкові' });
        }

        const isUkrainian = (text) => /^[а-яіїєґА-ЯІЇЄҐ\s]+$/.test(text);
        const isEnglish = (text) => /^[a-zA-Z\s]+$/.test(text);
        
        const firstNameLang = isUkrainian(firstName) ? 'uk' : isEnglish(firstName) ? 'en' : 'mixed';
        const lastNameLang = isUkrainian(lastName) ? 'uk' : isEnglish(lastName) ? 'en' : 'mixed';
        const displayNameLang = isUkrainian(displayName) ? 'uk' : isEnglish(displayName) ? 'en' : 'mixed';
        
        if (firstNameLang === 'mixed' || lastNameLang === 'mixed' || displayNameLang === 'mixed') {
            return res.status(400).json({ error: 'Ім\'я та прізвище мають містити тільки літери однієї мови (української або англійської)' });
        }
        
        if (firstNameLang !== lastNameLang || firstNameLang !== displayNameLang) {
            return res.status(400).json({ error: 'Всі імена мають бути написаними однією мовою (або українською, або англійською)' });
        }

        // Тут треба буде додати авторизацію та оновлення користувача
        // Поки що просто повертаємо успіх
        return res.json({ message: 'Профіль оновлено успішно' });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register/check-email', async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ error: 'Email та роль обов\'язкові' });
        }

        if (role !== 'teacher') {
            return res.status(400).json({ error: 'Цей endpoint тільки для викладачів' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!isAllowedEduEmail(normalizedEmail)) {
            return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            console.log(`[check-email] User exists for ${normalizedEmail}`);
            return res.status(409).json({ 
                error: 'Email already used',
                exists: true,
                userExists: true
            });
        }

        const existingTeacher = await Teacher.findOne({ email: normalizedEmail });
        if (existingTeacher) {
            console.log(`[check-email] Teacher profile exists for ${normalizedEmail}, userId: ${existingTeacher.userId}`);
            return res.json({
                exists: true,
                teacherExists: true,
                message: 'Профіль викладача з такою поштою вже існує в системі'
            });
        }

        return res.json({
            exists: false,
            canRegister: true
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const teacherRegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    middleName: z.string().optional(),
    phone: z.string().min(10).max(20).optional(),
    university: z.string().min(2),
    faculty: z.string().min(2), // Обов'язкове поле
    department: z.string().min(2).optional(), // Тепер опціональне
    subjects: z.array(z.string().min(1)).min(1),
    image: z.string().min(1), // Обов'язкове поле, може бути URL або base64 рядок
    bio: z.string().min(10).max(500), // Обов'язкове поле, мінімум 10 символів
    position: z.string().min(2) // Академічна посада (обов'язкове поле)
});

router.post('/register/teacher', async (req, res) => {
    try {
        console.log('Received registration data:', {
            email: req.body.email,
            hasPassword: !!req.body.password,
            displayName: req.body.displayName,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            middleName: req.body.middleName,
            phone: req.body.phone,
            university: req.body.university,
            faculty: req.body.faculty,
            department: req.body.department,
            subjectsCount: req.body.subjects?.length,
            hasImage: !!req.body.image,
            imageLength: req.body.image?.length,
            bio: req.body.bio?.substring(0, 50) + '...',
            position: req.body.position
        });
        
        const parse = teacherRegisterSchema.safeParse(req.body);
        if (!parse.success) {
            console.error('Validation error details:', JSON.stringify(parse.error.errors, null, 2));
            console.error('Request body keys:', Object.keys(req.body));
            console.error('Request body values:', {
                hasEmail: !!req.body.email,
                hasPassword: !!req.body.password,
                hasFirstName: !!req.body.firstName,
                hasLastName: !!req.body.lastName,
                hasPhone: !!req.body.phone,
                hasUniversity: !!req.body.university,
                hasFaculty: !!req.body.faculty,
                hasSubjects: !!req.body.subjects,
                hasImage: !!req.body.image,
                hasBio: !!req.body.bio,
                hasPosition: !!req.body.position,
                position: req.body.position
            });
            const errorMessage = parse.error?.errors?.[0]?.message || 'Invalid input';
            const errorPath = parse.error?.errors?.[0]?.path?.join('.') || 'unknown';
            return res.status(400).json({ 
                error: errorMessage,
                field: errorPath,
                errors: parse.error.errors
            });
        }

        const { email, password, displayName, firstName, lastName, middleName, phone, university, faculty, department, subjects, image, bio, position } = parse.data;

        const normalizedEmail = email.toLowerCase().trim();

        if (!isAllowedEduEmail(normalizedEmail)) {
            return res.status(400).json({ error: 'Реєстрація дозволена тільки з корпоративної пошти університету' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already used' });
        }

        const existingTeacher = await Teacher.findOne({ email: normalizedEmail });
        if (existingTeacher) {
            return res.status(409).json({ 
                error: 'Teacher profile already exists',
                requiresVerification: true
            });
        }

        const isUkrainian = (text) => /^[а-яіїєґА-ЯІЇЄҐ\s]+$/.test(text);
        const isEnglish = (text) => /^[a-zA-Z\s]+$/.test(text);
        
        const firstNameLang = isUkrainian(firstName) ? 'uk' : isEnglish(firstName) ? 'en' : 'mixed';
        const lastNameLang = isUkrainian(lastName) ? 'uk' : isEnglish(lastName) ? 'en' : 'mixed';
        const displayNameLang = isUkrainian(displayName) ? 'uk' : isEnglish(displayName) ? 'en' : 'mixed';
        
        if (firstNameLang === 'mixed' || lastNameLang === 'mixed' || displayNameLang === 'mixed') {
            return res.status(400).json({ error: 'Ім\'я та прізвище мають містити тільки літери однієї мови (української або англійської)' });
        }
        
        if (firstNameLang !== lastNameLang || firstNameLang !== displayNameLang) {
            return res.status(400).json({ error: 'Всі імена мають бути написаними однією мовою (або українською, або англійською)' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();

        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
            displayName,
            firstName,
            lastName,
            middleName: middleName || null,
            role: 'teacher',
            status: 'pending'
        });

        // Конвертуємо user._id в ObjectId для коректного зберігання
        const userIdObjectId = user._id instanceof mongoose.Types.ObjectId 
            ? user._id 
            : new mongoose.Types.ObjectId(user._id);

        const teacher = await Teacher.create({
            name,
            university,
            faculty,
            department: department || null, // Опціональне поле
            subjects: subjects || [],
            subject: subjects && subjects.length > 0 ? subjects[0] : '',
            email: normalizedEmail,
            phone: phone || null,
            image: image,
            bio: bio || null,
            position: position || null, // Академічна посада
            status: 'pending',
            userId: userIdObjectId // Зв'язуємо Teacher профіль з User одразу після реєстрації
        });
        
        console.log('Teacher created:', {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            userId: teacher.userId,
            userIdType: typeof teacher.userId,
            userIdString: teacher.userId?.toString(),
            userEmail: normalizedEmail,
            user_id: user._id,
            user_idType: typeof user._id,
            position: teacher.position
        });

        const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
        const refresh = signJwt({ id: user._id }, 'refresh');

        setRefreshCookie(res, refresh);

        await logUserRegistration(user._id, normalizedEmail);

        return res.status(201).json({
            token: access,
            user: { id: user._id, displayName, role: user.role, status: user.status },
            teacher: {
                id: teacher._id,
                status: teacher.status
            },
            message: 'Реєстрацію успішно завершено. Ваш профіль очікує верифікації адміністратором'
        });
    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({ error: 'Failed to register teacher' });
    }
});

router.post('/send-verification-code', async (req, res) => {
    try {
        const { email, type = 'login' } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email обов\'язковий' });
        }

        if (!['login', 'registration'].includes(type)) {
            return res.status(400).json({ error: 'Невірний тип верифікації' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingCode = await EmailVerificationCode.findOne({
            email: normalizedEmail,
            type,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (existingCode && existingCode.blockedUntil && new Date() < existingCode.blockedUntil) {
            const minutesLeft = Math.ceil((existingCode.blockedUntil - new Date()) / (1000 * 60));
            return res.status(429).json({ 
                error: 'Забагато спроб. Спробуйте через ' + minutesLeft + ' хвилин',
                blockedUntil: existingCode.blockedUntil
            });
        }

        if (existingCode) {
            const lastSent = new Date(existingCode.createdAt);
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            if (lastSent > oneMinuteAgo) {
                return res.status(429).json({ 
                    error: 'Код вже надіслано. Спробуйте через хвилину',
                    canResendAt: new Date(lastSent.getTime() + 60 * 1000)
                });
            }
        }

        const code = EmailVerificationCode.generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        if (existingCode) {
            existingCode.code = code;
            existingCode.expiresAt = expiresAt;
            existingCode.used = false;
            existingCode.attempts = 0;
            existingCode.blockedUntil = null;
            await existingCode.save();
        } else {
                await EmailVerificationCode.create({
                    email: normalizedEmail,
                    code,
                    type,
                    expiresAt
                });
            }

            await sendVerificationCodeEmail(normalizedEmail, code, type);

            // В dev режимі повертаємо код у відповіді (тільки для розробки)
            const isDev = process.env.NODE_ENV !== 'production';
            const response = {
                message: 'Код надіслано на пошту',
                expiresAt
            };
            
            if (isDev) {
                response.code = code; // Додаємо код тільки в dev режимі
            }

            return res.json(response);
    } catch (error) {
        console.error('Send verification code error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        const { email, code, type = 'login' } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email та код обов\'язкові' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const verificationCode = await EmailVerificationCode.findOne({
            email: normalizedEmail,
            code,
            type,
            used: false
        });

        if (!verificationCode) {
            const existingCode = await EmailVerificationCode.findOne({
                email: normalizedEmail,
                type,
                used: false
            });

            if (existingCode) {
                await existingCode.incrementAttempts();
                
                if (existingCode.isBlocked()) {
                    const minutesLeft = Math.ceil((existingCode.blockedUntil - new Date()) / (1000 * 60));
                    return res.status(429).json({ 
                        error: 'Перевищено кількість спроб. Спробуйте через ' + minutesLeft + ' хвилин',
                        blockedUntil: existingCode.blockedUntil,
                        attemptsLeft: 5 - existingCode.attempts
                    });
                }

                return res.status(400).json({ 
                    error: 'Невірний код',
                    attemptsLeft: 5 - existingCode.attempts
                });
            }

            return res.status(400).json({ error: 'Код не знайдено' });
        }

        if (verificationCode.isExpired()) {
            return res.status(400).json({ error: 'Код недійсний (прострочений)' });
        }

        if (verificationCode.isBlocked()) {
            const minutesLeft = Math.ceil((verificationCode.blockedUntil - new Date()) / (1000 * 60));
            return res.status(429).json({ 
                error: 'Перевищено кількість спроб. Спробуйте через ' + minutesLeft + ' хвилин',
                blockedUntil: verificationCode.blockedUntil
            });
        }

        await verificationCode.markAsUsed();

        return res.json({
            success: true,
            message: 'Код підтверджено'
        });
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Failed to verify code' });
    }
});

router.post('/login-with-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email та код обов\'язкові' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const verificationCode = await EmailVerificationCode.findOne({
            email: normalizedEmail,
            code,
            type: 'login',
            used: false
        });

        if (!verificationCode || verificationCode.isExpired() || verificationCode.isBlocked()) {
            if (verificationCode && !verificationCode.isExpired()) {
                await verificationCode.incrementAttempts();
            }
            return res.status(400).json({ error: 'Невірний або прострочений код' });
        }

        await verificationCode.markAsUsed();

        const teacher = await Teacher.findOne({ email: normalizedEmail });
        if (!teacher) {
            return res.status(404).json({ error: 'Профіль викладача не знайдено' });
        }

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
            // Розбиваємо ім'я на частини для firstName і lastName
            const nameParts = teacher.name.trim().split(/\s+/);
            const firstName = nameParts[0] || teacher.name || 'Викладач';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : teacher.name || 'Викладач';
            
            user = await User.create({
                email: normalizedEmail,
                passwordHash,
                displayName: firstName,
                firstName: firstName,
                lastName: lastName,
                role: 'teacher',
                status: 'verified'
            });
        }

        if (user.role !== 'teacher') {
            return res.status(403).json({ error: 'Цей акаунт не є акаунтом викладача' });
        }

        if (!teacher.userId) {
            teacher.userId = user._id;
            teacher.status = 'verified';
            // Перевіряємо, чи є обов'язкові поля (якщо їх не було в старих профілях)
            if (!teacher.faculty) {
                teacher.faculty = teacher.department || teacher.university || 'Не вказано';
            }
            // НЕ встановлюємо bio та position автоматично, якщо вони вже є
            // Встановлюємо базові значення тільки якщо поля порожні, щоб уникнути помилок валідації
            if (!teacher.bio || teacher.bio.trim() === '') {
                teacher.bio = `Викладач ${teacher.subject || teacher.subjects?.[0] || 'предмета'} в ${teacher.university}. Маю досвід у навчанні студентів.`;
            }
            // НЕ перезаписуємо position, якщо воно вже встановлено адміном
            // Встановлюємо тільки якщо поле справді порожнє
            if (!teacher.position || teacher.position.trim() === '') {
                teacher.position = 'Викладач'; // Базове значення, якщо не встановлено адміном
            }
            try {
                await teacher.save();
            } catch (saveError) {
                console.error('Error saving teacher after login:', saveError);
                // Якщо помилка через обов'язкові поля, все одно продовжуємо
            }
        }

        user.status = 'verified';
        await user.save();

        const access = signJwt({ id: user._id, role: user.role, status: user.status }, 'access');
        const refresh = signJwt({ id: user._id }, 'refresh');

        setRefreshCookie(res, refresh);

        await logLoginAttempt(req, res, () => {});

        return res.json({
            token: access,
            user: { 
                id: user._id, 
                displayName: user.displayName, 
                role: user.role, 
                status: user.status 
            },
            teacherProfile: {
                id: teacher._id,
                name: teacher.name,
                university: teacher.university,
                department: teacher.department,
                subjects: teacher.subjects || [teacher.subject].filter(Boolean),
                status: teacher.status
            },
            requiresPasswordSetup: !user.teacherPassword // Додаємо флаг якщо потрібно встановити пароль
        });
    } catch (error) {
        console.error('Login with code error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            email: req.body?.email,
            code: req.body?.code
        });
        res.status(500).json({ 
            error: 'Failed to login with code',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const parse = resetPasswordSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const { token, password } = parse.data;

        // Find valid token
        const resetToken = await PasswordResetToken.findOne({ 
            token, 
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({ error: 'Недійсний або прострочений токен' });
        }

        const user = await User.findById(resetToken.userId);
        if (!user) {
            return res.status(400).json({ error: 'Користувач не знайдений' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        user.passwordHash = passwordHash;
        await user.save();

        await resetToken.markAsUsed();

        return res.json({ message: 'Пароль успішно оновлено' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
