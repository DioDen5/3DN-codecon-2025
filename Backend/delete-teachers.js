import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function deleteTeachers() {
    try {
        await connectDB();
        
        const result1 = await Teacher.deleteOne({ name: 'Костів Оксана Миколаївна' });
        const result2 = await Teacher.deleteOne({ name: 'Мельник Світлана Анатоліївна' });
        
        console.log('Видалено Костів Оксану:', result1.deletedCount);
        console.log('Видалено Мельник Світлану:', result2.deletedCount);
        
        process.exit(0);
    } catch (error) {
        console.error('Помилка видалення:', error);
        process.exit(1);
    }
}

deleteTeachers();
