import { marked } from 'marked';

import { getHomePage } from '$lib/content/pages.server.js';

import type { PageServerLoad } from './$types.js';

export const load = (async () => {
	// Mapping rule for "/" is handled in getHomePage():
	// home -> index -> first "home" type -> first page.
	const page = await getHomePage();
	if (!page) {
		return {
			page: {
				title: 'Home',
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
