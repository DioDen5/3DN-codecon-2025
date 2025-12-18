import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user_registered',
            'user_verified',
            'announcement_created',
            'announcement_published',
            'announcement_deleted',
            'comment_created',
            'comment_reported',
            'comment_moderated',
            'teacher_review_created',
            'teacher_review_deleted',
            'name_change_requested',
            'name_change_approved',
            'name_change_rejected',
            'nickname_change_requested',
            'report_created',
            'report_resolved',
            'user_blocked',
            'user_unblocked'
        ]
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

activityLogSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'щойно';
    if (diffMinutes < 60) return `${diffMinutes}хв тому`;
    if (diffHours < 24) return `${diffHours}г тому`;
    if (diffDays < 7) return `${diffDays}д тому`;

    return this.createdAt.toLocaleDateString('uk-UA');
});

activityLogSchema.statics.logActivity = async function(userId, action, description, metadata = {}) {
    try {
        const activity = new this({
            userId,
            action,
            description,
            metadata
        });

        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
};

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
