import { Router } from 'express';
import locationRoutes from './locationRoutes.js';
import geocodeRoutes from './geocodeRoutes.js';

const router = Router();

router.use('/locations', locationRoutes);
router.use('/geocode', geocodeRoutes);

export default router;
