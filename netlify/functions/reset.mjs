import { initialState, writeState, json } from './_shared.mjs';

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  await writeState(structuredClone(initialState));
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
};
