import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    targetType: { type: String, enum: ['announcement','comment','review'], required: true },
    targetId:   { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    value:      { type: Number, enum: [1, -1], required: true },
    createdAt:  { type: Date, default: () => new Date() }
}, { versionKey: false });

// один користувач — одна реакція на конкретну ціль
reactionSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export const Reaction = mongoose.model('reactions', reactionSchema);
