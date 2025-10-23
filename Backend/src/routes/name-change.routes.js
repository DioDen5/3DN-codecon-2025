import express from 'express';
import { z } from 'zod';
import { NameChangeRequest } from '../models/NameChangeRequest.js';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Схема валідації для запиту на зміну імені
const nameChangeSchema = z.object({
    newFirstName: z.string().min(2).max(50),
    newLastName: z.string().min(2).max(50),
    reason: z.string().max(500).optional()
});

// Функція для перевірки мови імені
function validateNameLanguage(firstName, lastName) {
    const isUkrainian = (text) => /^[а-яіїєґА-ЯІЇЄҐ\s'-]+$/.test(text);
    const isEnglish = (text) => /^[a-zA-Z\s'-]+$/.test(text);
    
    const firstNameLang = isUkrainian(firstName) ? 'uk' : isEnglish(firstName) ? 'en' : 'mixed';
    const lastNameLang = isUkrainian(lastName) ? 'uk' : isEnglish(lastName) ? 'en' : 'mixed';
    
    if (firstNameLang === 'mixed' || lastNameLang === 'mixed') {
        return { valid: false, error: 'Ім\'я та прізвище мають містити тільки літери однієї мови (української або англійської)' };
    }
    
    if (firstNameLang !== lastNameLang) {
        return { valid: false, error: 'Ім\'я та прізвище мають бути написаними однією мовою (або українською, або англійською)' };
    }
    
    return { valid: true };
}

// Створення запиту на зміну імені
router.post('/request', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { newFirstName, newLastName, reason } = req.body;

        // Валідація даних
        const validationResult = nameChangeSchema.safeParse({
            newFirstName,
            newLastName,
            reason
        });

        if (!validationResult.success) {
            return res.status(400).json({ 
                error: 'Невалідні дані',
                details: validationResult.error.errors 
            });
        }

        // Перевірка мови імені
        const languageValidation = validateNameLanguage(newFirstName, newLastName);
        if (!languageValidation.valid) {
            return res.status(400).json({ error: languageValidation.error });
        }

        // Отримуємо поточні дані користувача
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Користувач не знайдений' });
        }

        // Генеруємо нове відображуване ім'я
        const newDisplayName = `${newFirstName} ${newLastName}`;
        
        // Перевіряємо, чи не змінилося ім'я
        if (user.firstName === newFirstName && user.lastName === newLastName) {
            return res.status(400).json({ error: 'Нове ім\'я ідентичне поточному' });
        }

        // Перевіряємо, чи немає вже активного запиту
        const existingRequest = await NameChangeRequest.findOne({
            userId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                error: 'У вас вже є активний запит на зміну імені',
                requestId: existingRequest._id,
                createdAt: existingRequest.createdAt
            });
        }

        // Створюємо новий запит
        const nameChangeRequest = new NameChangeRequest({
            userId,
            currentFirstName: user.firstName,
            currentLastName: user.lastName,
            currentDisplayName: user.displayName,
            newFirstName,
            newLastName,
            newDisplayName,
            reason: reason || null
        });

        await nameChangeRequest.save();

        return res.json({
            message: 'Запит на зміну імені створено успішно',
            requestId: nameChangeRequest._id,
            status: 'pending',
            estimatedReviewTime: '1-3 робочих дні'
        });

    } catch (error) {
        console.error('Name change request error:', error);
        return res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

// Отримання статусу запиту на зміну імені
router.get('/status', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        const request = await NameChangeRequest.findOne({
            userId,
            status: { $in: ['pending', 'approved', 'rejected'] }
        }).sort({ createdAt: -1 });

        if (!request) {
            return res.json({ 
                hasRequest: false,
                message: 'Немає активних запитів на зміну імені'
            });
        }

        return res.json({
            hasRequest: true,
            request: {
                id: request._id,
                status: request.status,
                newFirstName: request.newFirstName,
                newLastName: request.newLastName,
                newDisplayName: request.newDisplayName,
                reason: request.reason,
                createdAt: request.createdAt,
                reviewedAt: request.reviewedAt,
                reviewComment: request.reviewComment
            }
        });

    } catch (error) {
        console.error('Get name change status error:', error);
        return res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

// Скасування запиту на зміну імені (тільки якщо статус pending)
router.delete('/cancel', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        const request = await NameChangeRequest.findOne({
            userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({ 
                error: 'Активний запит на зміну імені не знайдено' 
            });
        }

        await NameChangeRequest.findByIdAndDelete(request._id);

        return res.json({
            message: 'Запит на зміну імені скасовано успішно'
        });

    } catch (error) {
        console.error('Cancel name change request error:', error);
        return res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

export default router;
