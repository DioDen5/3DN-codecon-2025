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
    faculty: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: false, // Тепер опціональне
        trim: true
    },
    subject: {
        type: String,
        required: false,
        trim: true
    },
    subjects: {
        type: [String],
        default: [],
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    // Email викладача для автоматичної прив'язки
    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: true
    },
    // ID користувача, якому належить профіль
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
        index: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    lastEditedAt: {
        type: Date,
        default: null
    },
    pendingChanges: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500
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