import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function updateTeachersRequiredFields() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Знаходимо всіх викладачів без bio або position
        const teachersToUpdate = await Teacher.find({
            $or: [
                { bio: { $exists: false } },
                { bio: null },
                { bio: '' },
                { position: { $exists: false } },
                { position: null },
                { position: '' }
            ]
        });
        
        console.log(`\n📝 Знайдено ${teachersToUpdate.length} викладачів без обов'язкових полів\n`);
        
        let updated = 0;
        
        for (const teacher of teachersToUpdate) {
            let needsUpdate = false;
            
            // Встановлюємо bio якщо відсутнє
            if (!teacher.bio || teacher.bio.trim() === '') {
                teacher.bio = `Викладач ${teacher.subject || teacher.subjects?.[0] || 'предмета'} в ${teacher.university}. Маю досвід у навчанні студентів та розвитку академічних знань.`;
                needsUpdate = true;
            }
            
            // Встановлюємо position якщо відсутнє
            // НЕ встановлюємо "Викладач" автоматично - залишаємо порожнім, щоб адмін міг встановити
            // Або можна встановити більш релевантну посаду на основі даних
            if (!teacher.position || teacher.position.trim() === '') {
                // Для акаунтів, створених адміном, не встановлюємо position автоматично
                // воно має бути встановлено адміном при створенні
                // teacher.position = 'Викладач'; // Закоментовано - не встановлюємо автоматично
                // needsUpdate = true; // Також закоментовано
            }
            
            if (needsUpdate) {
                await teacher.save();
                console.log(`✅ Оновлено: ${teacher.email || teacher._id}`);
                console.log(`   Ім'я: ${teacher.name}`);
                if (!teacher.bio || teacher.bio.trim() === '') {
                    console.log(`   Bio: додано`);
                }
                if (!teacher.position || teacher.position.trim() === '') {
                    console.log(`   Position: ${teacher.position}`);
                }
                console.log('');
                updated++;
            }
        }
        
        console.log('═══════════════════════════════════════');
        console.log(`✅ Оновлено: ${updated} профілів`);
        console.log('═══════════════════════════════════════\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка при оновленні викладачів:', error);
        process.exit(1);
    }
}

updateTeachersRequiredFields();

