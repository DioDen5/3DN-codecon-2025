import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'announcements', required: true, index: true },
    authorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    body:           { type: String, required: true, maxlength: 5000 },
    status:         { type: String, enum: ['visible','hidden'], default: 'visible', index: true },
    createdAt:      { type: Date, default: () => new Date() },
    updatedAt:      { type: Date, default: () => new Date() }
}, { versionKey: false });

commentSchema.index({ announcementId: 1, createdAt: -1 });

commentSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const Comment = mongoose.model('comments', commentSchema);
