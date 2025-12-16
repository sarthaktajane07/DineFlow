import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['table', 'waitlist', 'notification', 'auth', 'system'],
        },
        action: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        metadata: {
            tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
            waitlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'WaitlistEntry' },
            targetName: String, // e.g., "Table 5" or "John Doe"
        }
    },
    {
        timestamps: true,
        // Expire logs after 24 hours to keep DB light if needed, or keep indefinitely
        // expireAfterSeconds: 86400 
    }
);

// Index for quick sorting by latest
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
