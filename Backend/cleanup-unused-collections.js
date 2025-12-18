import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { ENV } from './src/config/env.js';

async function cleanupUnusedCollections() {
    try {
        console.log('🔌 Підключення до MongoDB...');
        await connectDB();

        const db = mongoose.connection.db;

        console.log('\n📊 Перевірка наявних колекцій...');
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('Наявні колекції:', collectionNames.join(', '));

        const collectionsToRemove = [
            'reviews',
            'student_verifications'
        ];

        console.log('\n🗑️  Початок очищення...\n');

        for (const collectionName of collectionsToRemove) {
            if (collectionNames.includes(collectionName)) {
                const collection = db.collection(collectionName);
                const count = await collection.countDocuments();

                if (count > 0) {
                    console.log(`⚠️  Знайдено ${count} документів у колекції "${collectionName}"`);
                    console.log(`   Видалення колекції "${collectionName}"...`);
                    await db.dropCollection(collectionName);
                    console.log(`   ✅ Колекція "${collectionName}" успішно видалена\n`);
                } else {
                    console.log(`ℹ️  Колекція "${collectionName}" порожня`);
                    await db.dropCollection(collectionName);
                    console.log(`   ✅ Колекція "${collectionName}" успішно видалена\n`);
                }
            } else {
                console.log(`ℹ️  Колекція "${collectionName}" не існує, пропускаємо\n`);
            }
        }

        console.log('✅ Очищення завершено успішно!');
        console.log('\n📋 Оновлений список колекцій:');
        const remainingCollections = await db.listCollections().toArray();
        console.log(remainingCollections.map(c => `   - ${c.name}`).join('\n'));

    } catch (error) {
        console.error('❌ Помилка під час очищення:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 З\'єднання з MongoDB закрито');
        process.exit(0);
    }
}

cleanupUnusedCollections();

