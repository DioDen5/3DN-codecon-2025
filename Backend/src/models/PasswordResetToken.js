import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    used: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    }
}, { versionKey: false });

passwordResetTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

passwordResetTokenSchema.methods.isValid = function() {
    return !this.used && this.expiresAt > new Date();
};

passwordResetTokenSchema.methods.markAsUsed = function() {
    this.used = true;
    return this.save();
};

export const PasswordResetToken = mongoose.model('passwordResetTokens', passwordResetTokenSchema);