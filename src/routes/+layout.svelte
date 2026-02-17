<script lang="ts">
	import { page } from '$app/stores';

	type NavItem = {
		href: string;
		label: string;
	};

	const NAV_ITEMS: NavItem[] = [
		{ href: '/', label: 'Home' },
		{ href: '/coaching', label: 'Coaching' },
		{ href: '/about', label: 'About' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/contact', label: 'Contact' }
	];

	const currentYear = new Date().getFullYear();
</script>

<div class="site-shell">
	<header class="site-header">
		<div class="site-header-inner">
			<a class="site-logo" href="/" aria-label="ONXX home">ONXX</a>

			<nav class="site-nav" aria-label="Primary">
				{#each NAV_ITEMS as item}
					{@const isActive =
						item.href === '/'
							? $page.url.pathname === '/'
							: $page.url.pathname === item.href || $page.url.pathname.startsWith(`${item.href}/`)}
					<a href={item.href} class:active={isActive} aria-current={isActive ? 'page' : undefined}>
						{item.label}
					</a>
				{/each}
			</nav>

			<a class="site-cta" href="/dad-ready-assessment">Start Assessment</a>
		</div>
	</header>

	<div class="site-main">
		<slot />
	</div>

	<footer class="site-footer">
		<div class="site-footer-inner">
			<p>&copy; {currentYear} ONXX Coaching. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		background-color: var(--color-onxx-bg, #0f0f0f);
		color: var(--color-onxx-text, #ffffff);
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	.site-shell {
		min-height: 100vh;
		background-color: var(--color-onxx-bg, #0f0f0f);
		color: var(--color-onxx-text, #ffffff);
		display: flex;
		flex-direction: column;
	}

	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background-color: var(--color-onxx-alt, #111111);
	}

	.site-header-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem 1.2rem;
		flex-wrap: wrap;
	}

	.site-logo {
		display: inline-flex;
		align-items: center;
		max-height: 80px;
		font-size: clamp(2.1rem, 4vw, 3.3rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--color-onxx-text, #ffffff);
	}

	.site-logo:hover {
		color: var(--color-onxx-text, #ffffff);
	}

	.site-nav {
		flex: 1 1 18rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem 0.75rem;
		flex-wrap: wrap;
	}

	.site-nav a {
		font-size: 0.82rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-decoration: none;
		color: var(--color-onxx-muted, #a1a1a1);
		padding: 0.45rem 0.55rem;
		border-radius: 9999px;
		transition:
			color 0.2s ease,
			background-color 0.2s ease;
	}

	.site-nav a:hover,
	.site-nav a:focus-visible,
	.site-nav a.active {
		color: var(--color-onxx-text, #ffffff);
		background-color: rgba(255, 255, 255, 0.08);
	}

	.site-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1rem;
		border-radius: 0.6rem;
		white-space: nowrap;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.82rem;
		font-weight: 800;
		color: var(--color-onxx-text, #ffffff);
		background-color: var(--color-onxx-red, #e63946);
		transition:
			transform 0.2s ease,
			filter 0.2s ease;
	}

	.site-cta:hover,
	.site-cta:focus-visible {
		filter: brightness(1.08);
		transform: translateY(-1px);
	}

	.site-logo:focus-visible,
	.site-nav a:focus-visible,
	.site-cta:focus-visible {
		outline: 2px solid var(--color-onxx-velocity, #ff9500);
		outline-offset: 2px;
	}

	.site-main {
		flex: 1 1 auto;
	}

	.site-footer {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background-color: var(--color-onxx-bg, #0f0f0f);
	}

	.site-footer-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 1.4rem 1rem 1.6rem;
	}

	.site-footer p {
		margin: 0;
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-onxx-muted, #a1a1a1);
	}

	@media (max-width: 760px) {
		.site-header-inner {
			align-items: flex-start;
		}

		.site-nav {
			order: 3;
			width: 100%;
			justify-content: flex-start;
		}

		.site-cta {
			order: 2;
			margin-left: auto;
		}
	}
</style>
