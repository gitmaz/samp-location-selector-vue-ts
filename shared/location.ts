/**
 * Shared contract between API and clients.
 * Keep this file free of runtime imports so both Vite and Node can consume it.
 */

/** Persisted location row returned by GET/POST /api/locations */
export interface LocationRow {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

/** JSON body for POST /api/locations */
export interface CreateLocationBody {
  latitude: number;
  longitude: number;
  /** If omitted, server reverse-geocodes via Nominatim */
  address?: string;
}

export interface HealthResponse {
  ok: true;
}

export interface ReverseGeocodeResponse {
  address: string;
}
