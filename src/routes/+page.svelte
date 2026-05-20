<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>ONXX | Strength Coaching for Moms & Dads 35+</title>
	<meta
		name="description"
		content="Strength That Serves You. Strength coaching for moms & dads 35+ who want to stay strong, mobile, and capable for the long haul."
	/>
	<script
		src="https://widget.senja.io/widget/3ba2bdae-4634-4fb6-89bf-c31c297183e1/platform.js"
		type="text/javascript"
		async
	></script>
</svelte:head>


<main class="landing-page">
	<section class="hero-section">
		<div class="page-wrap hero-wrap">
			<p class="section-kicker">ONXX Coaching</p>
			<h1>Strength That <span>Serves You</span></h1>
			<p class="hero-subhead">Strength Coaching for Moms & Dads 35+</p>
			<div class="hero-copy">
				<figure class="hero-art" aria-label="Motivational graphic">
					<img
						class="hero-art-img hero-art-img--a"
						src="/get-up.png"
						alt="Minimalist high-contrast illustration of a person with a kettlebell locked out overhead on a black background."
						width="288"
						height="512"
					/>
					<img
						class="hero-art-img hero-art-img--b"
						src="/she-get-up.png"
						alt=""
						aria-hidden="true"
						width="288"
						height="512"
					/>
				</figure>
				<p>
					Strong parents raise strong families—and that starts with training that fits your real
					life, not some idealized version of it.
				</p>
				<p>Whether you're flying solo or a duo, this is for parents 35+ who need to stay strong.</p>
				<p>
					You're 35+ and want to stay strong, mobile, and capable for the long haul. You're a parent
					who wants to keep up with your kids—not just now, but for the next 20 years. You're tired
					of nagging aches, stiff joints, and feeling like your body is turning against you.
				</p>
			</div>
			<div class="cta-row">
				<a class="button-primary" href={resolve('/parent-ready-assessment')}>Start Your Assessment</a>
				<a class="button-secondary" href={resolve('/coaching')}>View Programs</a>
			</div>
			<ul class="proof-strip" aria-label="Training details">
				<li>Train from home</li>
				<li>No gym required</li>
				<li>DC/MD/VA + online</li>
			</ul>
		</div>
	</section>

	<section class="section-block">
		<div class="page-wrap">
			<div class="section-heading">
				<p class="section-kicker">Reviews</p>
				<h2>What Do Parents Say About ONXX Coaching</h2>
			</div>
			<div
				class="senja-embed"
				data-id="3ba2bdae-4634-4fb6-89bf-c31c297183e1"
				data-mode="shadow"
				data-lazyload="false"
				style="display: block; width: 100%;"
			></div>
		</div>
	</section>

	<section class="section-block section-problem">
		<div class="page-wrap split-layout">
			<div>
				<p class="section-kicker">The Problem</p>
				<h2>You Know Something Has To Change.</h2>
			</div>
			<div class="copy-stack">
				<p>It's not that you don't care.</p>
				<p>
					It's that you're still training—or not training—like nothing has changed. You're either
					doing nothing and feeling like crap, or grinding yourself into the ground with workouts
					built for people half your age. Or for the version of you from 15 years ago.
				</p>
				<p>
					You need something different. Something that builds you up instead of breaking you down.
					Something that makes you stronger for the life you're actually living.
				</p>
				<p>
					Strength training isn't about chasing Instagram PRs or trying to look like a fitness
					model.
				</p>
				<p>
					It's about building practical, durable strength that makes everything in your life easier.
					Carrying your kid for the last 8 blocks. Loading up the car without tweaking your back.
					Helping a friend move and staying off the injury list. Feeling confident in your own skin
					again.
				</p>
				<p>
					This is training that respects your time, your responsibilities, and your body. Short,
					focused sessions. A coach who understands you're not trying to be a pro athlete—you're
					trying to be a capable, reliable parent for the people who count on you.
				</p>
			</div>
		</div>
	</section>

	<section class="assessment-band">
		<div class="page-wrap assessment-grid">
			<div>
				<p class="section-kicker">Start Here</p>
				<h2>Find Out Where You Stand</h2>
			</div>
			<div class="assessment-copy">
				<p>
					Start with a movement screen to see how you move, where you're strong, and what needs
					work. No guessing.
				</p>
				<a class="button-primary" href={resolve('/parent-ready-assessment')}>Start Your Assessment</a>
			</div>
		</div>
	</section>

	<section class="section-block">
		<div class="page-wrap">
			<div class="section-heading">
				<p class="section-kicker">The Process</p>
				<h2>Build Strength That Lasts—Without Sacrificing Your Life.</h2>
			</div>
			<div class="step-grid">
				<article class="step-panel">
					<span>01</span>
					<h3>Step 1. Assess.</h3>
					<p>
						Start with a movement screen to see how you move, where you're strong, and what needs
						work. No guessing.
					</p>
				</article>
				<article class="step-panel">
					<span>02</span>
					<h3>Step 2. Build.</h3>
					<p>
						Get a kettlebell-focused plan designed around your schedule, your equipment, and your
						goals. Not someone else's. Delivered and tracked right in the ONXX app.
					</p>
				</article>
				<article class="step-panel">
					<span>03</span>
					<h3>Step 3. Coach.</h3>
					<p>
						Weekly Coaching sessions, video feedback, and smart adjustments so you keep making
						progress even when life gets busy.
					</p>
				</article>
			</div>
		</div>
	</section>

	<section class="section-block section-fit">
		<div class="page-wrap split-layout">
			<div>
				<p class="section-kicker">This Is For You If</p>
				<h2>You want useful strength without handing your life over to the gym.</h2>
			</div>
			<ul class="fit-list">
				<li>You're 35+ and want to stay strong, mobile, and capable for the long haul.</li>
				<li>You want to keep up with your kids—not just now, but for the next 20 years.</li>
				<li>
					You're tired of nagging aches, stiff joints, and feeling like your body is turning against
					you.
				</li>
				<li>
					You want training that respects your intelligence, your schedule, and your
					responsibilities.
				</li>
				<li>You want a plan that fits real life, not fantasy life.</li>
			</ul>
		</div>
	</section>

	<section class="final-cta">
		<div class="page-wrap final-cta-inner">
			<p class="section-kicker">Ready To Build?</p>
			<h2>Build Strength That Actually Serves Your Life.</h2>
			<div class="cta-row">
				<a class="button-primary" href={resolve('/parent-ready-assessment')}>Start Your Assessment</a>
				<a class="button-secondary" href="https://onxx.as.me/consultcall">Schedule A Call</a>
			</div>
		</div>
	</section>
