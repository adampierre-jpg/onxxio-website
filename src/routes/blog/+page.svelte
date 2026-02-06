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
	<title>Blog</title>
</svelte:head>

<section class="blog-index">
	<h1>Blog</h1>

	{#if data.posts.length === 0}
		<p>No blog posts found.</p>
	{:else}
		<ul class="post-list">
			{#each data.posts as post}
				<li class="post-item">
					<h2>
						<a href={`/blog/${post.slug}`}>{post.title}</a>
					</h2>
					<p class="meta">{formatDate(post.date)}</p>
					<p>{post.excerpt}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.blog-index {
		margin: 0 auto;
		max-width: 48rem;
		padding: 2rem 1rem 4rem;
	}

	.post-list {
		display: grid;
		gap: 1.5rem;
		list-style: none;
		margin: 1.5rem 0 0;
		padding: 0;
	}

	.post-item {
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 1.5rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}

	h2 {
		font-size: 1.25rem;
		margin: 0 0 0.25rem;
	}

	h2 a {
		color: inherit;
		text-decoration: none;
	}

	h2 a:hover {
		text-decoration: underline;
	}

	.meta {
		color: #4b5563;
		font-size: 0.875rem;
		margin: 0 0 0.5rem;
	}

	p {
		margin: 0;
	}
</style>
