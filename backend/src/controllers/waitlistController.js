import WaitlistEntry from '../models/WaitlistEntry.js';
import Table from '../models/Table.js';
import ServiceHistory from '../models/ServiceHistory.js';
import socketHandler from '../socket/socketHandler.js';
import twilioService from '../services/twilioService.js';

/**
 * @desc    Get all waitlist entries
 * @route   GET /api/waitlist
 * @access  Private
 */
export const getWaitlist = async (req, res, next) => {
    try {
        const { status, priority } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const entries = await WaitlistEntry.find(filter)
            .populate('assignedTable', 'tableNumber seats')
            .populate('addedBy', 'fullName')
            .sort({ createdAt: 1 });

        // Add queue position to each entry
        const entriesWithPosition = await Promise.all(
            entries.map(async (entry) => {
                const position = await entry.getQueuePosition();
                return {
                    ...entry.toJSON(),
                    queuePosition: position,
                };
            })
        );

        res.status(200).json({
            success: true,
            count: entries.length,
            data: { waitlist: entriesWithPosition },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single waitlist entry
 * @route   GET /api/waitlist/:id
 * @access  Private
 */
export const getWaitlistEntry = async (req, res, next) => {
    try {
        const entry = await WaitlistEntry.findById(req.params.id)
            .populate('assignedTable')
            .populate('addedBy', 'fullName');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Waitlist entry not found',
            });
        }

        const position = await entry.getQueuePosition();

        res.status(200).json({
            success: true,
            data: {
                entry: {
                    ...entry.toJSON(),
                    queuePosition: position,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add to waitlist
 * @route   POST /api/waitlist
 * @access  Private
 */
export const addToWaitlist = async (req, res, next) => {
    try {
        const {
            guestName,
            phoneNumber,
            partySize,
            priority,
            notificationPreference,
            notes,
            estimatedWaitTime,
        } = req.body;

        // Create entry
        const entry = await WaitlistEntry.create({
            guestName,
            phoneNumber,
            partySize,
            priority: priority || 'normal',
            notificationPreference: notificationPreference || 'sms',
            notes,
            estimatedWaitTime: estimatedWaitTime || 0,
            addedBy: req.user._id,
        });

        await entry.populate('addedBy', 'fullName');

        // Get queue position
        const position = await entry.getQueuePosition();

        // Send confirmation notification
        const notificationResult = await twilioService.sendWaitlistConfirmation(
            guestName,
            phoneNumber,
            partySize,
            estimatedWaitTime || 15,
            notificationPreference
        );

        // Emit socket event
        socketHandler.emitWaitlistAdded(entry);

        res.status(201).json({
            success: true,
            message: 'Added to waitlist successfully',
            data: {
                entry: {
                    ...entry.toJSON(),
                    queuePosition: position,
                },
                notification: notificationResult,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update waitlist entry
 * @route   PUT /api/waitlist/:id
 * @access  Private
 */
export const updateWaitlistEntry = async (req, res, next) => {
    try {
        const { status, estimatedWaitTime, notes, priority } = req.body;

        const entry = await WaitlistEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Waitlist entry not found',
            });
        }

        // Update fields
        if (status) entry.status = status;
        if (estimatedWaitTime !== undefined) entry.estimatedWaitTime = estimatedWaitTime;
        if (notes !== undefined) entry.notes = notes;
        if (priority) entry.priority = priority;

        await entry.save();
        await entry.populate('assignedTable addedBy');

        // Emit socket event
        socketHandler.emitWaitlistUpdate(entry);

        res.status(200).json({
            success: true,
            message: 'Waitlist entry updated',
            data: { entry },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Notify guest (table ready)
 * @route   POST /api/waitlist/:id/notify
 * @access  Private
 */
export const notifyGuest = async (req, res, next) => {
    try {
        const { tableNumber } = req.body || {};

        const entry = await WaitlistEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Waitlist entry not found',
            });
        }

        if (entry.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                message: 'Can only notify guests with waiting status',
            });
        }

        // Send notification
        const result = await twilioService.notifyTableReady(
            entry.guestName,
            entry.phoneNumber,
            tableNumber,
            entry.notificationPreference
        );

        // Update entry
        entry.status = 'notified';
        entry.notifiedAt = new Date();
        await entry.save();

        // Emit socket event
        socketHandler.emitNotificationSent({
            entryId: entry._id,
            guestName: entry.guestName,
            tableNumber,
            result,
        });

        socketHandler.emitWaitlistUpdate(entry);

        res.status(200).json({
            success: true,
            message: 'Guest notified successfully',
            data: { entry, notification: result },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Seat guest at table
 * @route   POST /api/waitlist/:id/seat
 * @access  Private
 */
export const seatGuest = async (req, res, next) => {
    try {
        const { tableId } = req.body;

        const entry = await WaitlistEntry.findById(req.params.id);
        const table = await Table.findById(tableId);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Waitlist entry not found',
            });
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found',
            });
        }

        if (table.status !== 'free') {
            return res.status(400).json({
                success: false,
                message: 'Table is not available',
            });
        }

        // Update entry
        entry.status = 'seated';
        entry.assignedTable = tableId;
        entry.seatedAt = new Date();
        await entry.save();

        // Update table
        table.status = 'occupied';
        table.currentGuest = entry._id;
        table.occupiedAt = new Date();
        await table.save();

        // Create service history record
        await ServiceHistory.create({
            table: tableId,
            waitlistEntry: entry._id,
            waiter: table.assignedWaiter || req.user._id,
            guestName: entry.guestName,
            partySize: entry.partySize,
            seatedAt: new Date(),
            waitTime: entry.actualWaitTime,
        });

        // Emit socket events
        socketHandler.emitGuestSeated({
            entry,
            table,
        });

        socketHandler.emitWaitlistUpdate(entry);
        socketHandler.emitTableUpdate(table);

        res.status(200).json({
            success: true,
            message: 'Guest seated successfully',
            data: { entry, table },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove from waitlist
 * @route   DELETE /api/waitlist/:id
 * @access  Private
 */
export const removeFromWaitlist = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const entry = await WaitlistEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Waitlist entry not found',
            });
        }

        if (reason === 'no-show') {
            entry.status = 'no-show';
            await entry.save();
        } else if (reason === 'cancelled') {
            entry.status = 'cancelled';
            entry.cancelledAt = new Date();
            await entry.save();
        } else {
            await entry.deleteOne();
        }

        // Emit socket event
        socketHandler.emitWaitlistRemoved(entry._id);

        res.status(200).json({
            success: true,
            message: 'Removed from waitlist',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get waitlist statistics
 * @route   GET /api/waitlist/stats/overview
 * @access  Private
 */
export const getWaitlistStats = async (req, res, next) => {
    try {
        const totalWaiting = await WaitlistEntry.countDocuments({ status: 'waiting' });
        const totalNotified = await WaitlistEntry.countDocuments({ status: 'notified' });
        const totalSeated = await WaitlistEntry.countDocuments({ status: 'seated' });

        // Calculate average wait time for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const seatedToday = await WaitlistEntry.find({
            status: 'seated',
            seatedAt: { $gte: today },
        });

        const avgWaitTime =
            seatedToday.length > 0
                ? seatedToday.reduce((sum, entry) => sum + (entry.actualWaitTime || 0), 0) /
                seatedToday.length
                : 0;

        const stats = {
            waiting: totalWaiting,
            notified: totalNotified,
            seatedToday: totalSeated,
            averageWaitTime: Math.round(avgWaitTime),
            totalGuests: totalWaiting + totalNotified,
        };

        res.status(200).json({
            success: true,
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};
