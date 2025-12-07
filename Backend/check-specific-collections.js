import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';

async function checkCollections() {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        
        const collectionsToCheck = [
            'emailverificationcodes',
            'passwordresettokens',
            'teacherclaimrequests',
            'refresh_tokens',
            'loginattempts'
        ];
        
        console.log('\n📊 Перевірка колекцій:\n');
        
        for (const collectionName of collectionsToCheck) {
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            const sample = await collection.findOne();
            
            console.log(`📦 ${collectionName}:`);
            console.log(`   Кількість документів: ${count}`);
            
            if (count > 0 && sample) {
                console.log(`   ✅ Є дані`);
                console.log(`   Приклад структури:`);
                console.log(`   ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
            } else {
                console.log(`   ⚠️  Колекція порожня`);
            }
            console.log('');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Помилка:', error);
        process.exit(1);
    }
}

checkCollections();

