import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    targetType: { type: String, enum: ['announcement','comment','review','user'], required: true },
    targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    reason:     { type: String, default: '' },
    status:     { type: String, enum: ['open','in_review','resolved','rejected'], default: 'open', index: true },
    handledBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    handledAt:  { type: Date, default: null },
    createdAt:  { type: Date, default: () => new Date() },
    updatedAt:  { type: Date, default: () => new Date() }
}, { versionKey: false });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

reportSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const Report = mongoose.model('reports', reportSchema);
