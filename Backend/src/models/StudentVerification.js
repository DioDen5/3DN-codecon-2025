import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId }, // якщо будеш робити колекцію files
    kind:   { type: String, default: '' }             // photo|card|other
}, { _id: false });

const studentVerificationSchema = new mongoose.Schema({
    userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    universityEmail:   { type: String, default: '' },
    studentCardNumber: { type: String, default: '' },
    attachments:       { type: [attachmentSchema], default: [] },
    status:            { type: String, enum: ['submitted','approved','rejected'], default: 'submitted', index: true },
    reviewedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    reviewedAt:        { type: Date, default: null },
    createdAt:         { type: Date, default: () => new Date() },
    updatedAt:         { type: Date, default: () => new Date() }
}, { versionKey: false });

studentVerificationSchema.index({ userId: 1, createdAt: -1 });

studentVerificationSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const StudentVerification = mongoose.model('student_verifications', studentVerificationSchema);
