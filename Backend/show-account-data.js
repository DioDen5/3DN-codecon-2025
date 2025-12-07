import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';
import { PasswordResetToken } from './src/models/PasswordResetToken.js';

async function showAccountData() {
    await connectDB();

    const email = 'Denys.Zastavnyi@lnu.edu.ua';
    const normalizedEmail = email.toLowerCase().trim();

    console.log('\n📊 Дані акаунта:', email, '\n');
    console.log('═'.repeat(60));

    // Перевіряємо User
    const user = await User.findOne({ 
        email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
    });

    if (user) {
        console.log('\n👤 USER:');
        console.log('─'.repeat(60));
        console.log('   ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Display Name:', user.displayName);
        console.log('   First Name:', user.firstName || 'не вказано');
        console.log('   Last Name:', user.lastName || 'не вказано');
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);
        console.log('   Has passwordHash:', !!user.passwordHash);
        console.log('   passwordHash (first 20 chars):', user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'null');
        console.log('   Has teacherPassword:', !!(user.role === 'teacher' && user.teacherPassword));
        if (user.role === 'teacher' && user.teacherPassword) {
            console.log('   teacherPassword (first 20 chars):', user.teacherPassword.substring(0, 20) + '...');
        }
        console.log('   Remember Me:', user.rememberMe || false);
        console.log('   Last Login Email:', user.lastLoginEmail || 'не вказано');
        console.log('   Created At:', user.createdAt ? user.createdAt.toLocaleString('uk-UA') : 'не вказано');
        console.log('   Updated At:', user.updatedAt ? user.updatedAt.toLocaleString('uk-UA') : 'не вказано');
    } else {
        console.log('\n👤 USER: не знайдено');
    }

    // Перевіряємо Teacher
    const teacher = await Teacher.findOne({ email: normalizedEmail });
    if (teacher) {
        console.log('\n👨‍🏫 TEACHER:');
        console.log('─'.repeat(60));
        console.log('   ID:', teacher._id);
        console.log('   Email:', teacher.email);
        console.log('   Name:', teacher.name);
        console.log('   University:', teacher.university || 'не вказано');
        console.log('   Faculty:', teacher.faculty || 'не вказано');
        console.log('   Department:', teacher.department || 'не вказано');
        console.log('   Subjects:', teacher.subjects?.join(', ') || 'не вказано');
        console.log('   Status:', teacher.status);
        console.log('   userId:', teacher.userId || 'null (не підв\'язаний)');
        console.log('   Image:', teacher.image || 'не вказано');
        console.log('   Created At:', teacher.createdAt ? teacher.createdAt.toLocaleString('uk-UA') : 'не вказано');
        console.log('   Updated At:', teacher.updatedAt ? teacher.updatedAt.toLocaleString('uk-UA') : 'не вказано');
    } else {
        console.log('\n👨‍🏫 TEACHER: не знайдено');
    }

    // Перевіряємо активні токени скидання пароля
    const resetTokens = await PasswordResetToken.find({ 
        userId: user?._id 
    }).sort({ createdAt: -1 }).limit(3);

    if (resetTokens.length > 0) {
        console.log('\n🔑 PASSWORD RESET TOKENS (останні 3):');
        console.log('─'.repeat(60));
        resetTokens.forEach((token, index) => {
            console.log(`\n   Токен ${index + 1}:`);
            console.log('   ID:', token._id);
            console.log('   Used:', token.used ? '✅ так' : '❌ ні');
            console.log('   Expires At:', token.expiresAt ? token.expiresAt.toLocaleString('uk-UA') : 'не вказано');
            console.log('   Is Expired:', new Date() > token.expiresAt ? '✅ так' : '❌ ні');
            console.log('   Created At:', token.createdAt ? token.createdAt.toLocaleString('uk-UA') : 'не вказано');
        });
    } else {
        console.log('\n🔑 PASSWORD RESET TOKENS: не знайдено');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Перевірка завершена\n');

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

showAccountData().catch(console.error);

