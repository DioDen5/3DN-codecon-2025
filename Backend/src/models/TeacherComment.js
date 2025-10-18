import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const teacherCommentSchema = new Schema(
    {
        teacherId: {
            type: Types.ObjectId,
            ref: 'teachers',
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
        },
        rating: {
            type: Number,
            enum: [1, -1],
            required: true,
        },
        status: {
            type: String,
            enum: ['visible', 'hidden', 'deleted'],
            default: 'visible',
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

teacherCommentSchema.index({ teacherId: 1, createdAt: -1 });
teacherCommentSchema.index({ authorId: 1 });

export const TeacherComment = mongoose.model('teachercomments', teacherCommentSchema);
