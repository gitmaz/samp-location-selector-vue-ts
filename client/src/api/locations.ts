import type { CreateLocationBody, LocationRow } from '@shared/location';

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

export async function listLocations(): Promise<LocationRow[]> {
  const res = await fetch(`${base}/locations`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<LocationRow[]>;
}

export async function createLocation(payload: CreateLocationBody): Promise<LocationRow> {
  const res = await fetch(`${base}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: payload.latitude,
      longitude: payload.longitude,
      ...(payload.address ? { address: payload.address } : {}),
    }),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<LocationRow>;
}

export async function deleteLocation(id: number): Promise<void> {
  const res = await fetch(`${base}/locations/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}
