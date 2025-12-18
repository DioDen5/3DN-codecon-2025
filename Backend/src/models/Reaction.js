import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const reactionSchema = new Schema(
    {
        targetType: {
            type: String,
            enum: ['announcement', 'comment', 'review', 'teacher'],
            required: true,
            index: true,
        },
        targetId: {
            type: Types.ObjectId,
            required: true,
            index: true,
        },
        userId: {
            type: Types.ObjectId,
            ref: 'users',
            required: true,
            index: true,
        },
        value: {
            type: Number,
            enum: [1, -1],
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

reactionSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

reactionSchema.index({ targetType: 1, targetId: 1, value: 1 });

export const Reaction = mongoose.model('reactions', reactionSchema);
