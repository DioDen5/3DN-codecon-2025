import mongoose from 'mongoose';

const emailVerificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ['login', 'registration'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    used: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    blockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

emailVerificationCodeSchema.index({ email: 1, type: 1, used: 1 });
emailVerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

emailVerificationCodeSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

emailVerificationCodeSchema.methods.isBlocked = function() {
    if (!this.blockedUntil) return false;
    return new Date() < this.blockedUntil;
};

emailVerificationCodeSchema.methods.incrementAttempts = async function() {
    this.attempts += 1;
    if (this.attempts >= 5) {
        this.blockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.save();
};

emailVerificationCodeSchema.methods.markAsUsed = async function() {
    this.used = true;
    await this.save();
};

emailVerificationCodeSchema.statics.generateCode = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const EmailVerificationCode = mongoose.model('EmailVerificationCode', emailVerificationCodeSchema);

