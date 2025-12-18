import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function createTestTeacher() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Email для тестування - Teacher профіль створений адміном
        const testEmail = 'test.teacher@lnu.edu.ua';
        
        // Перевіримо чи вже існує
        const existing = await Teacher.findOne({ email: testEmail });
        if (existing) {
            console.log('⚠️  Teacher профіль з таким email вже існує:', existing._id);
            console.log('   Якщо хочете створити новий, видаліть старий спочатку');
            process.exit(0);
        }
        
        // Створюємо Teacher профіль БЕЗ userId (якщо створений адміном)
        const teacher = await Teacher.create({
            name: 'Тестовий Викладач Для Перевірки',
            email: testEmail,
            university: 'ЛНУ ім. І. Франка',
            department: 'Тестової кафедри',
            subject: 'Тестування',
            subjects: ['Тестування'],
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
            status: 'verified', // Адмін створив, тому verified
            userId: null, // НЕ прив'язаний до User - це ключове для тестування!
            rating: 0,
            likes: 0,
            dislikes: 0,
            comments: 0,
            totalVotes: 0
        });
        
        console.log('✅ Створено тестовий Teacher профіль:');
        console.log('   Email:', teacher.email);
        console.log('   Name:', teacher.name);
        console.log('   Status:', teacher.status);
        console.log('   userId:', teacher.userId, '(null - не прив\'язаний до User)');
        console.log('');
        console.log('📝 Тепер можна тестувати:');
        console.log('   1. Відкрийте форму реєстрації');
        console.log('   2. Оберіть роль "Викладач"');
        console.log('   3. Введіть email:', testEmail);
        console.log('   4. Натисніть "Перевірити email"');
        console.log('   5. Очікується: форма входу з кодом');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test teacher:', error);
        process.exit(1);
    }
}

createTestTeacher();

