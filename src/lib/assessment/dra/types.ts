export type KidsValue = 'yes' | 'no' | '';
export type WorkTypeValue = 'desk' | 'mixed' | 'physical' | '';
export type ScaleValue = 0 | 1 | 2 | 3 | null;
export type BreathingCategory = 'Green' | 'Yellow' | 'Red';
export type HasPainValue = 'yes' | 'no' | '';
export type WorstMovementValue = 'toe-touch' | 'rotation' | 'squat' | 'forward-reach' | 'all-ok' | '';
export type RetestResultValue = 'better' | 'same' | 'worse' | 'none' | '';

export interface DRAState {
	name: string;
	email: string;
	age: number | '';
	kids: KidsValue;
	workType: WorkTypeValue;
	tension: ScaleValue;
	coldExtremities: ScaleValue;
	yawning: ScaleValue;
	mouthBreathing: ScaleValue;
	breathHold: number;
	nsScore: number;
	breathingCategory: BreathingCategory;
	hasPain: HasPainValue;
	painAreas: string[];
	worstMovement: WorstMovementValue;
	retestResult: RetestResultValue;
}

export interface DRAResultBreakdown {
	nsStatus: string;
	breathStatus: string;
	painStatus: string;
	movementLabel: string;
	resetLabel: string;
	nsTone: 'good' | 'warning' | 'poor';
	breathTone: 'good' | 'warning' | 'poor';
	painTone: 'good' | 'warning';
	resetTone: 'good' | 'warning' | 'poor' | '';
}

export interface DRAResults {
	score: number;
	level: 1 | 2 | 3;
	title: string;
	description: string;
	breakdown: DRAResultBreakdown;
	feedbackHTML: string;
}
