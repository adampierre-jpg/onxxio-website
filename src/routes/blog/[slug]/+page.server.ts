import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { getBlogPost } from '$lib/content/blog.server.js';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ params }) => {
	const post = await getBlogPost(params.slug);
	if (!post) {
		throw error(404, 'Blog post not found');
	}

	const rendered = marked.parse(post.contentMarkdown);
	const contentHtml = typeof rendered === 'string' ? rendered : await rendered;

	return {
		post: {
			slug: post.slug,
			title: post.title,
			date: post.date,
			source: post.source,
			excerpt: post.excerpt,
			contentHtml
		}
	};
}) satisfies PageServerLoad;
