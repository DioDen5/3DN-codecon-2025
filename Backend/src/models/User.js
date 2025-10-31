import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email:      { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    displayName:  { type: String, required: true },
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    middleName: { type: String, required: false },
    // Ролі користувачів: student, teacher, admin
    role:      { type: String, enum: ['student','teacher','admin'], default: 'student' },
    status:    { type: String, enum: ['pending','verified','rejected','suspended'], default: 'pending', index: true },
    isOwner:   { type: Boolean, default: false },
    rememberMe: { type: Boolean, default: false },
    lastLoginEmail: { type: String, default: null },
    teacherPassword: { type: String, default: null },
    teacherPasswordSetAt: { type: Date, default: null },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
}, { versionKey: false });

userSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const User = mongoose.model('users', userSchema);
