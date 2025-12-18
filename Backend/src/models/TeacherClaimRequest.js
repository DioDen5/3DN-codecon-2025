import mongoose from 'mongoose';

const teacherClaimRequestSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    teacherName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    adminNotes: {
        type: String,
        trim: true
    },
    processedAt: {
        type: Date,
        default: null
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    }
}, {
    timestamps: true
});

teacherClaimRequestSchema.index({ status: 1, createdAt: -1 });

teacherClaimRequestSchema.index({ userId: 1, teacherId: 1, status: 1 });

export const TeacherClaimRequest = mongoose.model('TeacherClaimRequest', teacherClaimRequestSchema);

