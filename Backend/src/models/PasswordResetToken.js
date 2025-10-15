import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    token:     { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: () => new Date() },
    usedAt:    { type: Date, default: null } // якщо треба відмічати використання
}, { versionKey: false });

// TTL: документ буде видалено, коли настане expiresAt
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model('password_reset_tokens', passwordResetTokenSchema);
