/**
 * Reverse geocoding via OpenStreetMap Nominatim (usage policy: identify your app).
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? 'samp-locatiom-selector-vue-ts/1.0 (dev sample)';

interface NominatimReverseJson {
  display_name?: string;
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = (await res.json()) as NominatimReverseJson;
  const address = data.display_name;
  if (!address || typeof address !== 'string') {
    throw new Error('No address returned for coordinates');
  }

  return address.trim();
}
