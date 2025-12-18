import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';

async function checkUser() {
    await connectDB();

    console.log('\n🔍 Пошук користувачів...\n');

    // Шукаємо всіх користувачів (крім адмінів)
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });

    console.log(`📊 Знайдено користувачів: ${users.length}\n`);

    if (users.length === 0) {
        console.log('ℹ️  Користувачів не знайдено\n');
    } else {
        console.log('═'.repeat(70));
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. 👤 Користувач:`);
            console.log('─'.repeat(70));
            console.log('   ID:', user._id);
            console.log('   Email:', user.email);
            console.log('   Display Name:', user.displayName);
            console.log('   First Name:', user.firstName || 'не вказано');
            console.log('   Last Name:', user.lastName || 'не вказано');
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
            console.log('   Has passwordHash:', !!user.passwordHash);
            console.log('   Created At:', user.createdAt ? user.createdAt.toLocaleString('uk-UA') : 'не вказано');
            console.log('   Updated At:', user.updatedAt ? user.updatedAt.toLocaleString('uk-UA') : 'не вказано');
        });
        console.log('\n' + '═'.repeat(70));
    }

    // Шукаємо конкретно Дениса (різні варіанти email)
    const denysEmails = [
        'Denys.Zastavnyi@lnu.edu.ua',
        'denys.zastavnyi@lnu.edu.ua',
        'Denys.Xastavnyi@lnu.edu.ua',
        'denys.xastavnyi@lnu.edu.ua'
    ];

    console.log('\n🔍 Пошук користувачів з email Дениса...\n');
    for (const email of denysEmails) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ 
            email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
        });
        if (user) {
            console.log(`✅ Знайдено користувача з email: ${email}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Display Name: ${user.displayName}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Created At: ${user.createdAt ? user.createdAt.toLocaleString('uk-UA') : 'не вказано'}\n`);
        }
    }

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

checkUser().catch(console.error);

