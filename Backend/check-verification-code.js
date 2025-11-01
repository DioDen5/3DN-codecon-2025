import mongoose from 'mongoose';
import { EmailVerificationCode } from './src/models/EmailVerificationCode.js';
import { connectDB } from './src/config/db.js';

async function checkVerificationCode() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Знайти останній код для тестового email
        const testEmail = 'test.teacher@lnu.edu.ua';
        
        const codes = await EmailVerificationCode.find({ 
            email: testEmail,
            type: 'login',
            used: false
        })
        .sort({ createdAt: -1 })
        .limit(5);
        
        if (codes.length === 0) {
            console.log('❌ Не знайдено кодів для email:', testEmail);
            console.log('   Можливо код вже використано або прострочився');
            
            // Подивимось всі коди (включно з використаними)
            const allCodes = await EmailVerificationCode.find({ 
                email: testEmail,
                type: 'login'
            })
            .sort({ createdAt: -1 })
            .limit(5);
            
            if (allCodes.length > 0) {
                console.log('\n📋 Останні коди (включно з використаними):');
                allCodes.forEach((code, index) => {
                    const isExpired = new Date() > code.expiresAt;
                    const expiredText = isExpired ? ' ⏰ ПРОСТРОЧЕНО' : '';
                    const usedText = code.used ? ' ✅ ВИКОРИСТАНО' : '';
                    console.log(`   ${index + 1}. Code: ${code.code} | Created: ${code.createdAt.toLocaleString()} | Expires: ${code.expiresAt.toLocaleString()}${expiredText}${usedText}`);
                });
            }
        } else {
            console.log('✅ Знайдено активні коди:');
            codes.forEach((code, index) => {
                const expiresIn = Math.floor((code.expiresAt - new Date()) / 1000 / 60);
                console.log(`   ${index + 1}. Code: ${code.code}`);
                console.log(`      Email: ${code.email}`);
                console.log(`      Type: ${code.type}`);
                console.log(`      Created: ${code.createdAt.toLocaleString()}`);
                console.log(`      Expires: ${code.expiresAt.toLocaleString()}`);
                console.log(`      Expires in: ${expiresIn} хвилин`);
                console.log(`      Used: ${code.used}`);
                console.log(`      Attempts: ${code.attempts}`);
                console.log('');
            });
            
            // Показати найновіший код великим шрифтом
            console.log('🔐 НАЙНОВІШИЙ КОД ДЛЯ ВХОДУ:');
            console.log('════════════════════════════');
            console.log(`   ${codes[0].code}`);
            console.log('════════════════════════════');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking verification code:', error);
        process.exit(1);
    }
}

checkVerificationCode();

