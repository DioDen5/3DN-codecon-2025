import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import 'dotenv/config';

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studlink');
        console.log('MongoDB connected');

        const users = await User.find({}, 'email displayName createdAt');
        console.log('\n=== USERS IN DATABASE ===');
        console.log(`Total users: ${users.length}`);
        console.log('---');
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Name: ${user.displayName}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

listUsers();
