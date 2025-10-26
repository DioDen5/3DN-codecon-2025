import mongoose from 'mongoose';

const securitySettingsSchema = new mongoose.Schema({
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    sessionTimeout: {
        type: Number,
        default: 30, // хвилини
        min: 5,
        max: 480
    },
    idleTimeout: {
        type: Number,
        default: 30, // хвилини неактивності
        min: 5,
        max: 120
    },
    maxLoginAttempts: {
        type: Number,
        default: 5,
        min: 3,
        max: 10
    },
    lockoutDuration: {
        type: Number,
        default: 15, 
        min: 5,
        max: 60
    },
    passwordMinLength: {
        type: Number,
        default: 8,
        min: 6,
        max: 20
    },
    requireSpecialChars: {
        type: Boolean,
        default: true
    },
    requireNumbers: {
        type: Boolean,
        default: true
    },
    requireUppercase: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
securitySettingsSchema.index({ createdAt: -1 });

export const SecuritySettings = mongoose.model('SecuritySettings', securitySettingsSchema);
