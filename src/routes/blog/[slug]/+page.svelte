<script lang="ts">
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	function formatDate(value: string): string {
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			return value;
		}
		return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>{data.post.title}</title>
</svelte:head>

<article class="blog-post">
	<p class="back-link">
		<a href="/blog">Back to blog</a>
	</p>

	<h1>{data.post.title}</h1>
	<p class="meta">{formatDate(data.post.date)}</p>

	<div class="content">
		{@html data.post.contentHtml}
	</div>
</article>

<style>
	.blog-post {
		margin: 0 auto;
		max-width: 48rem;
		padding: 2rem 1rem 4rem;
	}

	.back-link {
		margin: 0 0 1rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	.meta {
		color: #4b5563;
		font-size: 0.875rem;
		margin: 0 0 1.5rem;
	}

	.content :global(*) {
		max-width: 100%;
	}

	.content :global(h1),
	.content :global(h2),
	.content :global(h3),
	.content :global(h4) {
		margin: 1.5rem 0 0.75rem;
	}

	.content :global(p),
	.content :global(ul),
	.content :global(ol),
	.content :global(blockquote) {
		margin: 0 0 1rem;
		line-height: 1.7;
	}

	.content :global(img) {
		height: auto;
		margin: 1.25rem 0;
	}

	.content :global(a) {
		text-decoration: underline;
	}
</style>
