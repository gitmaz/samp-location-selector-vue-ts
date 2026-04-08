import type { LocationRow } from '@shared/location';

export interface LocationsState {
  items: LocationRow[];
  loading: boolean;
  error: string | null;
  lastSaved: LocationRow | null;
}

export interface RootState {
  locations: LocationsState;
}
