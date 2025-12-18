import mongoose from 'mongoose';
import { Teacher } from './src/models/Teacher.js';
import { connectDB } from './src/config/db.js';

async function createTestTeachers() {
    try {
        await connectDB();
        console.log('✅ Connected to database');
        
        // Масив тестових викладачів для створення
        const testTeachers = [
            {
                email: 'test.teacher1@lnu.edu.ua',
                name: 'Іван Петренко',
                university: 'ЛНУ ім. І. Франка',
                faculty: 'Факультет математики та інформатики',
                department: 'Кафедра математики',
                subject: 'Математика',
                subjects: ['Математика', 'Алгебра'],
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher2@lnu.edu.ua',
                name: 'Марія Коваленко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра фізики',
                subject: 'Фізика',
                subjects: ['Фізика', 'Механіка'],
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher3@lnu.edu.ua',
                name: 'Олександр Сидоренко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра інформатики',
                subject: 'Програмування',
                subjects: ['Програмування', 'Web-розробка', 'Бази даних'],
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher4@lnu.edu.ua',
                name: 'Олена Мельник',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра хімії',
                subject: 'Хімія',
                subjects: ['Хімія', 'Органічна хімія'],
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'pending',
                userId: null
            },
            {
                email: 'test.teacher5@lnu.edu.ua',
                name: 'Василь Ткаченко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра англійської мови',
                subject: 'Англійська мова',
                subjects: ['Англійська мова', 'Переклад'],
                image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher6@lnu.edu.ua',
                name: 'Наталія Гриценко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра історії',
                subject: 'Історія України',
                subjects: ['Історія України', 'Всесвітня історія'],
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher7@lnu.edu.ua',
                name: 'Дмитро Мельник',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра біології',
                subject: 'Генетика',
                subjects: ['Генетика', 'Молекулярна біологія'],
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher8@lnu.edu.ua',
                name: 'Олена Захаренко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра психології',
                subject: 'Соціальна психологія',
                subjects: ['Соціальна психологія', 'Клінічна психологія'],
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher9@lnu.edu.ua',
                name: 'Андрій Ткаченко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра економіки',
                subject: 'Мікроекономіка',
                subjects: ['Мікроекономіка', 'Макроекономіка'],
                image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher10@lnu.edu.ua',
                name: 'Сергій Бондаренко',
                university: 'ЛНУ ім. І. Франка',
                department: 'Кафедра політології',
                subject: 'Теорія політики',
                subjects: ['Теорія політики', 'Міжнародні відносини'],
                image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher11@lnu.edu.ua',
                name: 'Оксана Іваненко',
                university: 'ЛНУ ім. І. Франка',
                faculty: 'Факультет філології',
                department: 'Кафедра філології',
                subject: 'Українська література',
                subjects: ['Українська література', 'Українська мова'],
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                bio: 'Досвідчений викладач української літератури з багаторічним стажем. Спеціалізуюсь на класичній та сучасній українській літературі.',
                position: 'Доцент',
                status: 'verified',
                userId: null
            },
            {
                email: 'test.teacher12@lnu.edu.ua',
                name: 'Володимир Сидоренко',
                university: 'ЛНУ ім. І. Франка',
                faculty: 'Факультет прикладної математики та інформатики',
                department: 'Кафедра комп\'ютерних наук',
                subject: 'Програмна інженерія',
                subjects: ['Програмна інженерія', 'Веб-програмування', 'Бази даних'],
                image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
                bio: 'Професійний розробник та викладач програмної інженерії. Маю великий досвід у розробці веб-додатків та роботі з сучасними технологіями.',
                position: 'Професор',
                status: 'verified',
                userId: null
            }
        ];
        
        let created = 0;
        let skipped = 0;
        
        console.log('\n📝 Створення тестових профілів викладачів...\n');
        
        for (const teacherData of testTeachers) {
            // Перевіримо чи вже існує
            const existing = await Teacher.findOne({ email: teacherData.email });
            if (existing) {
                console.log(`⚠️  Пропущено: ${teacherData.email} - вже існує`);
                skipped++;
                continue;
            }
            
            // Створюємо Teacher профіль БЕЗ userId (якщо створений адміном)
            const teacher = await Teacher.create({
                name: teacherData.name,
                email: teacherData.email,
                university: teacherData.university,
                faculty: teacherData.faculty || teacherData.department || 'Не вказано',
                department: teacherData.department || null,
                subject: teacherData.subject,
                subjects: teacherData.subjects,
                image: teacherData.image,
                bio: teacherData.bio || 'Викладач в університеті. Маю досвід у навчанні студентів.',
                position: teacherData.position || 'Викладач',
                status: teacherData.status,
                userId: null, // НЕ прив'язаний до User - це ключове для тестування!
                rating: 0,
                likes: 0,
                dislikes: 0,
                comments: 0,
                totalVotes: 0
            });
            
            console.log(`✅ Створено: ${teacher.email}`);
            console.log(`   Ім'я: ${teacher.name}`);
            console.log(`   Статус: ${teacher.status}`);
            console.log(`   Предмети: ${teacher.subjects.join(', ')}`);
            console.log('');
            
            created++;
        }
        
        console.log('═══════════════════════════════════════');
        console.log(`✅ Створено: ${created} профілів`);
        console.log(`⚠️  Пропущено: ${skipped} профілів (вже існують)`);
        console.log(`📊 Всього: ${testTeachers.length} профілів`);
        console.log('═══════════════════════════════════════\n');
        
        console.log('📋 Список створених тестових email:');
        testTeachers.forEach((t, index) => {
            console.log(`   ${index + 1}. ${t.email} - ${t.name}`);
        });
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Помилка при створенні тестових викладачів:', error);
        process.exit(1);
    }
}

createTestTeachers();

