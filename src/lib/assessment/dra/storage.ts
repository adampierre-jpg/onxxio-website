const STORAGE_KEY = 'dadReady_attempts';
const MAX_ATTEMPTS = 4;

interface AttemptData {
	date: string;
	count: number;
}

function getTodayISO(): string {
	return new Date().toISOString().split('T')[0] ?? '';
}

function getDefaultData(): AttemptData {
	return {
		date: getTodayISO(),
		count: 0
	};
}

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

function readAttempts(): AttemptData {
	if (!canUseStorage()) return getDefaultData();

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return getDefaultData();

		const parsed = JSON.parse(raw) as Partial<AttemptData>;
		if (typeof parsed.date !== 'string' || typeof parsed.count !== 'number') {
			return getDefaultData();
		}

		return {
			date: parsed.date,
			count: Number.isFinite(parsed.count) ? parsed.count : 0
		};
	} catch {
		return getDefaultData();
	}
}

function writeAttempts(data: AttemptData): void {
	if (!canUseStorage()) return;

	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({
			date: data.date,
			count: data.count
		})
	);
}

export function resetIfNewDay(): void {
	const data = readAttempts();
	const today = getTodayISO();
	if (data.date !== today) {
		writeAttempts({
			date: today,
			count: 0
		});
	}
}

export function canStartAssessment(): { ok: boolean; remaining: number } {
	resetIfNewDay();

	const data = readAttempts();
	const remaining = Math.max(0, MAX_ATTEMPTS - data.count);

	return {
		ok: remaining > 0,
		remaining
	};
}

export function recordAttempt(): void {
	resetIfNewDay();

	const data = readAttempts();
	const count = Math.min(MAX_ATTEMPTS, data.count + 1);
	writeAttempts({
		date: getTodayISO(),
		count
	});
}
