import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';

async function checkCollections() {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\n📊 Колекції в базі даних:');
        console.log(`Всього: ${collections.length}\n`);
        collections.forEach((c, i) => {
            console.log(`${i + 1}. ${c.name}`);
        });
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Помилка:', error);
        process.exit(1);
    }
}

checkCollections();

