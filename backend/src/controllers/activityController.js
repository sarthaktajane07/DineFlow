import activityService from '../services/activityService.js';

/**
 * @desc    Get recent activities
 * @route   GET /api/activities
 * @access  Private
 */
export const getActivities = async (req, res, next) => {
    try {
        const activities = await activityService.getRecent(50);

        res.status(200).json({
            success: true,
            count: activities.length,
            data: { activities },
        });
    } catch (error) {
        next(error);
    }
};
