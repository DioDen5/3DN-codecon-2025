import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';
import { ENV } from './src/config/env.js';

const MONGODB_URI = process.env.MONGO_URI || ENV.MONGO_URI || 'mongodb://127.0.0.1:27017/studlink';

async function fixTeacherUserIds() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Знаходимо всі Teacher профілі без userId або з null userId
        const teachersWithoutUserId = await Teacher.find({
            $or: [
                { userId: null },
                { userId: { $exists: false } }
            ]
        });

        console.log(`Found ${teachersWithoutUserId.length} teachers without userId`);

        let fixed = 0;
        let notFound = 0;

        for (const teacher of teachersWithoutUserId) {
            if (!teacher.email) {
                console.log(`Teacher ${teacher._id} has no email, skipping`);
                continue;
            }

            // Шукаємо User за email
            const user = await User.findOne({ 
                email: teacher.email.toLowerCase().trim() 
            });

            if (user) {
                // Конвертуємо user._id в ObjectId
                const userIdObjectId = user._id instanceof mongoose.Types.ObjectId 
                    ? user._id 
                    : new mongoose.Types.ObjectId(user._id);

                teacher.userId = userIdObjectId;
                await teacher.save();
                console.log(`Fixed teacher ${teacher._id} (${teacher.name}) - linked to user ${user._id}`);
                fixed++;
            } else {
                console.log(`No user found for teacher ${teacher._id} (${teacher.name}) with email ${teacher.email}`);
                notFound++;
            }
        }

        console.log(`\nSummary:`);
        console.log(`- Fixed: ${fixed}`);
        console.log(`- Not found: ${notFound}`);
        console.log(`- Total processed: ${teachersWithoutUserId.length}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixTeacherUserIds();

