import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types.js';

function getString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function getLegacyPainValue(value: unknown): string {
	if (value === 'yes') return 'Yes';
	if (value === 'no') return 'No';
	return '';
}

function getNumber(value: unknown): number | '' {
	return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : '';
}

function getStringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function getPainAreas(value: unknown): string[] {
	const labels: Record<string, string> = {
		back: 'Low Back',
		'low-back': 'Low Back',
		knees: 'Knees',
		hips: 'Hips',
		shoulders: 'Shoulders',
		neck: 'Neck'
	};

	return getStringArray(value).map((entry) => labels[entry] ?? entry);
}

function buildMakePayload(data: Record<string, unknown>): Record<string, unknown> {
	const results =
		data.results && typeof data.results === 'object' ? (data.results as Record<string, unknown>) : {};
	const breakdown =
		results.breakdown && typeof results.breakdown === 'object'
			? (results.breakdown as Record<string, unknown>)
			: {};
	const pain = getLegacyPainValue(data.hasPain);

	return {
		name: getString(data.name),
		email: getString(data.email),
		age: getNumber(data.age),
		kids: getString(data.kids),
		work: getString(data.workType),
		workType: getString(data.workType),
		tensionScore: getNumber(data.tension),
		coldExtremitiesScore: getNumber(data.coldExtremities),
		yawningScore: getNumber(data.yawning),
		mouthBreathingScore: getNumber(data.mouthBreathing),
		breathCategory: getString(data.breathingCategory),
		breathingCategory: getString(data.breathingCategory),
		breathHold: getNumber(data.breathHold),
		nsScore: getNumber(data.nsScore),
		hasPain: pain,
		pain,
		painAreas: getPainAreas(data.painAreas),
		worstMove: getString(data.worstMovement),
		worstMovement: getString(data.worstMovement),
		retestResult: getString(data.retestResult),
		finalLevel: getNumber(results.level),
		finalScore: getNumber(results.score),
		resultTitle: getString(results.title),
		resultDescription: getString(results.description),
		nsStatus: getString(breakdown.nsStatus),
		breathStatus: getString(breakdown.breathStatus),
		painStatus: getString(breakdown.painStatus),
		movementLabel: getString(breakdown.movementLabel),
		resetLabel: getString(breakdown.resetLabel),
		nsTone: getString(breakdown.nsTone),
		breathTone: getString(breakdown.breathTone),
		painTone: getString(breakdown.painTone),
		resetTone: getString(breakdown.resetTone),
		feedback: getString(results.feedbackHTML),
		status: getString(data.status),
		submittedAt: getString(data.submittedAtISO),
		source: 'onxx.io Parent Ready Assessment'
	};
}

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

	const webhookUrl = env.DRA_MAKE_WEBHOOK_URL;

	if (!webhookUrl) {
		console.error('DRA_MAKE_WEBHOOK_URL is not configured.');
		return json({ ok: false, error: 'Lead sync is not configured.' }, { status: 500 });
	}

	try {
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(buildMakePayload(data))
		});

		if (!response.ok) {
			console.error('Make.com lead sync failed', response.status, await response.text());
			return json({ ok: false, error: 'Lead sync failed.' }, { status: 502 });
		}
	} catch (error) {
		console.error('Make.com lead sync failed', error);
		return json({ ok: false, error: 'Lead sync failed.' }, { status: 502 });
	}

	return json({ ok: true });
};
