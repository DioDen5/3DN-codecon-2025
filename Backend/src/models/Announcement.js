import mongoose from 'mongoose';

const aiFlagsSchema = new mongoose.Schema({
    model: String,
    version: String,
    toxicity: Number,
    flags: { type: [String], default: [] }
}, { _id: false });

const moderationSchema = new mongoose.Schema({
    lastAction: String,            // submit|publish|hide
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    at: Date,
    reason: String
}, { _id: false });

const metricsSchema = new mongoose.Schema({
    views:    { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
}, { _id: false });

const announcementSchema = new mongoose.Schema({
    title:   { type: String, required: true },
    body:    { type: String, required: true },
    authorId:{ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    tags:    { type: [String], default: [] },
    status:  { type: String, enum: ['draft','pending','published','hidden'], default: 'draft', index: true },
    pinned:  { type: Boolean, default: false, index: true },
    visibility: { type: String, enum: ['students','public'], default: 'students' },
    metrics: { type: metricsSchema, default: () => ({}) },
    moderation: { type: moderationSchema, default: () => ({}) },
    aiFlags: { type: aiFlagsSchema, default: () => ({}) },
    publishedAt: { type: Date, default: null, index: true },
    isApproved: { type: Boolean, default: false, index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    approvedAt: { type: Date, default: null },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
}, { versionKey: false });

announcementSchema.index({ status: 1, pinned: -1, publishedAt: -1 }); // композит
announcementSchema.index({ title: 'text', body: 'text', tags: 'text' });

announcementSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

export const Announcement = mongoose.model('announcements', announcementSchema);
