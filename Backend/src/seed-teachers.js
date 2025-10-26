import mongoose from 'mongoose';
import { Teacher } from './models/Teacher.js';
import { connectDB } from './config/db.js';

const teachersData = [
    {
        name: 'Іваненко Ігор Петрович',
        university: 'ЛНУ ім. І. Франка',
        department: 'Фізики',
        subject: 'Фізика',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Сидоренко Іван Олексійович',
        university: 'ЛНУ ім. І. Франка',
        department: 'Правознавства',
        subject: 'Право',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Литвин Андрій Васильович',
        university: 'Львівська політехніка',
        department: 'Інформаційних систем',
        subject: 'Програмування',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Петренко Ольга Степанівна',
        university: 'ЛНУ ім. І. Франка',
        department: 'Психології',
        subject: 'Психологія',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Коваленко Максим Сергійович',
        university: 'ЛНУ ім. І. Франка',
        department: 'Соціології',
        subject: 'Соціологія',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Ткачук Ірина Миколаївна',
        university: 'ЛНУ ім. І. Франка',
        department: 'Іноземних мов',
        subject: 'Англійська мова',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Гриценко Олег Іванович',
        university: 'ЛНУ ім. І. Франка',
        department: 'Філософії',
        subject: 'Філософія',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Семенюк Володимир Степанович',
        university: 'ЛНУ ім. І. Франка',
        department: 'Політології',
        subject: 'Політологія',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Ковальчук Анна Петрівна',
        university: 'Львівська політехніка',
        department: 'Комп\'ютерних наук',
        subject: 'Алгоритми',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Мельник Сергій Олександрович',
        university: 'Львівська політехніка',
        department: 'Математики',
        subject: 'Математика',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Шевченко Оксана Володимирівна',
        university: 'УКУ',
        department: 'Теології',
        subject: 'Теологія',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Бондаренко Дмитро Ігорович',
        university: 'Львівська комерційна академія',
        department: 'Економіки',
        subject: 'Економіка',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    }
];

async function seedTeachers() {
    try {
        await connectDB();
        
        await Teacher.deleteMany({});
        console.log('🗑️  Cleared existing teachers');
        
        const teachers = await Teacher.insertMany(teachersData);
        console.log(`✅ Seeded ${teachers.length} teachers`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding teachers:', error);
        process.exit(1);
    }
}

seedTeachers();