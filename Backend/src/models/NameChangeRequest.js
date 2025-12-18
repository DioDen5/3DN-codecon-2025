import mongoose from 'mongoose';

const nameChangeRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    currentFirstName: { type: String, required: true },
    currentLastName: { type: String, required: true },
    currentDisplayName: { type: String, required: true },
    newFirstName: { type: String, required: true },
    newLastName: { type: String, required: true },
    newMiddleName: { type: String, required: false },
    newDisplayName: { type: String, required: true },
    reason: { type: String, required: false },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    reviewComment: { type: String, required: false },
    reviewedAt: { type: Date, required: false },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
}, { versionKey: false });

nameChangeRequestSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const NameChangeRequest = mongoose.model('nameChangeRequests', nameChangeRequestSchema);
