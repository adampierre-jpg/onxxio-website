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

function appendField(formData: FormData, key: string, value: unknown): void {
	if (Array.isArray(value)) {
		formData.append(key, value.join(', '));
		return;
	}

	if (typeof value === 'number') {
		formData.append(key, String(Math.round(value)));
		return;
	}

	formData.append(key, getString(value));
}

function buildMakeFormData(data: Record<string, unknown>): FormData {
	const results =
		data.results && typeof data.results === 'object' ? (data.results as Record<string, unknown>) : {};
	const breakdown =
		results.breakdown && typeof results.breakdown === 'object'
			? (results.breakdown as Record<string, unknown>)
			: {};
	const formData = new FormData();

	appendField(formData, 'name', data.name);
	appendField(formData, 'email', data.email);
	appendField(formData, 'age', data.age);
	appendField(formData, 'kids', data.kids);
	appendField(formData, 'work', data.workType);
	appendField(formData, 'workType', data.workType);
	appendField(formData, 'tensionScore', data.tension);
	appendField(formData, 'coldExtremitiesScore', data.coldExtremities);
	appendField(formData, 'yawningScore', data.yawning);
	appendField(formData, 'mouthBreathingScore', data.mouthBreathing);
	appendField(formData, 'breathCategory', data.breathingCategory);
	appendField(formData, 'breathingCategory', data.breathingCategory);
	appendField(formData, 'breathHold', data.breathHold);
	appendField(formData, 'nsScore', data.nsScore);
	formData.append('hasPain', getLegacyPainValue(data.hasPain));
	appendField(formData, 'pain', getLegacyPainValue(data.hasPain));
	appendField(formData, 'painAreas', data.painAreas);
	appendField(formData, 'worstMove', data.worstMovement);
	appendField(formData, 'worstMovement', data.worstMovement);
	appendField(formData, 'retestResult', data.retestResult);
	appendField(formData, 'finalLevel', results.level);
	appendField(formData, 'finalScore', results.score);
	appendField(formData, 'resultTitle', results.title);
	appendField(formData, 'resultDescription', results.description);
	appendField(formData, 'nsStatus', breakdown.nsStatus);
	appendField(formData, 'breathStatus', breakdown.breathStatus);
	appendField(formData, 'painStatus', breakdown.painStatus);
	appendField(formData, 'movementLabel', breakdown.movementLabel);
	appendField(formData, 'resetLabel', breakdown.resetLabel);
	appendField(formData, 'nsTone', breakdown.nsTone);
	appendField(formData, 'breathTone', breakdown.breathTone);
	appendField(formData, 'painTone', breakdown.painTone);
	appendField(formData, 'resetTone', breakdown.resetTone);
	appendField(formData, 'feedback', results.feedbackHTML);
	appendField(formData, 'status', data.status);
	appendField(formData, 'submittedAt', data.submittedAtISO);
	formData.append('source', 'onxx.io Parent Ready Assessment');

	return formData;
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
			body: buildMakeFormData(data)
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
