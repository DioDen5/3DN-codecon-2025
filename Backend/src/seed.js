import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ENV } from './config/env.js';
import { User } from './models/User.js';
import { Announcement } from './models/Announcement.js';

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== '1') {
    console.error('❌ Refusing to run seed in production (set ALLOW_SEED=1 to override)');
    process.exit(1);
}

async function main() {
    await mongoose.connect(ENV.MONGO_URI, { autoIndex: true });
    console.log('✅ Connected for seeding');

    await User.deleteMany({});
    await Announcement.deleteMany({});

    const pass = await bcrypt.hash('password123', 10);

    const [admin] = await User.create([{
        email: 'admin@lpnu.ua',
        passwordHash: await bcrypt.hash('password123', 10),
        displayName: 'Admin',
        firstName: 'Адміністратор',
        lastName: 'Системи',
        role: 'admin',
        status: 'verified',
    }]);

    const student = await User.create({
        email: 'student11@lnu.edu.ua',
        passwordHash: await bcrypt.hash('12345678', 10),
        displayName: 'Student',
        firstName: 'Іван',
        lastName: 'Петренко',
        role: 'student',
        status: 'verified'
    });

    const teacher = await User.create({
        email: 'teacher@lnu.edu.ua',
        passwordHash: pass,
        displayName: 'Доктор Олександр Петренко',
        firstName: 'Олександр',
        lastName: 'Петренко',
        middleName: 'Володимирович',
        role: 'teacher',
        status: 'verified'
    });

    await Announcement.insertMany([
        {
            title: 'Опубліковане оголошення',
            body: 'Тут текст оголошення…',
            authorId: admin._id,
            status: 'published',
            visibility: 'students',
            pinned: true,
            publishedAt: new Date()
        },
        {
            title: 'Чернетка студента',
            body: 'Чернетка...',
            authorId: student._id,
            status: 'draft',
            visibility: 'students'
        },
        {
            title: 'Очікує модерації',
            body: 'Прошу опублікувати',
            authorId: student._id,
            status: 'pending',
            visibility: 'students'
        }
    ]);

    console.log('🌱 Seed done');
    await mongoose.disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
