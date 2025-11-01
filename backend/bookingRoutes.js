import express from 'express';
import bookingController from '../../controllers/bookingController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Routes pour les utilisateurs authentifiés
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.post('/', authenticate, bookingController.create);
router.get('/:id', authenticate, bookingController.getById);
router.put('/:id/cancel', authenticate, bookingController.cancel);

// Routes pour les propriétaires/admin
router.get('/', authenticate, authorize('owner', 'admin'), bookingController.getAll);
router.put('/:id/status', authenticate, authorize('owner', 'admin'), bookingController.updateStatus);
router.delete('/:id', authenticate, authorize('admin'), bookingController.delete);

export default router;
