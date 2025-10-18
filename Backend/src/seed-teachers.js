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
