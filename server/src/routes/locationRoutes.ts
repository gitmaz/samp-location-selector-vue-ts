import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', locationController.listLocations);
router.post(
  '/',
  ...locationController.validateCreateLocation,
  asyncHandler(locationController.createLocation)
);
router.delete('/:id', locationController.deleteLocation);

export default router;
