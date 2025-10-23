import express from 'express';
import { Report } from '../models/Report.js';
import { authRequired } from '../middleware/auth.js';
import { requireVerified } from '../middleware/requireVerified.js';

const router = express.Router();

// Create a new report
router.post('/', authRequired, requireVerified, async (req, res) => {
    try {
        const { targetType, targetId, reason = '' } = req.body;

        if (!['announcement', 'comment', 'review', 'user'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid targetType' });
        }

        if (!targetId) {
            return res.status(400).json({ error: 'targetId is required' });
        }

        const reporterId = req.user?.id;
        if (!reporterId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user already reported this target
        const existingReport = await Report.findOne({
            targetType,
            targetId,
            reporterId
        });

        if (existingReport) {
            return res.status(400).json({ error: 'You have already reported this content' });
        }

        const report = await Report.create({
            targetType,
            targetId,
            reporterId,
            reason: reason.trim()
        });

        res.status(201).json({
            ok: true,
            report: {
                id: report._id,
                targetType: report.targetType,
                targetId: report.targetId,
                reason: report.reason,
                status: report.status,
                createdAt: report.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// Get user's reports
router.get('/my', authRequired, requireVerified, async (req, res) => {
    try {
        const reporterId = req.user?.id;
        if (!reporterId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const reports = await Report.find({ reporterId })
            .sort({ createdAt: -1 })
            .select('targetType targetId reason status createdAt updatedAt');

        res.json({ reports });
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

export default router;
