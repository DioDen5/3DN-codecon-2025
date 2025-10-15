import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
    avgRating: { type: Number, default: 0 },  // денормалізований середній бал
    reviews:   { type: Number, default: 0 }   // денормалізована кількість відгуків
}, { _id: false });

const teacherSchema = new mongoose.Schema({
    fullName:   { type: String, required: true, index: true },
    department: { type: String, default: '', index: true },
    position:   { type: String, default: '' },
    photoUrl:   { type: String, default: '' },
    metrics:    { type: metricsSchema, default: () => ({}) },
    createdAt:  { type: Date, default: () => new Date() },
    updatedAt:  { type: Date, default: () => new Date() }
}, { versionKey: false });

teacherSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const Teacher = mongoose.model('teachers', teacherSchema);
