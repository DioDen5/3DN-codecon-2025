import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';
import { Announcement } from './src/models/Announcement.js';
import { Comment } from './src/models/Comment.js';
import { Reaction } from './src/models/Reaction.js';
import { TeacherComment } from './src/models/TeacherComment.js';
import bcrypt from 'bcrypt';

const universities = {
    lnu: {
        name: 'ЛНУ ім. І. Франка',
        domains: ['lnu.edu.ua'],
        faculties: ['Філологічний', 'Математичний', 'Факультет прикладної математики та інформатики', 'Економічний', 'Психології']
    },
    polytechnic: {
        name: 'Львівська політехніка',
        domains: ['lpnu.ua'],
        faculties: ['Факультет комп\'ютерних наук', 'Факультет електроніки', 'Факультет механіки', 'Факультет архітектури']
    },
    kiev: {
        name: 'КНУ ім. Т. Шевченка',
        domains: ['knu.ua', 'univ.kiev.ua'],
        faculties: ['Факультет інформатики', 'Факультет математики', 'Філологічний факультет', 'Факультет економіки']
    }
};

const studentNames = [
    { first: 'Олександр', last: 'Коваленко', middle: 'Петрович' },
    { first: 'Марія', last: 'Мельник', middle: 'Іванівна' },
    { first: 'Андрій', last: 'Шевченко', middle: 'Володимирович' },
    { first: 'Оксана', last: 'Петренко', middle: 'Степанівна' },
    { first: 'Дмитро', last: 'Бондаренко', middle: 'Ігорович' },
    { first: 'Наталія', last: 'Ткаченко', middle: 'Олександрівна' },
    { first: 'Володимир', last: 'Морозенко', middle: 'Сергійович' },
    { first: 'Юлія', last: 'Кравченко', middle: 'Миколаївна' }
];

