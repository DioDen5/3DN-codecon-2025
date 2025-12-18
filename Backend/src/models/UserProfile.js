import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true,
        index: true
    },
    profilePicture: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
