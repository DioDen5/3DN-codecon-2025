import mongoose from 'mongoose';
import { Teacher } from './models/Teacher.js';
import { connectDB } from './config/db.js';

const teachersData = [
    {
        name: 'Костів Оксана Миколаївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Кафедра української мови',
        image: '/assets/v6.jpg',
        rating: 9.0,
        likes: 33,
        dislikes: 6,
        comments: 22,
        totalVotes: 39
    },
    {
        name: 'Іваненко Ігор Петрович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Фізика',
        image: '/assets/4v.jpg',
        rating: 8.7,
        likes: 21,
        dislikes: 3,
        comments: 18,
        totalVotes: 24
    },
    {
        name: 'Сидоренко Іван Олексійович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Право',
        image: '/assets/v-8.jpeg',
        rating: 9.3,
        likes: 44,
        dislikes: 4,
        comments: 27,
        totalVotes: 48
    },
    {
        name: 'Литвин Андрій Васильович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Інформатика',
        image: '/assets/v7.jpg',
        rating: 8.9,
        likes: 28,
        dislikes: 5,
        comments: 19,
        totalVotes: 33
    },
    {
        name: 'Петренко Ольга Степанівна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Психологія',
        image: '/assets/icon.jpg',
        rating: 9.1,
        likes: 39,
        dislikes: 2,
        comments: 25,
        totalVotes: 41
    },
    {
        name: 'Коваленко Максим Сергійович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Соціологія',
        image: '/assets/icon.jpg',
        rating: 8.4,
        likes: 19,
        dislikes: 6,
        comments: 10,
        totalVotes: 25
    },
    {
        name: 'Ткачук Ірина Миколаївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Англійська мова',
        image: '/assets/icon.jpg',
        rating: 9.0,
        likes: 30,
        dislikes: 3,
        comments: 21,
        totalVotes: 33
    },
    {
        name: 'Гриценко Олег Іванович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Філософія',
        image: '/assets/icon.jpg',
        rating: 8.8,
        likes: 25,
        dislikes: 4,
        comments: 15,
        totalVotes: 29
    },
    {
        name: 'Мельник Світлана Анатоліївна',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Економіка',
        image: '/assets/icon.jpg',
        rating: 9.2,
        likes: 41,
        dislikes: 1,
        comments: 30,
        totalVotes: 42
    },
    {
        name: 'Семенюк Володимир Степанович',
        university: 'ЛНУ імені Івана Франка',
        subject: 'Політологія',
        image: '/assets/icon.jpg',
        rating: 8.6,
        likes: 20,
        dislikes: 5,
        comments: 12,
        totalVotes: 25
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
