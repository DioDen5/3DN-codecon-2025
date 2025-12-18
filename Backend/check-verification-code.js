import { connectDB } from './src/config/db.js';
import { EmailVerificationCode } from './src/models/EmailVerificationCode.js';

async function checkVerificationCode(email) {
    try {
        await connectDB();
        console.log('✅ Connected to database\n');
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Шукаємо найновіший код (використаний або ні)
        const codes = await EmailVerificationCode.find({ 
            email: normalizedEmail 
        }).sort({ createdAt: -1 }).limit(5);
        
        if (codes.length === 0) {
            console.log(`⚠️  Кодів для ${normalizedEmail} не знайдено\n`);
            console.log('📝 Для отримання коду:');
            console.log('   1. Відкрийте форму реєстрації');
            console.log('   2. Введіть email:', normalizedEmail);
            console.log('   3. Натисніть "Перевірити email"');
            console.log('   4. Код з\'явиться в консолі backend або тут\n');
            process.exit(0);
        }
        
        console.log(`📋 Знайдено ${codes.length} кодів для ${normalizedEmail}:\n`);
        
        codes.forEach((code, index) => {
            const isActive = !code.used && new Date() < code.expiresAt;
            const isExpired = new Date() >= code.expiresAt;
            
            console.log(`${index + 1}. Код: ${code.code}`);
            console.log(`   Тип: ${code.type}`);
            console.log(`   Статус: ${isActive ? '✅ Активний' : code.used ? '❌ Використаний' : isExpired ? '⏰ Прострочений' : '❓ Невідомо'}`);
            console.log(`   Створено: ${code.createdAt.toLocaleString('uk-UA')}`);
            console.log(`   Дійсний до: ${code.expiresAt.toLocaleString('uk-UA')}`);
            
            if (isActive) {
                console.log(`   ⚡ ЦЕЙ КОД АКТИВНИЙ І МОЖНА ВИКОРИСТОВУВАТИ!`);
            }
            console.log('');
        });
        
        // Знайдемо активний код
        const activeCode = codes.find(code => !code.used && new Date() < code.expiresAt);
        
        if (activeCode) {
            console.log('═══════════════════════════════════════');
            console.log('✅ АКТИВНИЙ КОД ДЛЯ ВХОДУ:');
            console.log(`   Email: ${normalizedEmail}`);
            console.log(`   Код: ${activeCode.code}`);
            console.log(`   Дійсний до: ${activeCode.expiresAt.toLocaleString('uk-UA')}`);
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('⚠️  Активного коду немає. Потрібно згенерувати новий код через UI.\n');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка:', error);
        process.exit(1);
    }
}

// Отримуємо email з аргументів командного рядка
const email = process.argv[2] || 'test.teacher4@lnu.edu.ua';

checkVerificationCode(email);
