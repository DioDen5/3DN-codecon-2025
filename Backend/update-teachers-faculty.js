import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function updateTeachersFaculty() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Знаходимо всіх викладачів без поля faculty
        const teachersWithoutFaculty = await Teacher.find({
            $or: [
                { faculty: { $exists: false } },
                { faculty: null },
                { faculty: '' }
            ]
        });
        
        console.log(`\n📝 Знайдено ${teachersWithoutFaculty.length} викладачів без поля faculty\n`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const teacher of teachersWithoutFaculty) {
            // Встановлюємо faculty на основі department або university
            let faculty = teacher.department || teacher.university || 'Не вказано';
            
            // Якщо department містить "Кафедра", замінюємо на "Факультет"
            if (faculty.includes('Кафедра')) {
                faculty = faculty.replace('Кафедра', 'Факультет');
            } else if (!faculty.includes('Факультет') && !faculty.includes('Не вказано')) {
                // Додаємо "Факультет" якщо його немає
                faculty = `Факультет ${faculty}`;
            }
            
            teacher.faculty = faculty;
            await teacher.save();
            
            console.log(`✅ Оновлено: ${teacher.email}`);
            console.log(`   Ім'я: ${teacher.name}`);
            console.log(`   Faculty: ${faculty}`);
            console.log('');
            
            updated++;
        }
        
        console.log('═══════════════════════════════════════');
        console.log(`✅ Оновлено: ${updated} профілів`);
        console.log(`⚠️  Пропущено: ${skipped} профілів`);
        console.log('═══════════════════════════════════════\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка при оновленні викладачів:', error);
        process.exit(1);
    }
}

updateTeachersFaculty();

