import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { LoginAttempt } from './src/models/LoginAttempt.js';

async function clearLoginAttempts(email) {
    await connectDB();
    
    const normalizedEmail = email?.toLowerCase().trim();
    
    if (!normalizedEmail) {
        console.error('❌ Email is required');
        process.exit(1);
    }
    
    console.log(`\n🔓 Clearing login attempts for: ${email}\n`);
    console.log(`   Searching for variations of: ${normalizedEmail}\n`);
    
    // Спочатку знаходимо всі спроби з подібним email (незалежно від регістру)
    const allAttempts = await LoginAttempt.find({ 
        email: { $regex: normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } 
    });
    
    console.log(`   Found ${allAttempts.length} attempts with similar emails:`);
    const uniqueEmails = [...new Set(allAttempts.map(a => a.email))];
    uniqueEmails.forEach(e => console.log(`     - ${e}`));
    
    // Видаляємо всі спроби логіну для цього email (всі варіанти)
    const result = await LoginAttempt.deleteMany({ 
        email: { $regex: normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } 
    });
    
    console.log(`\n✅ Deleted ${result.deletedCount} login attempts`);
    console.log(`\n✅ Account unlocked! You can now try to login again.\n`);
    
    await mongoose.disconnect();
}

const email = process.argv[2];

if (!email) {
    console.error('Usage: node clear-login-attempts.js <email>');
    console.error('Example: node clear-login-attempts.js user@example.com');
    process.exit(1);
}

clearLoginAttempts(email).catch(console.error);

