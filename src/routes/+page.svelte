<script lang="ts">
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.page.title}</title>
</svelte:head>

<main class="content-page">
	<h1>{data.page.title}</h1>

	{#if data.page.isMissing}
		<p>Home content is not available yet. Re-run the page import to generate `content/pages/home.md`.</p>
	{:else}
		{#if data.page.source}
			<p class="source"><a href={data.page.source} target="_blank" rel="noreferrer">Source</a></p>
		{/if}

		<div class="markdown">
			{@html data.page.contentHtml}
		</div>
	{/if}
</main>

<style>
	.content-page {
		margin: 0 auto;
		max-width: 52rem;
		padding: 2rem 1rem 4rem;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 1rem;
	}

	.source {
		font-size: 0.875rem;
		margin: 0 0 1.25rem;
	}

	.markdown :global(*) {
		max-width: 100%;
	}

	.markdown :global(p),
	.markdown :global(ul),
	.markdown :global(ol),
	.markdown :global(blockquote) {
		line-height: 1.7;
		margin: 0 0 1rem;
	}

	.markdown :global(h2),
	.markdown :global(h3),
	.markdown :global(h4) {
		margin: 1.5rem 0 0.75rem;
	}
</style>
