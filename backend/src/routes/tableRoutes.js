import express from 'express';
import {
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    getTableStats,
} from '../controllers/tableController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats route (all authenticated users)
router.get('/stats/overview', getTableStats);

// CRUD routes
router.route('/')
    .get(getTables)
    .post(authorize('manager', 'host', 'staff'), createTable);

router.route('/:id')
    .get(getTable)
    .put(updateTable)
    .delete(authorize('manager'), deleteTable);

export default router;
