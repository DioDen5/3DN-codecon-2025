import mongoose from 'mongoose';
import { Teacher } from './models/Teacher.js';
import { connectDB } from './config/db.js';

const teachersData = [
    {
        name: 'Костів Оксана Миколаївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Кафедра української мови',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Іваненко Ігор Петрович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Фізика',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Сидоренко Іван Олексійович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Право',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Литвин Андрій Васильович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Інформатика',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Петренко Ольга Степанівна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Психологія',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Коваленко Максим Сергійович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Соціологія',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Ткачук Ірина Миколаївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Англійська мова',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Гриценко Олег Іванович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Філософія',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Мельник Світлана Анатоліївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Економіка',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        totalVotes: 0
    },
    {
        name: 'Семенюк Володимир Степанович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Політологія',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
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
