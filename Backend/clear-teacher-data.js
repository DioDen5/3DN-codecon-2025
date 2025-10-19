const mongoose = require('mongoose');
const Teacher = require('./src/models/Teacher');
const TeacherComment = require('./src/models/TeacherComment');
const Reaction = require('./src/models/Reaction');

async function clearTeacherData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/studlink');
        console.log('Connected to MongoDB');
        
        const teacher = await Teacher.findOne({ name: /Ткачук.*Ірини/i });
        if (teacher) {
            console.log('Found teacher:', teacher.name, 'ID:', teacher._id);
            
            const deletedComments = await TeacherComment.deleteMany({ teacherId: teacher._id });
            console.log('Deleted comments:', deletedComments.deletedCount);
            
            const deletedReactions = await Reaction.deleteMany({ 
                targetType: 'teacher', 
                targetId: teacher._id 
            });
            console.log('Deleted reactions:', deletedReactions.deletedCount);
            
            teacher.likes = 0;
            teacher.dislikes = 0;
            teacher.comments = 0;
            teacher.totalVotes = 0;
            await teacher.save();
            console.log('Reset teacher stats');
            
        } else {
            console.log('Teacher not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

clearTeacherData();
