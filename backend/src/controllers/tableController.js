import Table from '../models/Table.js';
import socketHandler from '../socket/socketHandler.js';
import activityService from '../services/activityService.js';

/**
 * @desc    Get all tables
 * @route   GET /api/tables
 * @access  Private
 */
export const getTables = async (req, res, next) => {
    try {
        const { status, zone, isActive } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (zone) filter.zone = zone;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const tables = await Table.find(filter)
            .populate('currentGuest', 'guestName partySize phoneNumber')
            .populate('assignedWaiter', 'fullName email')
            .sort({ tableNumber: 1 });

        res.status(200).json({
            success: true,
            count: tables.length,
            data: { tables },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single table
 * @route   GET /api/tables/:id
 * @access  Private
 */
export const getTable = async (req, res, next) => {
    try {
        const table = await Table.findById(req.params.id)
            .populate('currentGuest')
            .populate('assignedWaiter', 'fullName email');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found',
            });
        }

        res.status(200).json({
            success: true,
            data: { table },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new table
 * @route   POST /api/tables
 * @access  Private (Manager only)
 */
export const createTable = async (req, res, next) => {
    try {
        const table = await Table.create(req.body);

        // Emit socket event
        socketHandler.emitTableCreated(table);

        // Log activity
        await activityService.log({
            type: 'table',
            action: 'create',
            description: `Created Table ${table.tableNumber} (${table.seats} seats)`,
            userId: req.user._id,
            metadata: { tableId: table._id }
        });

        res.status(201).json({
            success: true,
            message: 'Table created successfully',
            data: { table },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update table
 * @route   PUT /api/tables/:id
 * @access  Private
 */
export const updateTable = async (req, res, next) => {
    try {
        const { status, assignedWaiter, position, zone, shape } = req.body;

        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found',
            });
        }

        // Update fields
        if (status) {
            table.status = status;
            if (status === 'occupied' && !table.occupiedAt) {
                table.occupiedAt = new Date();
            } else if (status === 'free') {
                table.occupiedAt = null;
                table.currentGuest = null;
            }
        }
        if (assignedWaiter !== undefined) table.assignedWaiter = assignedWaiter;
        if (position) table.position = position;
        if (zone) table.zone = zone;
        if (shape) table.shape = shape;

        await table.save();
        await table.populate('currentGuest assignedWaiter');

        // Emit socket event
        socketHandler.emitTableUpdate(table);

        // Log activity
        let updateDesc = `Updated Table ${table.tableNumber}`;
        if (status) updateDesc += ` status to ${status}`;

        await activityService.log({
            type: 'table',
            action: 'update',
            description: updateDesc,
            userId: req.user._id,
            metadata: { tableId: table._id }
        });

        res.status(200).json({
            success: true,
            message: 'Table updated successfully',
            data: { table },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete table
 * @route   DELETE /api/tables/:id
 * @access  Private (Manager only)
 */
export const deleteTable = async (req, res, next) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found',
            });
        }

        // Check if table is occupied
        if (table.status === 'occupied') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete an occupied table',
            });
        }

        await table.deleteOne();

        // Emit socket event
        socketHandler.emitTableDeleted(table._id);

        // Log activity
        await activityService.log({
            type: 'table',
            action: 'delete',
            description: `Deleted Table ${table.tableNumber}`,
            userId: req.user._id,
            metadata: { tableId: table._id }
        });

        res.status(200).json({
            success: true,
            message: 'Table deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get table statistics
 * @route   GET /api/tables/stats/overview
 * @access  Private
 */
export const getTableStats = async (req, res, next) => {
    try {
        const totalTables = await Table.countDocuments({ isActive: true });
        const freeTables = await Table.countDocuments({ status: 'free', isActive: true });
        const occupiedTables = await Table.countDocuments({ status: 'occupied', isActive: true });
        const reservedTables = await Table.countDocuments({ status: 'reserved', isActive: true });
        const cleaningTables = await Table.countDocuments({ status: 'cleaning', isActive: true });

        const stats = {
            total: totalTables,
            free: freeTables,
            occupied: occupiedTables,
            reserved: reservedTables,
            cleaning: cleaningTables,
            occupancyRate: totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0,
        };

        res.status(200).json({
            success: true,
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};
