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
        required: false,
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

    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },

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
    position: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    comments: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

teacherSchema.methods.calculateRating = function() {
    return this.rating || 0;
};

teacherSchema.set('toJSON', { virtuals: true });

export const Teacher = mongoose.model('Teacher', teacherSchema);