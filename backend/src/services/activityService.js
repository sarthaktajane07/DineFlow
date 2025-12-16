import ActivityLog from '../models/ActivityLog.js';
import socketHandler from '../socket/socketHandler.js';

class ActivityService {
    /**
     * Log an activity and emit it via socket
     * @param {Object} data Activity data
     * @param {string} data.type - 'table', 'waitlist', 'notification', 'auth'
     * @param {string} data.action - Short action code (e.g. 'table_update')
     * @param {string} data.description - Human readable message
     * @param {string} [data.userId] - ID of user performing action
     * @param {Object} [data.metadata] - Extra data
     */
    async log(data) {
        try {
            const { type, action, description, userId, metadata } = data;

            const activity = await ActivityLog.create({
                type,
                action,
                description,
                performedBy: userId || null,
                metadata: metadata || {}
            });

            // Populate user details if available for the socket emission
            if (userId) {
                await activity.populate('performedBy', 'fullName');
            }

            // Emit via socket
            socketHandler.emitActivity(activity);

            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw error to prevent blocking main flow
            return null;
        }
    }

    /**
     * Get recent activities
     * @param {number} limit 
     */
    async getRecent(limit = 20) {
        return await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('performedBy', 'fullName');
    }
}

export default new ActivityService();
