import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types.js';

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
	}

	if (!payload || typeof payload !== 'object') {
		return json({ ok: false, error: 'Payload must be an object.' }, { status: 400 });
	}

	const data = payload as Record<string, unknown>;
	const name = typeof data.name === 'string' ? data.name.trim() : '';
	const email = typeof data.email === 'string' ? data.email.trim() : '';

	if (!name) {
		return json({ ok: false, error: 'Name is required.' }, { status: 400 });
	}

	if (!isValidEmail(email)) {
		return json({ ok: false, error: 'Valid email is required.' }, { status: 400 });
	}

	console.log('DRA lead payload:', data);

	return json({ ok: true });
};
