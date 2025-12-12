import express from 'express';
import {
    getWaitlist,
    getWaitlistEntry,
    addToWaitlist,
    updateWaitlistEntry,
    notifyGuest,
    seatGuest,
    removeFromWaitlist,
    getWaitlistStats,
} from '../controllers/waitlistController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication (host or manager)
router.use(protect);

// Stats route
router.get('/stats/overview', getWaitlistStats);

// Waitlist CRUD
router.route('/')
    .get(getWaitlist)
    .post(authorize('host', 'manager'), addToWaitlist);

router.route('/:id')
    .get(getWaitlistEntry)
    .put(authorize('host', 'manager'), updateWaitlistEntry)
    .delete(authorize('host', 'manager'), removeFromWaitlist);

// Special actions
router.post('/:id/notify', authorize('host', 'manager'), notifyGuest);
router.post('/:id/seat', authorize('host', 'manager'), seatGuest);

export default router;
