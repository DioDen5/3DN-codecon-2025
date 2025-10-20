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
        index: { expireAfterSeconds: 0 } // TTL index
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

// Generate secure random token
passwordResetTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Check if token is valid and not expired
passwordResetTokenSchema.methods.isValid = function() {
    return !this.used && this.expiresAt > new Date();
};

// Mark token as used
passwordResetTokenSchema.methods.markAsUsed = function() {
    this.used = true;
    return this.save();
};

export const PasswordResetToken = mongoose.model('passwordResetTokens', passwordResetTokenSchema);