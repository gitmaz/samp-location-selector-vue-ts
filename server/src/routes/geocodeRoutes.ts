import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import type { ReverseGeocodeResponse } from '../../../shared/location.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { reverseGeocode } from '../services/geocodeService.js';

const router = Router();

router.get(
  '/reverse',
  [
    query('lat').isFloat({ min: -90, max: 90 }).toFloat(),
    query('lon').isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const address = await reverseGeocode(lat, lon);
    const body: ReverseGeocodeResponse = { address };
    res.json(body);
  })
);

export default router;

