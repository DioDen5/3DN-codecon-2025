import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';

async function convertStudentToTeacher() {
    await connectDB();

    const email = 'Denys.Zastavnyi@lnu.edu.ua';
    const normalizedEmail = email.toLowerCase().trim();

    console.log('\n🔄 Конвертація студента в викладача...\n');

    // Видаляємо студента
    const student = await User.findOne({ 
        email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
    });

    if (student) {
        console.log('📋 Знайдено студента:');
        console.log(`   Email: ${student.email}`);
        console.log(`   ID: ${student._id}`);
        console.log(`   Role: ${student.role}`);
        console.log(`   Display Name: ${student.displayName}\n`);

        // Видаляємо студента
        await User.deleteOne({ _id: student._id });
        console.log('✅ Студента видалено\n');
    } else {
        console.log('ℹ️  Студента не знайдено, продовжуємо...\n');
    }

    // Перевіряємо чи вже існує викладач з цією поштою
    const existingTeacher = await Teacher.findOne({ email: normalizedEmail });
    if (existingTeacher) {
        console.log('⚠️  Викладач з цією поштою вже існує:');
        console.log(`   ID: ${existingTeacher._id}`);
        console.log(`   Name: ${existingTeacher.name}`);
        console.log(`   Status: ${existingTeacher.status}`);
        console.log(`   userId: ${existingTeacher.userId}\n`);

        // Оновлюємо дані викладача
        existingTeacher.name = 'Заставний Денис Олександрович';
        existingTeacher.university = 'ЛНУ ім. І. Франка';
        existingTeacher.faculty = 'Факультет прикладної математики та інформатики';
        existingTeacher.department = 'Кафедра комп\'ютерних наук';
        existingTeacher.subjects = ['Веб-програмування', 'Бази даних', 'Архітектура програмного забезпечення'];
        existingTeacher.image = 'https://randomuser.me/api/portraits/men/32.jpg';
        existingTeacher.status = 'pending';
        existingTeacher.userId = null;
        await existingTeacher.save();
        console.log('✅ Дані викладача оновлено\n');
    } else {
        // Створюємо нового викладача
        const newTeacher = await Teacher.create({
            name: 'Заставний Денис Олександрович',
            email: normalizedEmail,
            university: 'ЛНУ ім. І. Франка',
            faculty: 'Факультет прикладної математики та інформатики',
            department: 'Кафедра комп\'ютерних наук',
            subjects: ['Веб-програмування', 'Бази даних', 'Архітектура програмного забезпечення'],
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            status: 'pending',
            userId: null
        });
        console.log('✅ Створено нового викладача:');
        console.log(`   ID: ${newTeacher._id}`);
        console.log(`   Name: ${newTeacher.name}`);
        console.log(`   Email: ${newTeacher.email}`);
        console.log(`   University: ${newTeacher.university}`);
        console.log(`   Faculty: ${newTeacher.faculty}`);
        console.log(`   Department: ${newTeacher.department}`);
        console.log(`   Subjects: ${newTeacher.subjects.join(', ')}`);
        console.log(`   Status: ${newTeacher.status}`);
        console.log(`   userId: ${newTeacher.userId} (null - не підв'язаний)\n`);
    }

    console.log('📝 Інструкції для тестування:');
    console.log('   1. Спробуйте зареєструватися або увійти з email:', email);
    console.log('   2. Система має запропонувати введення PIN коду з email');
    console.log('   3. Перевірте пошту - код має прийти на', email);
    console.log('   4. Після введення PIN коду створиться User і підв\'яжеться до Teacher профілю\n');

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

convertStudentToTeacher().catch(console.error);

