import type { ReverseGeocodeResponse } from '@shared/location';

const base = '/api';

async function parseError(res: Response): Promise<never> {
  let message = res.statusText;
  try {
    const body = (await res.json()) as { message?: string; errors?: { msg: string }[] };
    if (body.message) message = body.message;
    else if (body.errors?.length) message = body.errors.map((e) => e.msg).join(', ');
  } catch {
    /* ignore */
  }
  throw new Error(message);
}

export async function reverseGeocode(payload: {
  latitude: number;
  longitude: number;
}): Promise<ReverseGeocodeResponse> {
  const url = new URL(`${base}/geocode/reverse`, window.location.origin);
  url.searchParams.set('lat', String(payload.latitude));
  url.searchParams.set('lon', String(payload.longitude));

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<ReverseGeocodeResponse>;
}

