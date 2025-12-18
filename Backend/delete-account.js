import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';

async function deleteAccount() {
    await connectDB();

    const email = 'Denys.Zastavnyi@lnu.edu.ua';
    const normalizedEmail = email.toLowerCase().trim();

    console.log('\n🗑️  Видалення акаунта...\n');

    // Видаляємо User
    const user = await User.findOne({ 
        email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
    });

    if (user) {
        console.log('📋 Знайдено User:');
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Display Name: ${user.displayName}\n`);

        await User.deleteOne({ _id: user._id });
        console.log('✅ User видалено\n');
    } else {
        console.log('ℹ️  User не знайдено\n');
    }

    // Видаляємо Teacher
    const teacher = await Teacher.findOne({ email: normalizedEmail });
    if (teacher) {
        console.log('📋 Знайдено Teacher:');
        console.log(`   Email: ${teacher.email}`);
        console.log(`   ID: ${teacher._id}`);
        console.log(`   Name: ${teacher.name}`);
        console.log(`   Status: ${teacher.status}\n`);

        await Teacher.deleteOne({ _id: teacher._id });
        console.log('✅ Teacher видалено\n');
    } else {
        console.log('ℹ️  Teacher не знайдено\n');
    }

    console.log('✅ Видалення завершено\n');

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

deleteAccount().catch(console.error);

