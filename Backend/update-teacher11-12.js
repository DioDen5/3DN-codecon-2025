import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function updateTeacher11And12() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Оновлюємо teacher11
        const teacher11 = await Teacher.findOne({ email: 'test.teacher11@lnu.edu.ua' });
        if (teacher11) {
            teacher11.bio = 'Досвідчений викладач української літератури з багаторічним стажем. Спеціалізуюсь на класичній та сучасній українській літературі.';
            teacher11.position = 'Доцент';
            await teacher11.save();
            console.log('✅ Оновлено test.teacher11@lnu.edu.ua');
            console.log(`   Bio: ${teacher11.bio.substring(0, 50)}...`);
            console.log(`   Position: ${teacher11.position}`);
        } else {
            console.log('⚠️  test.teacher11@lnu.edu.ua не знайдено');
        }
        
        // Оновлюємо teacher12
        const teacher12 = await Teacher.findOne({ email: 'test.teacher12@lnu.edu.ua' });
        if (teacher12) {
            teacher12.bio = 'Професійний розробник та викладач програмної інженерії. Маю великий досвід у розробці веб-додатків та роботі з сучасними технологіями.';
            teacher12.position = 'Професор';
            await teacher12.save();
            console.log('✅ Оновлено test.teacher12@lnu.edu.ua');
            console.log(`   Bio: ${teacher12.bio.substring(0, 50)}...`);
            console.log(`   Position: ${teacher12.position}`);
        } else {
            console.log('⚠️  test.teacher12@lnu.edu.ua не знайдено');
        }
        
        console.log('\n✅ Готово!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка при оновленні:', error);
        process.exit(1);
    }
}

updateTeacher11And12();