</main>

<style>
	.landing-page {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background:
			radial-gradient(circle at 18% 0%, rgba(230, 57, 70, 0.16), transparent 30rem),
			radial-gradient(circle at 88% 24%, rgba(255, 149, 0, 0.1), transparent 24rem),
			var(--color-onxx-bg);
	}

	.landing-page::before {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		content: '';
		opacity: 0.16;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
		background-size: 5rem 5rem;
		mask-image: linear-gradient(to bottom, black, transparent 72%);
	}

	.page-wrap {
		width: min(100% - 2rem, 72rem);
		margin-inline: auto;
	}

	.hero-section {
		padding: clamp(5rem, 10vw, 8rem) 0 clamp(4rem, 8vw, 6rem);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hero-art {
		position: relative;
		float: right;
		width: clamp(10rem, 26vw, 17rem);
		aspect-ratio: 288 / 512;
		margin: 0.25rem 0 1rem 1.75rem;
		shape-outside: margin-box;
	}

	.hero-art-img {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		animation: hero-art-fade 8s ease-in-out infinite;
	}

	.hero-art-img--b {
		animation-delay: -4s;
	}

	@keyframes hero-art-fade {
		0%, 40% { opacity: 1; }
		50%, 90% { opacity: 0; }
		100% { opacity: 1; }
	}

	.hero-wrap {
		max-width: 76rem;
	}

	.section-kicker {
		margin: 0 0 1rem;
		color: var(--color-onxx-red);
		font-family: var(--font-heading, 'Allerta Stencil', system-ui, sans-serif);
		font-size: 0.78rem;
		font-weight: 400;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.hero-section h1 {
		max-width: 11ch;
		margin: 0;
		font-family: var(--font-h1-h2, 'Saira Stencil', system-ui, sans-serif);
		font-size: clamp(4.25rem, 12vw, 9rem);
		font-weight: 400;
		letter-spacing: -0.08em;
		line-height: 0.82;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.hero-section h1 span {
		color: var(--color-onxx-red);
	}

	.hero-subhead {
		margin: 1.35rem 0 0;
		color: var(--color-onxx-text);
		font-family: var(--font-heading, 'Allerta Stencil', system-ui, sans-serif);
		font-size: clamp(1.3rem, 3vw, 2rem);
		font-weight: 400;
		letter-spacing: 0.04em;
	}

	.copy-stack,
	.assessment-copy {
		max-width: 45rem;
		color: var(--color-onxx-text);
		font-size: 1.075rem;
		line-height: 1.75;
	}

	.hero-copy {
		max-width: 50rem;
		margin-top: 2rem;
		display: flow-root;
		color: var(--color-onxx-text);
		font-size: 1.075rem;
		line-height: 1.75;
	}

	.hero-copy p {
		margin: 0 0 1rem;
	}

	.hero-copy p:last-child {
		margin-bottom: 0;
	}

	.copy-stack p,
	.assessment-copy p {
		margin: 0;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem;
		margin-top: 2.5rem;
	}

	.button-primary,
	.button-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.25rem;
		padding: 0.95rem 1.35rem;
		border-radius: 0.35rem;
		font-size: 0.95rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.button-primary {
		border: 1px solid #b91c1c;
		background: #b91c1c;
		color: #ffffff;
	}

	.button-secondary {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.035);
		color: var(--color-onxx-text);
	}

	.button-primary:hover,
	.button-primary:focus-visible,
	.button-secondary:hover,
	.button-secondary:focus-visible {
		transform: translateY(-2px);
	}

	.button-primary:focus-visible,
	.button-secondary:focus-visible {
		outline: 2px solid var(--color-onxx-velocity);
		outline-offset: 3px;
	}

	.button-secondary:hover,
	.button-secondary:focus-visible {
		border-color: rgba(230, 57, 70, 0.72);
		background: rgba(230, 57, 70, 0.12);
	}

	.proof-strip {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		max-width: 52rem;
		padding: 1px;
		margin: 3rem 0 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.08);
		list-style: none;
	}

	.proof-strip li {
		padding: 1rem;
		color: var(--color-onxx-text);
		background: rgba(15, 15, 15, 0.92);
		font-size: 0.85rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
	}

	.section-block {
		padding: clamp(4.5rem, 9vw, 7rem) 0;
	}

	.section-block + .section-block,
	.section-fit {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.section-problem,
	.section-fit,
	.assessment-band {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
	}

	.split-layout,
	.assessment-grid {
		display: grid;
		gap: clamp(2rem, 6vw, 5rem);
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		align-items: start;
	}

	h2 {
		max-width: 13ch;
		margin: 0;
		font-family: var(--font-h1-h2, 'Saira Stencil', system-ui, sans-serif);
		font-size: clamp(2.4rem, 6vw, 5rem);
		font-weight: 400;
		letter-spacing: -0.06em;
		line-height: 0.9;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.copy-stack {
		display: grid;
		gap: 1.1rem;
	}

	.assessment-band {
		padding: clamp(3rem, 7vw, 5rem) 0;
		border-block: 1px solid rgba(230, 57, 70, 0.28);
	}

	.assessment-grid {
		align-items: center;
	}

	.assessment-copy .button-primary {
		margin-top: 1.5rem;
	}

	.section-heading {
		max-width: 54rem;
		margin-bottom: clamp(2rem, 5vw, 3.5rem);
	}

	.section-heading h2 {
		max-width: 15ch;
	}

	.step-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.step-panel {
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(17, 17, 17, 0.82);
	}

	.step-panel {
		padding: 1.5rem;
	}

	.step-panel span {
		display: block;
		margin-bottom: 2rem;
		color: rgba(230, 57, 70, 0.8);
		font-family: var(--font-sans, 'Montserrat', system-ui, sans-serif);
		font-size: 3rem;
		font-weight: 900;
		line-height: 1;
	}

	.step-panel h3 {
		margin: 0 0 0.85rem;
		color: var(--color-onxx-text);
		font-size: 1.3rem;
		line-height: 1.15;
	}

	.step-panel p,
	.fit-list {
		line-height: 1.65;
	}

	.step-panel p {
		color: var(--color-onxx-text);
		margin: 0;
	}

	.fit-list {
		color: var(--color-onxx-muted);
	}

	.fit-list {
		display: grid;
		gap: 0.8rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.fit-list li {
		padding: 1rem 0 1rem 1.25rem;
		border-left: 3px solid rgba(230, 57, 70, 0.72);
		background: linear-gradient(90deg, rgba(230, 57, 70, 0.1), transparent);
	}

	.final-cta {
		padding: clamp(4.5rem, 9vw, 7rem) 0;
		border-top: 1px solid rgba(230, 57, 70, 0.28);
		background:
			radial-gradient(circle at 20% 0%, rgba(230, 57, 70, 0.16), transparent 28rem),
			rgba(255, 255, 255, 0.025);
	}

	.final-cta-inner h2 {
		max-width: 14ch;
	}

	@media (max-width: 900px) {
		.split-layout,
		.assessment-grid,
		.step-grid {
			grid-template-columns: 1fr;
		}

		.hero-section h1 {
			font-size: clamp(3.6rem, 18vw, 6rem);
		}

		.proof-strip {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.hero-art {
			float: none;
			width: 100%;
			max-width: 16rem;
			margin: 0 auto 1.5rem;
		}
	}

	@media (max-width: 540px) {
		.button-primary,
		.button-secondary {
			width: 100%;
		}

		.hero-section h1,
		h2 {
			letter-spacing: -0.055em;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-art-img {
			animation: none;
		}

		.hero-art-img--b {
			opacity: 0;
		}

		.button-primary,
		.button-secondary {
			transition: none;
		}

		.button-primary:hover,
		.button-primary:focus-visible,
		.button-secondary:hover,
		.button-secondary:focus-visible {
			transform: none;
		}
	}
</style>
