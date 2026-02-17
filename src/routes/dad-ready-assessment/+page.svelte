<script lang="ts">
	import { onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';

	import { DRILL_VIDEO_ID, INTRO_VIDEO_ID, MOVEMENT_VIDEO_ID } from '$lib/assessment/dra/constants.js';
	import { calculateResults } from '$lib/assessment/dra/scoring.js';
	import { canStartAssessment, recordAttempt, resetIfNewDay } from '$lib/assessment/dra/storage.js';
	import type {
		BreathingCategory,
		DRAResults,
		DRAState,
		HasPainValue,
		RetestResultValue,
		ScaleValue,
		WorstMovementValue
	} from '$lib/assessment/dra/types.js';

	import './dra.css';

	type AssessmentStep = 1 | 2 | 3 | 4 | 5 | 6;
	type ScaleQuestion = 'tension' | 'coldExtremities' | 'yawning' | 'mouthBreathing';

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const CURRENT_YEAR = new Date().getFullYear();
	const PROGRESS_STEPS = ['Basics', 'Breathing', 'Pain', 'Movement', 'Reset', 'Results'];
	const PAIN_AREAS = [
		{ value: 'low-back', label: 'Low Back' },
		{ value: 'knees', label: 'Knees' },
		{ value: 'hips', label: 'Hips' },
		{ value: 'shoulders', label: 'Shoulders' },
		{ value: 'neck', label: 'Neck' }
	];

	const RETEST_MOVEMENT_NAMES: Record<string, string> = {
		'toe-touch': 'Toe Touch Series',
		rotation: 'Standing Rotation',
		squat: 'Squat',
		'forward-reach': 'Forward Reach'
	};

	const DEFAULT_ONXX_BOOKING_URL = 'https://essentialfitness.as.me/schedule/5f7120b5/appointment/40600203/calendar/10643060?appointmentTypeIds[]=40600203';
	const DEFAULT_ONXX_SITE_URL = 'https://essentialfitness.co';
	const ONXX_BOOKING_URL = env.PUBLIC_ONXX_BOOKING_URL || DEFAULT_ONXX_BOOKING_URL;
	const ONXX_SITE_URL = env.PUBLIC_ONXX_SITE_URL || DEFAULT_ONXX_SITE_URL;

	function createInitialState(): DRAState {
		return {
			name: '',
			email: '',
			age: '',
			kids: '',
			workType: '',
			tension: null,
			coldExtremities: null,
			yawning: null,
			mouthBreathing: null,
			breathHold: 0,
			nsScore: 0,
			breathingCategory: 'Green',
			hasPain: '',
			painAreas: [],
			worstMovement: '',
			retestResult: ''
		};
	}

	let assessment = $state<DRAState>(createInitialState());
	let hasStarted = $state(false);
	let showLimitModal = $state(false);
	let showRetestSection = $state(false);
	let currentStep = $state<AssessmentStep>(1);
	let timerSeconds = $state(0);
	let timerRunning = $state(false);
	let breathHoldInput = $state('');
	let results = $state<DRAResults | null>(null);
	let wrapperEl = $state<HTMLElement | null>(null);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	function scrollToAssessment(): void {
		wrapperEl?.scrollIntoView({ behavior: 'smooth' });
	}

	function formatTimer(totalSeconds: number): string {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	function getProgressPercent(): number {
		return ((currentStep - 1) / 5) * 100;
	}

	function getRetestMovementName(): string {
		return RETEST_MOVEMENT_NAMES[assessment.worstMovement] ?? 'worst movement';
	}

	function clearTimerInterval(): void {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function startTimer(): void {
		if (timerRunning) return;

		timerRunning = true;
		timerInterval = setInterval(() => {
			timerSeconds += 1;
		}, 1000);
	}

	function stopTimer(): void {
		if (!timerRunning) return;

		timerRunning = false;
		clearTimerInterval();
		breathHoldInput = String(timerSeconds);
		assessment.breathHold = timerSeconds;
	}

	function toggleTimer(): void {
		if (timerRunning) stopTimer();
		else startTimer();
	}

	function resetTimer(): void {
		timerRunning = false;
		clearTimerInterval();
		timerSeconds = 0;
		breathHoldInput = '';
		assessment.breathHold = 0;
	}

	function syncBreathHoldFromInput(rawValue: string): void {
		breathHoldInput = rawValue;
		const parsed = Number.parseInt(rawValue, 10);
		assessment.breathHold = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
	}

	function setScale(question: ScaleQuestion, value: ScaleValue): void {
		assessment[question] = value;
	}

	function togglePain(value: HasPainValue): void {
		assessment.hasPain = value;
		if (value !== 'yes') assessment.painAreas = [];
	}

	function togglePainArea(area: string): void {
		if (assessment.painAreas.includes(area)) {
			assessment.painAreas = assessment.painAreas.filter((entry) => entry !== area);
		} else {
			assessment.painAreas = [...assessment.painAreas, area];
		}
	}

	function updateNervousSystemSummary(): void {
		const scores = [
			assessment.tension,
			assessment.coldExtremities,
			assessment.yawning,
			assessment.mouthBreathing
		];
		const hasUnset = scores.some((score) => score === null);
		if (hasUnset) return;

		const finalScores = scores as number[];
		assessment.nsScore = finalScores.reduce((sum, score) => sum + score, 0);
		const maxSymptom = Math.max(...finalScores);
		assessment.breathingCategory =
			maxSymptom === 0 ? 'Green' : maxSymptom === 1 ? 'Yellow' : 'Red';
	}

	function validateStep(step: AssessmentStep): boolean {
		if (step === 1) {
			if (!assessment.name.trim() || !assessment.email.trim() || !assessment.age || !assessment.workType) {
				alert('Please fill in all fields');
				return false;
			}

			if (!EMAIL_REGEX.test(assessment.email.trim())) {
				alert('Please enter a valid email address');
				return false;
			}

			const age = Number(assessment.age);
			if (!Number.isFinite(age) || age < 18) {
				alert('Please enter a valid age');
				return false;
			}
		}

		if (step === 2) {
			const hasAllScales =
				assessment.tension !== null &&
				assessment.coldExtremities !== null &&
				assessment.yawning !== null &&
				assessment.mouthBreathing !== null;

			if (!hasAllScales) {
				alert('Please answer all nervous system questions');
				return false;
			}

			if (!assessment.breathHold || assessment.breathHold <= 0) {
				alert('Please complete the breath hold test');
				return false;
			}
		}

		if (step === 3 && assessment.hasPain === '') {
			alert('Please indicate if you have any pain');
			return false;
		}

		if (step === 4 && assessment.worstMovement === '') {
			alert('Please select which movement felt the worst');
			return false;
		}

		return true;
	}

	function nextStep(step: AssessmentStep): void {
		if (!validateStep(currentStep)) return;
		if (currentStep === 2) updateNervousSystemSummary();

		currentStep = step;
		scrollToAssessment();
	}

	async function submitLead(resultSummary: DRAResults): Promise<void> {
		const payload = {
			name: assessment.name,
			email: assessment.email,
			age: assessment.age,
			kids: assessment.kids,
			workType: assessment.workType,
			breathingCategory: assessment.breathingCategory as BreathingCategory,
			breathHold: assessment.breathHold,
			nsScore: assessment.nsScore,
			hasPain: assessment.hasPain,
			painAreas: assessment.painAreas,
			worstMovement: assessment.worstMovement,
			retestResult: assessment.retestResult,
			results: {
				score: resultSummary.score,
				level: resultSummary.level,
				title: resultSummary.title,
				description: resultSummary.description,
				breakdown: resultSummary.breakdown
			},
			status: 'Complete',
			submittedAtISO: new Date().toISOString()
		};

		try {
			const response = await fetch('/api/lead', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			if (!response.ok) {
				console.error('Lead API request failed', await response.text());
			}
		} catch (error) {
			console.error('Lead API request failed', error);
		}
	}

	async function calculateAndShowResults(): Promise<void> {
		updateNervousSystemSummary();
		const calculated = calculateResults(assessment);
		results = calculated;
		currentStep = 6;
		scrollToAssessment();

		await submitLead(calculated);
	}

	function goToReset(): void {
		if (!validateStep(4)) return;

		if (assessment.worstMovement === 'all-ok') {
			assessment.retestResult = 'none';
			void calculateAndShowResults();
			return;
		}

		showRetestSection = false;
		currentStep = 5;
		scrollToAssessment();
	}

	function showRetest(): void {
		showRetestSection = true;
		scrollToAssessment();
	}

	function showResults(): void {
		if (!assessment.retestResult || assessment.retestResult === 'none') {
			alert('Please select how the movement felt after the reset');
			return;
		}

		void calculateAndShowResults();
	}

	function startAssessment(): void {
		resetIfNewDay();
		const attemptStatus = canStartAssessment();
		if (!attemptStatus.ok) {
			showLimitModal = true;
			return;
		}

		recordAttempt();
		hasStarted = true;
		currentStep = 1;
		scrollToAssessment();
	}

	function closeModal(): void {
		showLimitModal = false;
	}

	function retakeAssessment(): void {
		clearTimerInterval();
		timerRunning = false;
		timerSeconds = 0;
		breathHoldInput = '';
		hasStarted = false;
		showLimitModal = false;
		showRetestSection = false;
		currentStep = 1;
		results = null;
		assessment = createInitialState();
		scrollToAssessment();
	}

	onDestroy(() => {
		clearTimerInterval();
	});
</script>

<svelte:head>
	<title>Dad Ready Assessment | ONXX</title>
</svelte:head>

<div id="dra-assessment-wrapper" bind:this={wrapperEl}>
	<div class="dra-container">
		{#if !hasStarted}
			<header class="dra-header" id="dra-intro-section">
				<div class="dra-logo">ONXX</div>
				<h1>Dad Ready Assessment</h1>
				<p class="dra-subhead">
					Most men over 35 don't have a training problem - they have an awareness problem. Find out
					exactly where you stand.
				</p>

				<div class="dra-time-badge">Takes under 10 minutes</div>

				<div class="dra-video-container">
					<iframe
						src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}?rel=0`}
						title="Intro Video"
						allowfullscreen
					></iframe>
				</div>

				<div class="dra-benefits">
					<div class="dra-benefit-item">Check your nervous system and breathing capacity</div>
					<div class="dra-benefit-item">Test 4 fundamental movement patterns</div>
					<div class="dra-benefit-item">Get a personalized reset and see immediate change</div>
				</div>

				<div class="dra-hero-cta">
					<button class="dra-btn dra-btn-primary" on:click={startAssessment}>Start Your Assessment</button>
					<p class="dra-trust-line">No equipment needed. Do it right where you are.</p>
				</div>
			</header>
		{/if}

		{#if hasStarted}
			<div id="dra-assessment-form">
				<div class="dra-progress-container">
					<div class="dra-progress-bar">
						<div class="dra-progress-fill" style={`width: ${getProgressPercent()}%;`}></div>
					</div>
					<div class="dra-progress-steps">
						{#each PROGRESS_STEPS as label, index}
							<span
								class="dra-progress-step"
								class:completed={index + 1 < currentStep}
								class:active={index + 1 === currentStep}
							>
								{label}
							</span>
						{/each}
					</div>
				</div>

				<div class="dra-step" class:active={currentStep === 1}>
					<div class="dra-card">
						<div class="dra-card-header">
							<h2>The Basics</h2>
							<p class="dra-card-subtitle">Context matters. Tell us where you're starting.</p>
						</div>

						<div class="dra-form-group">
							<label for="dra-name">Name</label>
							<input
								id="dra-name"
								type="text"
								placeholder="Your first name"
								bind:value={assessment.name}
								autocomplete="given-name"
							/>
						</div>

						<div class="dra-form-group">
							<label for="dra-email">Email</label>
							<input
								id="dra-email"
								type="email"
								placeholder="Where to send your report"
								bind:value={assessment.email}
								autocomplete="email"
							/>
						</div>

						<div class="dra-form-group">
							<label for="dra-age">Age</label>
							<input
								id="dra-age"
								type="number"
								min="18"
								max="100"
								placeholder="35"
								value={assessment.age}
								on:input={(event) => {
									const rawValue = event.currentTarget.value;
									const parsed = Number.parseInt(rawValue, 10);
									assessment.age = Number.isFinite(parsed) ? parsed : '';
								}}
							/>
						</div>

						<div class="dra-form-group">
							<label>Do you have kids under 12?</label>
							<div class="dra-option-group">
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.kids === 'yes'}
									on:click={() => {
										assessment.kids = 'yes';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>Yes - the chaotic years</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.kids === 'no'}
									on:click={() => {
										assessment.kids = 'no';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>No - older kids or none</span>
								</button>
							</div>
						</div>

						<div class="dra-form-group">
							<label for="dra-work-type"
								>Work Type <span style="color: #666666; font-weight: normal;">(impacts stiffness)</span
								></label
							>
							<select id="dra-work-type" bind:value={assessment.workType}>
								<option value="">Select one...</option>
								<option value="desk">Mostly Desk / Computer</option>
								<option value="mixed">Mix of Desk & Active</option>
								<option value="physical">Mostly Physical / Manual Work</option>
							</select>
						</div>

						<button class="dra-btn dra-btn-primary dra-btn-block" on:click={() => nextStep(2)}>
							Next Step
						</button>
					</div>
				</div>

				<div class="dra-step" class:active={currentStep === 2}>
					<div class="dra-card">
						<div class="dra-card-header">
							<h2>Nervous System Check</h2>
							<p class="dra-card-subtitle">
								Breathing dictates stability. Be honest - this isn't a test you can fail.
							</p>
						</div>

						<p style="color: #666666; font-size: 0.9rem; margin-bottom: 20px;">
							Rate each: <strong style="color: #ffffff;">0 = Never</strong> to
							<strong style="color: #ffffff;">3 = Very Often</strong>
						</p>

						<div class="dra-scale-group">
							<p class="dra-scale-question">Do you feel tense during a typical day?</p>
							<div class="dra-scale-options">
								{#each [0, 1, 2, 3] as value}
									<button
										type="button"
										class="dra-scale-btn"
										class:selected={assessment.tension === value}
										on:click={() => setScale('tension', value as ScaleValue)}
									>
										{value}
									</button>
								{/each}
							</div>
							<div class="dra-scale-labels"><span>Never</span><span>Very Often</span></div>
						</div>

						<div class="dra-scale-group">
							<p class="dra-scale-question">Cold hands or feet when others seem comfortable?</p>
							<div class="dra-scale-options">
								{#each [0, 1, 2, 3] as value}
									<button
										type="button"
										class="dra-scale-btn"
										class:selected={assessment.coldExtremities === value}
										on:click={() => setScale('coldExtremities', value as ScaleValue)}
									>
										{value}
									</button>
								{/each}
							</div>
							<div class="dra-scale-labels"><span>Never</span><span>Very Often</span></div>
						</div>

						<div class="dra-scale-group">
							<p class="dra-scale-question">Yawning often when you're not just tired or bored?</p>
							<div class="dra-scale-options">
								{#each [0, 1, 2, 3] as value}
									<button
										type="button"
										class="dra-scale-btn"
										class:selected={assessment.yawning === value}
										on:click={() => setScale('yawning', value as ScaleValue)}
									>
										{value}
									</button>
								{/each}
							</div>
							<div class="dra-scale-labels"><span>Never</span><span>Very Often</span></div>
						</div>

						<div class="dra-scale-group">
							<p class="dra-scale-question">Mouth breathing at night or waking with dry mouth?</p>
							<div class="dra-scale-options">
								{#each [0, 1, 2, 3] as value}
									<button
										type="button"
										class="dra-scale-btn"
										class:selected={assessment.mouthBreathing === value}
										on:click={() => setScale('mouthBreathing', value as ScaleValue)}
									>
										{value}
									</button>
								{/each}
							</div>
							<div class="dra-scale-labels"><span>Never</span><span>Very Often</span></div>
						</div>

						<hr class="dra-divider" />

						<div class="dra-form-group">
							<label>Breath Hold Test</label>
							<div class="dra-instructions-box">
								<h4>Instructions</h4>
								<ul>
									<li>Sit or stand tall, relaxed</li>
									<li>Take 3-5 easy breaths through your nose</li>
									<li>
										Normal inhale, then <strong style="color: #ffffff;">normal exhale</strong> through
										nose
									</li>
									<li>Pinch your nose and start the timer</li>
									<li>
										Stop at <strong style="color: #ffffff;">first urge to breathe</strong> (swallow, throat
										tightening, or mental urge)
									</li>
								</ul>
							</div>

							<div class="dra-timer-container">
								<div class="dra-timer-display">{formatTimer(timerSeconds)}</div>
								<div class="dra-timer-controls">
									<button type="button" class="dra-timer-btn" on:click={toggleTimer}
										>{timerRunning ? 'Stop' : 'Start'}</button
									>
									<button type="button" class="dra-timer-btn secondary" on:click={resetTimer}
										>Reset</button
									>
								</div>
							</div>

							<label for="dra-breath-hold">Or enter your time manually (seconds)</label>
							<input
								id="dra-breath-hold"
								type="number"
								min="0"
								max="120"
								placeholder="e.g., 22"
								value={breathHoldInput}
								on:input={(event) => syncBreathHoldFromInput(event.currentTarget.value)}
							/>
							<p class="dra-hint">This is NOT a max effort - stop at the first clear urge to breathe.</p>
						</div>

						<button class="dra-btn dra-btn-primary dra-btn-block" on:click={() => nextStep(3)}>
							Next Step
						</button>
					</div>
				</div>

				<div class="dra-step" class:active={currentStep === 3}>
					<div class="dra-card">
						<div class="dra-card-header">
							<h2>Pain & Recovery</h2>
							<p class="dra-card-subtitle">
								We build you up, not break you down. We need to know your limits.
							</p>
						</div>

						<div class="dra-form-group">
							<label
								>Right now, is there any pain that limits your movement - something that makes you
								avoid or alter how you move?</label
							>
							<div class="dra-option-group">
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.hasPain === 'no'}
									on:click={() => togglePain('no')}
								>
									<span class="dra-radio-indicator"></span>
									<span>No - I don't avoid movement because of pain</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.hasPain === 'yes'}
									on:click={() => togglePain('yes')}
								>
									<span class="dra-radio-indicator"></span>
									<span>Yes - pain limits certain movements</span>
								</button>
							</div>
						</div>

						{#if assessment.hasPain === 'yes'}
							<div class="dra-form-group">
								<label>Where? (select all that apply)</label>
								<div class="dra-option-group">
									{#each PAIN_AREAS as area}
										<button
											type="button"
											class="dra-option-btn checkbox"
											class:selected={assessment.painAreas.includes(area.value)}
											on:click={() => togglePainArea(area.value)}
										>
											<span class="dra-checkbox-indicator"></span>
											<span>{area.label}</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<button class="dra-btn dra-btn-primary dra-btn-block" on:click={() => nextStep(4)}>
							Go to Movement Screen
						</button>
					</div>
				</div>

				<div class="dra-step" class:active={currentStep === 4}>
					<div class="dra-card">
						<div class="dra-card-header">
							<h2>Movement Screen</h2>
							<p class="dra-card-subtitle">
								Watch the demo video, then test these 4 movements right now. All standing - no
								equipment needed.
							</p>
						</div>

						<div class="dra-video-container">
							<iframe
								src={`https://www.youtube.com/embed/${MOVEMENT_VIDEO_ID}?rel=0`}
								title="Movement Demo"
								allowfullscreen
							></iframe>
						</div>

						<div class="dra-movement-test">
							<h4>1. Toe Touch Series</h4>
							<p>
								Stand with feet together. Bend forward and reach for your toes. Then try split stance:
								left foot forward, reach to each toe. Switch feet and repeat.
							</p>
							<p>
								<strong style="color: #ffffff;">Notice:</strong> Where do you feel tight? Hamstrings,
								calves, low back? Any left/right difference?
							</p>
						</div>

						<div class="dra-movement-test">
							<h4>2. Standing Rotation</h4>
							<p>
								Stand tall, heels together, palms pressed with fingers pointing straight ahead at chest
								level. Rotate your upper body to the left as far as comfortable, then right. Keep hips
								facing forward.
							</p>
							<p>
								<strong style="color: #ffffff;">Notice:</strong> Which direction felt more restricted or
								blocked?
							</p>
						</div>

						<div class="dra-movement-test">
							<h4>3. Squat</h4>
							<p>
								Feet shoulder-width, toes slightly out. Squat as low as you can without heels lifting.
								Pause at bottom, then stand.
							</p>
							<p>
								<strong style="color: #ffffff;">Notice:</strong> How deep could you go? How hard was it to
								stand back up?
							</p>
						</div>

						<div class="dra-movement-test">
							<h4>4. Forward Reach (Single-Leg)</h4>
							<p>
								Stand about 2.5 foot lengths from a wall. Keep one foot planted (heel down), reach the
								other foot forward to touch the wall. Return with control. Switch sides.
							</p>
							<p>
								<strong style="color: #ffffff;">Notice:</strong> Balance stable or wobbly? Ankle
								restriction?
							</p>
						</div>

						<hr class="dra-divider" />

						<div class="dra-form-group">
							<label>Which movement felt the WORST? (Most restricted, difficult, or unstable)</label>
							<div class="dra-option-group">
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.worstMovement === 'toe-touch'}
									on:click={() => {
										assessment.worstMovement = 'toe-touch';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>Toe Touch Series (bending forward)</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.worstMovement === 'rotation'}
									on:click={() => {
										assessment.worstMovement = 'rotation';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>Standing Rotation</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.worstMovement === 'squat'}
									on:click={() => {
										assessment.worstMovement = 'squat';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>Squat</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.worstMovement === 'forward-reach'}
									on:click={() => {
										assessment.worstMovement = 'forward-reach';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>Forward Reach (balance)</span>
								</button>
								<button
									type="button"
									class="dra-option-btn"
									class:selected={assessment.worstMovement === 'all-ok'}
									on:click={() => {
										assessment.worstMovement = 'all-ok';
									}}
								>
									<span class="dra-radio-indicator"></span>
									<span>All felt okay</span>
								</button>
							</div>
						</div>

						<button class="dra-btn dra-btn-primary dra-btn-block" on:click={goToReset}>
							Get The Reset
						</button>
					</div>
				</div>

				<div class="dra-step" class:active={currentStep === 5}>
					<div class="dra-card">
						<div class="dra-card-header">
							<h2>The Reset</h2>
							<p class="dra-card-subtitle">
								Most movement restrictions start with the nervous system. Let's reset it.
							</p>
						</div>

						<div class="dra-instructions-box">
							<h4>Instructions</h4>
							<ul>
								<li>Follow the video for 2 minutes</li>
								<li>Focus purely on nasal breathing</li>
								<li>Mouth closed, tongue on the roof of your mouth behind teeth</li>
								<li>Smooth, quiet inhales and exhales</li>
							</ul>
						</div>

						<div class="dra-video-container">
							<iframe
								src={`https://www.youtube.com/embed/${DRILL_VIDEO_ID}?rel=0`}
								title="Breathing Reset"
								allowfullscreen
							></iframe>
						</div>

						<button class="dra-btn dra-btn-primary dra-btn-block" on:click={showRetest}>
							I've Done It - Retest Me
						</button>
					</div>

					{#if showRetestSection}
						<div class="dra-card">
							<div class="dra-card-header">
								<h2>The Retest</h2>
								<p class="dra-card-subtitle">
									Stand up. Retest your <strong style="color: var(--color-onxx-red);">{getRetestMovementName()}</strong>
									from before.
								</p>
							</div>

							<div class="dra-form-group">
								<label>How does it feel now?</label>
								<div class="dra-option-group">
									<button
										type="button"
										class="dra-option-btn"
										class:selected={assessment.retestResult === 'better'}
										on:click={() => {
											assessment.retestResult = 'better';
										}}
									>
										<span class="dra-radio-indicator"></span>
										<span>Better / Smoother / Easier</span>
									</button>
									<button
										type="button"
										class="dra-option-btn"
										class:selected={assessment.retestResult === 'same'}
										on:click={() => {
											assessment.retestResult = 'same';
										}}
									>
										<span class="dra-radio-indicator"></span>
										<span>About the Same</span>
									</button>
									<button
										type="button"
										class="dra-option-btn"
										class:selected={assessment.retestResult === 'worse'}
										on:click={() => {
											assessment.retestResult = 'worse';
										}}
									>
										<span class="dra-radio-indicator"></span>
										<span>Worse / Uncomfortable</span>
									</button>
								</div>
							</div>

							<button class="dra-btn dra-btn-primary dra-btn-block" on:click={showResults}>
								See My Results
							</button>
						</div>
					{/if}
				</div>

				<div class="dra-step" class:active={currentStep === 6}>
					<div class="dra-card">
						<div class="dra-results-container">
							<div class="dra-results-level">MOVEMENT READINESS LEVEL {results?.level ?? '--'}</div>
							<div class="dra-results-score">{results?.score ?? '--'}</div>
							<h2 class="dra-results-title">{results?.title ?? 'Calculating...'}</h2>
							<p class="dra-results-description">
								{results?.description ?? 'Your personalized assessment is being compiled.'}
							</p>
						</div>

						<div class="dra-results-breakdown">
							<h4>Your Breakdown</h4>
							<div class="dra-breakdown-item">
								<span class="dra-breakdown-label">Nervous System Score</span>
								<span class="dra-breakdown-value {results?.breakdown.nsTone ?? ''}">
									{results?.breakdown.nsStatus ?? '--'}
								</span>
							</div>
							<div class="dra-breakdown-item">
								<span class="dra-breakdown-label">Breath Hold Time</span>
								<span class="dra-breakdown-value {results?.breakdown.breathTone ?? ''}">
									{results?.breakdown.breathStatus ?? '--'}
								</span>
							</div>
							<div class="dra-breakdown-item">
								<span class="dra-breakdown-label">Pain Status</span>
								<span class="dra-breakdown-value {results?.breakdown.painTone ?? ''}">
									{results?.breakdown.painStatus ?? '--'}
								</span>
							</div>
							<div class="dra-breakdown-item">
								<span class="dra-breakdown-label">Primary Movement Limitation</span>
								<span class="dra-breakdown-value">{results?.breakdown.movementLabel ?? '--'}</span>
							</div>
							<div class="dra-breakdown-item">
								<span class="dra-breakdown-label">Reset Response</span>
								<span class="dra-breakdown-value {results?.breakdown.resetTone ?? ''}">
									{results?.breakdown.resetLabel ?? '--'}
								</span>
							</div>
						</div>

						<div class="dra-feedback-box">
							{@html results?.feedbackHTML ?? ''}
						</div>

						<div class="dra-cta-section">
							<h3>Turn This Into Action</h3>
							<p>You've got the data. Let's turn it into a 15-minute game plan you can actually stick to.</p>
							<a
								href={ONXX_BOOKING_URL}
								class="dra-btn dra-btn-primary"
								target="_blank"
								rel="noreferrer"
							>
								Book Your Free 15-Min Strategy Call
							</a>
							<br /><br />
							<button class="dra-btn dra-btn-secondary" on:click={retakeAssessment}>
								Retake Assessment
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<footer class="dra-footer">
			<p>
				&copy; {CURRENT_YEAR} <a href={ONXX_SITE_URL}>ONXX</a>. All rights reserved.
			</p>
			<p style="margin-top: 8px;">Dad Ready Assessment v2.0</p>
		</footer>
	</div>

	<div class="dra-modal-overlay" class:active={showLimitModal}>
		<div class="dra-modal-content">
			<h3>Daily Limit Reached</h3>
			<p>You've taken the assessment 4 times today.</p>
			<p>Instead of guessing, let's build a real plan for you.</p>
			<a
				href={ONXX_BOOKING_URL}
				class="dra-btn dra-btn-primary dra-btn-block"
			>
				Schedule Your 15-Min Call
			</a>
			<br />
			<button class="dra-btn dra-btn-secondary dra-btn-block" on:click={closeModal}>Close</button>
		</div>
	</div>
</div>

