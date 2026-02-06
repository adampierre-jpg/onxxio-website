import { marked } from 'marked';

import { getPageBySlug } from '$lib/content/pages.server.js';

import type { PageServerLoad } from './$types.js';

export const load = (async () => {
	// Mapping rule: "/about" looks for imported markdown at content/pages/about.md.
	const page = await getPageBySlug('about');
	if (!page) {
		return {
			page: {
				title: 'About',
				source: '',
				contentHtml: '',
				isMissing: true
			}
		};
	}

	const rendered = marked.parse(page.contentMarkdown);
	const contentHtml = typeof rendered === 'string' ? rendered : await rendered;

	return {
		page: {
			title: page.title,
			source: page.source,
			contentHtml,
			isMissing: false
		}
	};
}) satisfies PageServerLoad;
