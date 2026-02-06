import type { DRAResultBreakdown, DRAResults, DRAState, RetestResultValue, WorstMovementValue } from './types.js';

const MOVEMENT_NAMES: Record<WorstMovementValue, string> = {
	'toe-touch': 'Posterior Chain (Toe Touch)',
	rotation: 'Thoracic Rotation',
	squat: 'Squat Pattern',
	'forward-reach': 'Single-Leg Balance',
	'all-ok': 'No major limitations',
	'': ''
};

const RESET_NAMES: Record<RetestResultValue, string> = {
	better: 'Positive (NS responsive)',
	same: 'Neutral',
	worse: 'Needs attention',
	none: 'N/A - All OK',
	'': ''
};

function getLevelSummary(score: number, userName: string): Pick<DRAResults, 'level' | 'title' | 'description'> {
	if (score >= 80) {
		return {
			level: 3,
			title: 'Ready to Build',
			description: `Great baseline, ${userName}. Your nervous system is well-regulated, and your movement patterns are solid. You're ready for progressive strength training. A few targeted improvements will unlock even more potential.`
		};
	}

	if (score >= 55) {
		return {
			level: 2,
			title: 'Foundation First',
			description: `Good news, ${userName} - you've got a solid starting point. Your assessment shows some areas that need attention. With the right foundation work, you'll be moving better in no time.`
		};
	}

	return {
		level: 1,
		title: 'Reset & Rebuild',
		description: `Here's the truth, ${userName}: your body is asking for attention. The signs are clear. The good news? These are exactly the issues that respond best to a focused approach.`
	};
}

function buildFeedback(state: DRAState): string {
	const feedbackItems: string[] = [];

	if (state.breathHold < 15 || state.breathingCategory === 'Red') {
		feedbackItems.push(
			`<h3>Priority: Breathing</h3><p>Your breath hold was ${state.breathHold}s (target 25s+) and/or your symptom scores show high stress load. This is limiting your movement capacity. Addressing your nervous system first will unlock everything else.</p>`
		);
	} else if (state.breathHold < 25 || state.breathingCategory === 'Yellow') {
		feedbackItems.push(
			`<h3>Watch: Breathing</h3><p>Your breath hold was ${state.breathHold}s and/or you showed some stress signs. There's room for improvement here that will support your training.</p>`
		);
	} else {
		feedbackItems.push(
			`<h3>Solid: Breathing</h3><p>Your breath hold of ${state.breathHold}s and low symptom scores indicate good CO2 tolerance and nervous system regulation. Nice work.</p>`
		);
	}

	if (state.worstMovement !== 'all-ok' && state.worstMovement !== '') {
		const movementName = MOVEMENT_NAMES[state.worstMovement] || state.worstMovement;

		if (state.retestResult === 'better') {
			feedbackItems.push(
				`<h3>Quick Win: ${movementName}</h3><p>The reset improved your movement. This tells us your limitation is largely tone/nervous system-based - not a structural issue. Daily resets before training will help maintain this.</p>`
			);
		} else if (state.retestResult === 'same') {
			feedbackItems.push(
				`<h3>Work Needed: ${movementName}</h3><p>The reset didn't change much. This suggests a tissue or joint restriction that needs targeted mobility work, not just breathing resets.</p>`
			);
		} else if (state.retestResult === 'worse') {
			feedbackItems.push(
				`<h3>Investigate: ${movementName}</h3><p>The reset made things feel worse. This is useful data - it suggests guarding or a compensation pattern. Let's look closer at what's driving this.</p>`
			);
		}
	} else {
		feedbackItems.push(
			`<h3>Movement: No Major Flags</h3><p>All four movements felt okay to you. That's a good sign for general mobility. Let's focus on building strength on this foundation.</p>`
		);
	}

	if (state.hasPain === 'yes') {
		feedbackItems.push(
			`<h3>Note: Pain Present</h3><p>You indicated pain in: ${state.painAreas.join(', ')}. This doesn't stop us, but it shapes how we approach loading. We'll work around and eventually through this.</p>`
		);
	}

	return feedbackItems.join('');
}

function buildBreakdown(state: DRAState): DRAResultBreakdown {
	const nsStatus = state.nsScore <= 4 ? 'Good' : state.nsScore <= 8 ? 'Moderate' : 'High Stress';
	const nsTone: DRAResultBreakdown['nsTone'] =
		state.nsScore <= 4 ? 'good' : state.nsScore <= 8 ? 'warning' : 'poor';

	const breathStatus =
		state.breathHold >= 25
			? `${state.breathHold}s - Good`
			: state.breathHold >= 15
				? `${state.breathHold}s - Moderate`
				: `${state.breathHold}s - Low`;
	const breathTone: DRAResultBreakdown['breathTone'] =
		state.breathHold >= 25 ? 'good' : state.breathHold >= 15 ? 'warning' : 'poor';

	const painStatus =
		state.hasPain !== 'yes' ? 'No limiting pain' : `Pain: ${state.painAreas.join(', ') || 'Yes'}`;
	const painTone: DRAResultBreakdown['painTone'] = state.hasPain !== 'yes' ? 'good' : 'warning';

	const movementLabel = MOVEMENT_NAMES[state.worstMovement] || state.worstMovement;
	const resetLabel = RESET_NAMES[state.retestResult] || state.retestResult;
	const resetTone: DRAResultBreakdown['resetTone'] =
		state.retestResult === 'better'
			? 'good'
			: state.retestResult === 'same'
				? 'warning'
				: state.retestResult === 'none'
					? ''
					: 'poor';

	return {
		nsStatus,
		breathStatus,
		painStatus,
		movementLabel,
		resetLabel,
		nsTone,
		breathTone,
		painTone,
		resetTone
	};
}

// Mirrors the original assessment scoring logic.
export function calculateResults(state: DRAState): DRAResults {
	let overallScore = 0;

	if (state.breathHold >= 25) overallScore += 40;
	else if (state.breathHold >= 15) overallScore += 25;
	else overallScore += 10;

	overallScore += Math.max(0, 30 - state.nsScore * 2.5);
	overallScore += state.hasPain === 'yes' ? 5 : 15;

	if (state.retestResult === 'better') overallScore += 15;
	else if (state.retestResult === 'same') overallScore += 8;
	else if (state.retestResult === 'none') overallScore += 10;
	else overallScore += 3;

	const score = Math.round(overallScore);
	const userName = state.name || 'there';
	const summary = getLevelSummary(score, userName);

	return {
		score,
		level: summary.level,
		title: summary.title,
		description: summary.description,
		breakdown: buildBreakdown(state),
		feedbackHTML: buildFeedback(state)
	};
}
