import mongoose from 'mongoose';
import 'dotenv/config';
import { Teacher } from './src/models/Teacher.js';
import { ENV } from './src/config/env.js';

const MONGODB_URI = process.env.MONGO_URI || ENV.MONGO_URI || 'mongodb://127.0.0.1:27017/studlink';

async function checkTeacherPositions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Знаходимо всі Teacher профілі
        const teachers = await Teacher.find({});

        console.log(`\nTotal teachers: ${teachers.length}\n`);

        teachers.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name || 'No name'}`);
            console.log(`   Email: ${teacher.email || 'No email'}`);
            console.log(`   Position: ${teacher.position || 'NULL/NOT SET'}`);
            console.log(`   UserId: ${teacher.userId || 'NULL'}`);
            console.log('');
        });

        // Знаходимо Teacher без position
        const teachersWithoutPosition = teachers.filter(t => !t.position || t.position.trim() === '');
        console.log(`\nTeachers without position: ${teachersWithoutPosition.length}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTeacherPositions();

