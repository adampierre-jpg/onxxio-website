import { redirect } from '@sveltejs/kit';

export function GET() {
	throw redirect(308, '/parent-ready-assessment');
}

export function HEAD() {
	throw redirect(308, '/parent-ready-assessment');
}
