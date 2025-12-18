import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Teacher } from './src/models/Teacher.js';
import { Comment } from './src/models/Comment.js';
import { TeacherComment } from './src/models/TeacherComment.js';
import { Reaction } from './src/models/Reaction.js';
import { Announcement } from './src/models/Announcement.js';
import { Report } from './src/models/Report.js';
import { NameChangeRequest } from './src/models/NameChangeRequest.js';
import { PasswordResetToken } from './src/models/PasswordResetToken.js';
import { EmailVerificationCode } from './src/models/EmailVerificationCode.js';
import { RefreshToken } from './src/models/RefreshToken.js';
import { LoginAttempt } from './src/models/LoginAttempt.js';
import { TeacherClaimRequest } from './src/models/TeacherClaimRequest.js';
import { ActivityLog } from './src/models/ActivityLog.js';
import { UserProfile } from './src/models/UserProfile.js';

async function cleanupAllData() {
    await connectDB();
    const db = mongoose.connection.db;

    console.log('\n🧹 Початок очищення бази даних...\n');
    console.log('⚠️  АДМІНИ НЕ БУДУТЬ ВИДАЛЕНІ\n');

    const admins = await User.find({ role: 'admin' });
    console.log(`📋 Знайдено адмінів: ${admins.length}`);
    if (admins.length > 0) {
        admins.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.displayName})`);
        });
    }
    console.log('');

    const adminIds = admins.map(a => a._id);
    const adminEmails = admins.map(a => a.email.toLowerCase());

    let totalDeleted = 0;

    console.log('1️⃣  Видалення студентів...');
    const studentsResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`   ✅ Видалено студентів: ${studentsResult.deletedCount}`);
    totalDeleted += studentsResult.deletedCount;

    console.log('\n2️⃣  Видалення викладачів...');
    const teachersResult = await Teacher.deleteMany({});
    console.log(`   ✅ Видалено викладачів: ${teachersResult.deletedCount}`);
    totalDeleted += teachersResult.deletedCount;

    console.log('\n3️⃣  Видалення коментарів до обговорень...');
    const commentsResult = await Comment.deleteMany({});
    console.log(`   ✅ Видалено коментарів: ${commentsResult.deletedCount}`);
    totalDeleted += commentsResult.deletedCount;

    console.log('\n4️⃣  Видалення коментарів викладачів...');
    const teacherCommentsResult = await TeacherComment.deleteMany({});
    console.log(`   ✅ Видалено коментарів викладачів: ${teacherCommentsResult.deletedCount}`);
    totalDeleted += teacherCommentsResult.deletedCount;

    console.log('\n5️⃣  Видалення реакцій...');
    const reactionsResult = await Reaction.deleteMany({});
    console.log(`   ✅ Видалено реакцій: ${reactionsResult.deletedCount}`);
    totalDeleted += reactionsResult.deletedCount;

    console.log('\n6️⃣  Видалення обговорень...');
    const announcementsResult = await Announcement.deleteMany({});
    console.log(`   ✅ Видалено обговорень: ${announcementsResult.deletedCount}`);
    totalDeleted += announcementsResult.deletedCount;

    console.log('\n7️⃣  Видалення репортів...');
    const reportsResult = await Report.deleteMany({});
    console.log(`   ✅ Видалено репортів: ${reportsResult.deletedCount}`);
    totalDeleted += reportsResult.deletedCount;

    console.log('\n8️⃣  Видалення запитів на зміну імені...');
    const nameChangeRequestsResult = await NameChangeRequest.deleteMany({});
    console.log(`   ✅ Видалено запитів на зміну імені: ${nameChangeRequestsResult.deletedCount}`);
    totalDeleted += nameChangeRequestsResult.deletedCount;

    console.log('\n9️⃣  Видалення токенів скидання пароля...');
    const passwordResetTokensResult = await PasswordResetToken.deleteMany({});
    console.log(`   ✅ Видалено токенів скидання пароля: ${passwordResetTokensResult.deletedCount}`);
    totalDeleted += passwordResetTokensResult.deletedCount;

    console.log('\n🔟 Видалення кодів верифікації...');
    const verificationCodesResult = await EmailVerificationCode.deleteMany({});
    console.log(`   ✅ Видалено кодів верифікації: ${verificationCodesResult.deletedCount}`);
    totalDeleted += verificationCodesResult.deletedCount;

    console.log('\n1️⃣1️⃣ Видалення refresh токенів...');
    const refreshTokensResult = await RefreshToken.deleteMany({});
    console.log(`   ✅ Видалено refresh токенів: ${refreshTokensResult.deletedCount}`);
    totalDeleted += refreshTokensResult.deletedCount;

    console.log('\n1️⃣2️⃣ Видалення спроб входу...');
    const loginAttemptsResult = await LoginAttempt.deleteMany({});
    console.log(`   ✅ Видалено спроб входу: ${loginAttemptsResult.deletedCount}`);
    totalDeleted += loginAttemptsResult.deletedCount;

    console.log('\n1️⃣3️⃣ Видалення заявок на профіль викладача...');
    const claimsResult = await TeacherClaimRequest.deleteMany({});
    console.log(`   ✅ Видалено заявок: ${claimsResult.deletedCount}`);
    totalDeleted += claimsResult.deletedCount;

    console.log('\n1️⃣4️⃣ Видалення профілів користувачів...');
    const userProfilesResult = await UserProfile.deleteMany({});
    console.log(`   ✅ Видалено профілів: ${userProfilesResult.deletedCount}`);
    totalDeleted += userProfilesResult.deletedCount;

    console.log('\n1️⃣5️⃣ Видалення логів активності...');
    let activityLogsResult;
    if (adminIds.length > 0) {

        activityLogsResult = await ActivityLog.deleteMany({
            userId: { $nin: adminIds }
        });
    } else {

        activityLogsResult = await ActivityLog.deleteMany({});
    }
    console.log(`   ✅ Видалено логів активності: ${activityLogsResult.deletedCount}`);
    totalDeleted += activityLogsResult.deletedCount;

    const remainingAdmins = await User.find({ role: 'admin' });
    console.log('\n' + '═'.repeat(60));
    console.log('📊 ПІДСУМОК:');
    console.log('═'.repeat(60));
    console.log(`✅ Всього видалено документів: ${totalDeleted}`);
    console.log(`👑 Адмінів залишилося: ${remainingAdmins.length}`);
    if (remainingAdmins.length > 0) {
        console.log('\n📋 Список адмінів:');
        remainingAdmins.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.displayName})`);
        });
    }
    console.log('\n✅ Очищення завершено успішно!\n');

    await mongoose.disconnect();
    console.log('🔌 З\'єднання з MongoDB закрито\n');
}

cleanupAllData().catch(console.error);

