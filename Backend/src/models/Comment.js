import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const commentSchema = new Schema(
    {
        announcementId: {
            type: Types.ObjectId,
            ref: 'announcements',
            required: true,
            index: true,
        },
        authorId: {
            type: Types.ObjectId,
            ref: 'users',
            required: true,
            index: true,
        },
        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        status: {
            type: String,
            enum: ['visible', 'hidden'],
            default: 'visible',
            index: true,
        },
        isApproved: { type: Boolean, default: false, index: true },
        approvedBy: { type: Types.ObjectId, ref: 'users', default: null },
        approvedAt: { type: Date, default: null },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

commentSchema.index({ announcementId: 1, createdAt: -1 });

export const Comment = mongoose.model('comments', commentSchema);
