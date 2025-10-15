import mongoose from 'mongoose';

const emailVerifyTokenSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    token:     { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: () => new Date() },
    usedAt:    { type: Date, default: null }
}, { versionKey: false });

emailVerifyTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerifyToken = mongoose.model('email_verify_tokens', emailVerifyTokenSchema);
