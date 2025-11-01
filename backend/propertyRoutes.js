import express from 'express';
import propertyController from '../../controllers/propertyController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);
router.get('/:id/availability', propertyController.getAvailability);

// Routes protégées (propriétaires/admin)
router.post('/', authenticate, authorize('owner', 'admin'), propertyController.create);
router.put('/:id', authenticate, authorize('owner', 'admin'), propertyController.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), propertyController.delete);

// Routes pour les unités (appartements/chambres)
router.get('/:propertyId/units', propertyController.getUnits);
router.post('/:propertyId/units', authenticate, authorize('owner', 'admin'), propertyController.createUnit);
router.put('/:propertyId/units/:unitId', authenticate, authorize('owner', 'admin'), propertyController.updateUnit);
router.delete('/:propertyId/units/:unitId', authenticate, authorize('owner', 'admin'), propertyController.deleteUnit);

export default router;
