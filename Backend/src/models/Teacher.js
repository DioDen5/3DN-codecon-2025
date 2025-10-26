import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    university: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    },
    totalVotes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

teacherSchema.virtual('averageRating').get(function() {
    if (this.totalVotes === 0) return 0;
    const positiveVotes = this.likes;
    const negativeVotes = this.dislikes;
    const totalVotes = positiveVotes + negativeVotes;
    
    if (totalVotes === 0) return 0;
    
    const percentage = (positiveVotes / totalVotes) * 100;
    return Math.round((percentage / 10) * 10) / 10;
});

teacherSchema.methods.calculateRating = function() {
    if (this.totalVotes === 0) return 0;
    
    return this.rating || 0;
};

teacherSchema.set('toJSON', { virtuals: true });

export const Teacher = mongoose.model('Teacher', teacherSchema);