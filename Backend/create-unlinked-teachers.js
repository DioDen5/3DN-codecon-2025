import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

/**
 * Скрипт для створення 5 тестових акаунтів викладачів
 * Які створені в системі (Teacher profile), але User не підв'язаний (userId: null)
 * Для тестування входу через PIN код з email
 */

const unlinkedTeachers = [
    {
        name: 'Коваленко Олександр Петрович',
        email: 'test.pin.teacher1@lnu.edu.ua',
        university: 'ЛНУ ім. І. Франка',
        faculty: 'Філологічний',
        department: 'Кафедра української мови',
        subjects: ['Українська мова', 'Література'],
        position: 'Доцент',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        bio: 'Досвідчений викладач української мови та літератури з 15-річним стажем. Спеціалізується на сучасній українській літературі.',
        phone: '+380501234567',
        status: 'pending',
        userId: null,
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Мельник Марія Іванівна',
        email: 'test.pin.teacher2@lnu.edu.ua',
        university: 'ЛНУ ім. І. Франка',
        faculty: 'Математичний',
        department: 'Кафедра математичного аналізу',
        subjects: ['Математичний аналіз', 'Диференціальні рівняння'],
        position: 'Професор',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        bio: 'Професор математики з 20-річним досвідом. Авторка численних наукових праць з математичного аналізу.',
        phone: '+380502345678',
        status: 'pending',
        userId: null,
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Шевченко Андрій Володимирович',
        email: 'test.pin.teacher3@lnu.edu.ua',
        university: 'Львівська політехніка',
        faculty: 'Комп\'ютерних наук',
        department: 'Кафедра програмної інженерії',
        subjects: ['Програмування', 'Бази даних', 'Веб-розробка'],
        position: 'Старший викладач',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        bio: 'Спеціаліст з веб-розробки та баз даних. Працює з сучасними технологіями та фреймворками.',
        phone: '+380503456789',
        status: 'pending',
        userId: null,
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Петренко Оксана Степанівна',
        email: 'test.pin.teacher4@lnu.edu.ua',
        university: 'ЛНУ ім. І. Франка',
        faculty: 'Психології',
        department: 'Кафедра загальної психології',
        subjects: ['Загальна психологія', 'Психологія особистості'],
        position: 'Доцент',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        bio: 'Психолог з багаторічним досвідом роботи. Спеціалізується на психології особистості та соціальній психології.',
        phone: null,
        status: 'pending',
        userId: null,
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Бондаренко Дмитро Ігорович',
        email: 'test.pin.teacher5@lnu.edu.ua',
        university: 'ЛНУ ім. І. Франка',
        faculty: 'Економічний',
        department: 'Кафедра економічної теорії',
        subjects: ['Мікроекономіка', 'Макроекономіка'],
        position: 'Професор',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        bio: 'Економіст з великим досвідом викладання та наукової роботи. Спеціалізується на економічній теорії та політиці.',
        phone: '+380504567890',
        status: 'pending',
        userId: null,
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    }
];

async function createUnlinkedTeachers() {
    try {
        console.log('🔌 Підключення до MongoDB...');
        await connectDB();
        
        console.log('\n📝 Створення тестових акаунтів викладачів без підв\'язаного User...\n');
        
        const createdTeachers = [];
        
        for (const teacherData of unlinkedTeachers) {
            // Перевіряємо, чи вже існує викладач з таким email
            const existing = await Teacher.findOne({ email: teacherData.email });
            
            if (existing) {
                console.log(`⚠️  Викладач з email ${teacherData.email} вже існує, пропускаємо`);
                continue;
            }
            
            // Створюємо викладача БЕЗ userId
            const teacher = await Teacher.create({
                ...teacherData,
                subject: teacherData.subjects && teacherData.subjects.length > 0 ? teacherData.subjects[0] : '',
                userId: null // Явно встановлюємо null
            });
            
            createdTeachers.push(teacher);
            console.log(`✅ Створено: ${teacher.name} (${teacher.email})`);
            console.log(`   - userId: ${teacher.userId} (null - не підв'язаний)`);
            console.log(`   - status: ${teacher.status}`);
            console.log('');
        }
        
        console.log(`\n✅ Успішно створено ${createdTeachers.length} тестових акаунтів викладачів`);
        console.log('\n📋 Список створених акаунтів:');
        createdTeachers.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name}`);
            console.log(`   Email: ${teacher.email}`);
            console.log(`   Університет: ${teacher.university}`);
            console.log(`   Факультет: ${teacher.faculty}`);
            console.log(`   userId: ${teacher.userId} (null)`);
            console.log('');
        });
        
        console.log('💡 Для тестування входу через PIN код:');
        console.log('   1. Спробуйте зареєструватися або увійти з email одного з цих викладачів');
        console.log('   2. Система має запропонувати введення PIN коду з email');
        console.log('   3. Після введення PIN коду створиться User і підв\'яжеться до Teacher профілю');
        
    } catch (error) {
        console.error('❌ Помилка створення тестових акаунтів:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 З\'єднання з MongoDB закрито');
        process.exit(0);
    }
}

createUnlinkedTeachers();

