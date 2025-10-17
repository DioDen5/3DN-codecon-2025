import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    rotatedAt: { type: Date },
    userAgent: { type: String },
    ip: { type: String },
}, { timestamps: true, versionKey: false });

schema.index({ userId: 1, expiresAt: -1 });

export const RefreshToken = mongoose.model('refresh_tokens', schema);
