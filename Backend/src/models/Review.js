import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'teachers', required: true, index: true },
    authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    isAnonymous:{ type: Boolean, default: false },
    rating:     { type: Number, min: 1, max: 10, required: true }, // у тебе в UI 10-бальна шкала
    text:       { type: String, default: '' },
    status:     { type: String, enum: ['pending','published','hidden'], default: 'pending', index: true },
    semester:   { type: String, required: true }, // напр. "2025-Fall"
    createdAt:  { type: Date, default: () => new Date() },
    updatedAt:  { type: Date, default: () => new Date() }
}, { versionKey: false });

reviewSchema.index({ teacherId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ authorId: 1, teacherId: 1, semester: 1 }, { unique: true });

reviewSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const Review = mongoose.model('reviews', reviewSchema);
