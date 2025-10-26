import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads', 'profile-pictures');

console.log('🧹 Cleaning up old profile pictures...');

if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory does not exist');
    process.exit(1);
}

try {
    const files = fs.readdirSync(uploadsDir);
    console.log(`📁 Found ${files.length} files in uploads directory`);
    
    let deletedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.mtime.getTime();
        const daysOld = fileAge / (1000 * 60 * 60 * 24);
        
        // Видаляємо файли старші 7 днів
        if (daysOld > 7) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Deleted old file: ${file} (${Math.round(daysOld)} days old)`);
            deletedCount++;
        }
    });
    
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} old files`);
    
} catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
}
