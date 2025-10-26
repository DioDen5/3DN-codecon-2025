import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    socialLinks: {
        website: String,
        linkedin: String,
        twitter: String
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

userProfileSchema.index({ userId: 1 });

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
