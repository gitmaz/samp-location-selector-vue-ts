import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import type { CreateLocationBody, LocationRow } from '../../../shared/location.js';
import * as LocationModel from '../models/LocationModel.js';
import { reverseGeocode } from '../services/geocodeService.js';

export const validateCreateLocation = [
  body('latitude').isFloat({ min: -90, max: 90 }).toFloat(),
  body('longitude').isFloat({ min: -180, max: 180 }).toFloat(),
  body('address').optional().isString().trim().notEmpty(),
];

export async function createLocation(
  req: Request<unknown, unknown, CreateLocationBody>,
  res: Response
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { latitude, longitude, address: bodyAddress } = req.body;
  let address: string | undefined = bodyAddress;

  if (!address) {
    try {
      address = await reverseGeocode(latitude, longitude);
    } catch {
      // If geocoding fails (network, rate-limit, policy), still store coordinates.
      address = `${latitude}, ${longitude}`;
    }
  }

  const row = LocationModel.createLocation({
    address,
    latitude,
    longitude,
  });

  res.status(201).json(row);
}

export function listLocations(
  _req: Request,
  res: Response<LocationRow[]>
): void {
  const rows = LocationModel.findAllOrderedByNewest();
  res.json(rows);
}

export function deleteLocation(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const ok = LocationModel.deleteById(id);
  if (!ok) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  res.status(204).send();
}
