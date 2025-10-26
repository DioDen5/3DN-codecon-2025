import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    success: {
        type: Boolean,
        default: false
    },
    failureReason: {
        type: String,
        enum: ['invalid_credentials', 'account_locked', 'account_not_verified', 'other'],
        default: 'invalid_credentials'
    },
    attemptTime: {
        type: Date,
        default: Date.now
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

loginAttemptSchema.index({ email: 1, attemptTime: -1 });
loginAttemptSchema.index({ ipAddress: 1, attemptTime: -1 });
loginAttemptSchema.index({ blockedUntil: 1 });

export const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