const teacherNames = [
    { name: 'Професор Іван Петрович Ковальчук', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Марія Іванівна Лисенко', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Олександр Володимирович Білоус', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Оксана Степанівна Гриценко', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Дмитро Ігорович Савченко', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Наталія Олександрівна Тарасенко', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Володимир Сергійович Романенко', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Юлія Миколаївна Коваль', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Сергій Олександрович Мороз', image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Анна Петрівна Шевченко', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Ігор Володимирович Бондар', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Олена Степанівна Кравченко', image: 'https://images.unsplash.com/photo-1488426862026-3ee34c7bf447?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Микола Іванович Ткаченко', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Вікторія Олександрівна Лисенко', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Павло Сергійович Гриценко', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Катерина Петрівна Савченко', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Роман Володимирович Тарасенко', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Ірина Миколаївна Романенко', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Богдан Олександрович Коваль', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Доцент Світлана Степанівна Мороз', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Професор Тарас Іванович Шевченко', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces' }
];

const discussionTitles = [
    'Як ефективно готуватися до сесії?',
    'Досвід проходження практики в IT-компаніях',
    'Найкращі ресурси для вивчення програмування',
    'Як обрати спеціалізацію в університеті?',
    'Співпраця з викладачами: поради студентам',
    'Онлайн-навчання vs офлайн: що краще?',
    'Як організувати свій час під час навчання?',
    'Стажування та кар\'єрні можливості для студентів'
];

const discussionBodies = [
    'Шукаю поради від досвідчених студентів щодо ефективної підготовки до екзаменів. Які методики найкраще працюють?',
    'Хочу поділитися своїм досвідом проходження практики в великій IT-компанії. Що очікувати та як підготуватися?',
    'Збираю список найкращих ресурсів для вивчення програмування. Додайте свої рекомендації!',
    'Студенти старших курсів, поділіться досвідом вибору спеціалізації. На що звернути увагу?',
    'Як налагодити ефективну співпрацю з викладачами? Шукаю практичні поради.',
    'Обговорюємо переваги та недоліки онлайн та офлайн навчання. Ваша думка?',
    'Проблеми з тайм-менеджментом під час навчання. Як ви організовуєте свій день?',
    'Ділюся інформацією про можливості стажування та кар\'єрного росту для студентів нашого університету.'
];

const comments = [
    'Дуже цікава тема! Дякую за поділ досвіду.',
    'Повністю згоден! Це дійсно важливо враховувати.',
    'Можу додати зі свого досвіду: найкраще почати з основ.',
    'Чудова ідея! Обов\'язково спробую цей підхід.',
    'Дякую за корисну інформацію, це дуже допомогло!',
    'Цікава точка зору, але я маю трохи іншу думку.',
    'Підтримую! Це саме те, що потрібно знати.',
    'Відмінна порада, обов\'язково візьму на замітку.',
    'Дякую за детальне пояснення, тепер все зрозуміло.',
    'Це дійсно працює! Перевірив на власному досвіді.'
];

async function seedDemoData() {
    await connectDB();

    console.log('\n🌱 Створення демонстраційних даних для курсової роботи...\n');

    const passwordHash = await bcrypt.hash('password123', 10);
    const createdUsers = [];
    const createdTeachers = [];
    const createdAnnouncements = [];
    const createdComments = [];

    // 1. Створюємо студентів
    console.log('1️⃣  Створення студентів...');
    let studentIndex = 0;
    for (const [uniKey, uniData] of Object.entries(universities)) {
        for (let i = 0; i < 3; i++) {
            if (studentIndex >= studentNames.length) break;
            const name = studentNames[studentIndex];
            const email = `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${uniData.domains[0]}`;
            
            const user = await User.create({
                email,
                passwordHash,
                displayName: `${name.first} ${name.last}`,
                firstName: name.first,
                lastName: name.last,
                middleName: name.middle,
                role: 'student',
                status: 'verified'
            });
            
            createdUsers.push(user);
            console.log(`   ✅ ${user.displayName} (${email})`);
            studentIndex++;
        }
    }
    console.log(`\n   📊 Створено студентів: ${createdUsers.length}\n`);

    // 2. Створюємо викладачів (21 для покриття сторінки + пагінація)
    console.log('2️⃣  Створення викладачів...');
    const teacherSubjects = [
        ['Веб-програмування', 'Бази даних'],
        ['Алгоритми та структури даних', 'Машинне навчання'],
        ['Операційні системи', 'Комп\'ютерні мережі'],
        ['Українська мова', 'Література'],
        ['Вища математика', 'Диференціальні рівняння'],
        ['Загальна психологія', 'Соціальна психологія'],
        ['Мікроекономіка', 'Макроекономіка'],
        ['Архітектура програмного забезпечення', 'Проектування систем'],
        ['Кібербезпека', 'Криптографія'],
        ['Штучний інтелект', 'Обробка природної мови'],
        ['Мобільна розробка', 'UX/UI дизайн'],
        ['Теорія ймовірностей', 'Математична статистика'],
        ['Філософія', 'Логіка'],
        ['Менеджмент', 'Маркетинг'],
        ['Фізика', 'Електротехніка'],
        ['Хімія', 'Біохімія'],
        ['Історія України', 'Світова історія'],
        ['Англійська мова', 'Переклад'],
        ['Географія', 'Екологія'],
        ['Педагогіка', 'Методика навчання'],
        ['Фінанси', 'Бухгалтерський облік']
    ];

    for (let i = 0; i < teacherNames.length; i++) {
        const teacher = teacherNames[i];
        const uniIndex = i % 3;
        const uniKeys = Object.keys(universities);
        const uniKey = uniKeys[uniIndex];
        const uniData = universities[uniKey];
        
        const email = `teacher${i + 1}@${uniData.domains[0]}`;
        const facultyIndex = i % uniData.faculties.length;
        
        // Визначаємо посаду на основі імені (Професор або Доцент)
        const position = teacher.name.includes('Професор') ? 'Професор' : 'Доцент';
        
        const teacherDoc = await Teacher.create({
            name: teacher.name,
            email,
            university: uniData.name,
            faculty: uniData.faculties[facultyIndex],
            department: `Кафедра ${teacherSubjects[i][0].toLowerCase()}`,
            subjects: teacherSubjects[i],
            image: teacher.image,
            position: position,
            status: 'verified',
            userId: null,
            likes: 0,
            dislikes: 0,
            comments: 0,
            totalVotes: 0,
            rating: 0
        });
        
        createdTeachers.push(teacherDoc);
        console.log(`   ✅ ${teacherDoc.name} (${uniData.name})`);
    }
    console.log(`\n   📊 Створено викладачів: ${createdTeachers.length}\n`);

    // 3. Створюємо обговорення
    console.log('3️⃣  Створення обговорень...');
    for (let i = 0; i < discussionTitles.length; i++) {
        const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const announcement = await Announcement.create({
            title: discussionTitles[i],
            body: discussionBodies[i],
            authorId: author._id,
            status: 'published',
            visibility: 'students',
            pinned: i === 0, // Перше обговорення закріплене
            publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Останні 7 днів
            metrics: {
                views: Math.floor(Math.random() * 200) + 50,
                comments: 0 // Оновимо після створення коментарів
            }
        });
        
        createdAnnouncements.push(announcement);
        console.log(`   ✅ "${announcement.title}" від ${author.displayName}`);
    }
    console.log(`\n   📊 Створено обговорень: ${createdAnnouncements.length}\n`);

    // 4. Створюємо коментарі до обговорень
    console.log('4️⃣  Створення коментарів до обговорень...');
    let commentCount = 0;
    for (const announcement of createdAnnouncements) {
        const numComments = Math.floor(Math.random() * 5) + 2; // 2-6 коментарів на обговорення
        
        for (let i = 0; i < numComments; i++) {
            const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const commentText = comments[Math.floor(Math.random() * comments.length)];
            
            const comment = await Comment.create({
                body: commentText,
                authorId: author._id,
                announcementId: announcement._id
            });
            
            createdComments.push(comment);
            commentCount++;
        }
        
        // Оновлюємо кількість коментарів в обговоренні
        announcement.metrics.comments = numComments;
        await announcement.save();
    }
    console.log(`\n   📊 Створено коментарів: ${commentCount}\n`);

    // 5. Створюємо лайки на обговорення
    console.log('5️⃣  Створення лайків на обговорення...');
    let reactionCount = 0;
    for (const announcement of createdAnnouncements) {
        const numLikes = Math.floor(Math.random() * 8) + 3; // 3-10 лайків
        const usersWhoLiked = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numLikes);
        
        for (const user of usersWhoLiked) {
            await Reaction.create({
                userId: user._id,
                targetType: 'announcement',
                targetId: announcement._id,
                value: 1
            });
            reactionCount++;
        }
    }
    console.log(`\n   📊 Створено лайків на обговорення: ${reactionCount}\n`);

    // 6. Створюємо лайки на коментарі
    console.log('6️⃣  Створення лайків на коментарі...');
    let commentReactionCount = 0;
    for (const comment of createdComments) {
        if (Math.random() > 0.3) { // 70% коментарів мають лайки
            const numLikes = Math.floor(Math.random() * 5) + 1; // 1-5 лайків
            const usersWhoLiked = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numLikes);
            
            for (const user of usersWhoLiked) {
                await Reaction.create({
                    userId: user._id,
                    targetType: 'comment',
                    targetId: comment._id,
                    value: 1
                });
                commentReactionCount++;
            }
        }
    }
    console.log(`\n   📊 Створено лайків на коментарі: ${commentReactionCount}\n`);

    // 7. Створюємо відгуки викладачам
    console.log('7️⃣  Створення відгуків викладачам...');
    const teacherReviewTexts = [
        'Чудовий викладач! Дуже доступно пояснює матеріал.',
        'Дуже рекомендую! Заняття цікаві та інформативні.',
        'Відмінний професіонал, завжди готовий допомогти студентам.',
        'Дуже добре структуровані лекції, легко зрозуміти матеріал.',
        'Викладач з великим досвідом, знає свій предмет на відмінно.',
        'Дуже приємний у спілкуванні, завжди відповідає на питання.',
        'Рекомендую всім! Найкращий викладач на факультеті.',
        'Дуже якісна підготовка до екзаменів, все зрозуміло пояснює.',
        'Відмінний підхід до навчання, цікаві практичні завдання.',
        'Дуже допоміг у вивченні предмету, дякую!'
    ];
    
    let teacherCommentCount = 0;
    for (const teacher of createdTeachers) {
        const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 відгуків
        
        let totalRating = 0;
        const usedAuthors = new Set();
        
        for (let i = 0; i < numComments; i++) {
            // Обираємо випадкового автора, який ще не залишав відгук цьому викладачу
            let author;
            let attempts = 0;
            do {
                author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                attempts++;
            } while (usedAuthors.has(author._id.toString()) && attempts < 20);
            
            if (attempts >= 20) break; // Якщо всі студенти вже залишили відгук
            
            usedAuthors.add(author._id.toString());
            
            const rating = Math.floor(Math.random() * 3) + 3; // 3-5 зірок
            const reviewText = teacherReviewTexts[Math.floor(Math.random() * teacherReviewTexts.length)];
            
            await TeacherComment.create({
                teacherId: teacher._id,
                authorId: author._id,
                body: reviewText,
                rating: rating,
                status: 'visible'
            });
            
            totalRating += rating;
            teacherCommentCount++;
        }
        
        // Оновлюємо статистику викладача
        const avgRating = totalRating / numComments;
        teacher.comments = numComments;
        teacher.rating = parseFloat(avgRating.toFixed(1));
        teacher.likes = Math.floor(Math.random() * 10) + 5; // 5-14 лайків
        teacher.dislikes = Math.floor(Math.random() * 3); // 0-2 дизлайки
        teacher.totalVotes = teacher.likes + teacher.dislikes;
        await teacher.save();
    }
    console.log(`\n   📊 Створено відгуків викладачам: ${teacherCommentCount}\n`);

    // Підсумок
    console.log('═'.repeat(60));
    console.log('📊 ПІДСУМОК:');
    console.log('═'.repeat(60));
    console.log(`✅ Студентів: ${createdUsers.length}`);
    console.log(`✅ Викладачів: ${createdTeachers.length}`);
    console.log(`✅ Обговорень: ${createdAnnouncements.length}`);
    console.log(`✅ Коментарів: ${createdComments.length}`);
    console.log(`✅ Лайків на обговорення: ${reactionCount}`);
    console.log(`✅ Лайків на коментарі: ${commentReactionCount}`);
    console.log(`✅ Відгуків викладачам: ${teacherCommentCount}`);
    console.log('═'.repeat(60));
    console.log('\n✅ Демонстраційні дані успішно створені!\n');

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

seedDemoData().catch(console.error);

