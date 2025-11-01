import express from 'express';
import calendarController from '../../controllers/calendarController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Routes pour gérer les flux iCal
router.get('/feeds', authenticate, authorize('owner', 'admin'), calendarController.getAllFeeds);
router.post('/feeds', authenticate, authorize('owner', 'admin'), calendarController.createFeed);
router.get('/feeds/:id', authenticate, authorize('owner', 'admin'), calendarController.getFeedById);
router.put('/feeds/:id', authenticate, authorize('owner', 'admin'), calendarController.updateFeed);
router.delete('/feeds/:id', authenticate, authorize('owner', 'admin'), calendarController.deleteFeed);

// Synchronisation manuelle
router.post('/feeds/:id/sync', authenticate, authorize('owner', 'admin'), calendarController.syncFeed);
router.post('/sync-all', authenticate, authorize('admin'), calendarController.syncAllFeeds);

// Export iCal
router.get('/export/:unitId', calendarController.exportCalendar);

export default router;
