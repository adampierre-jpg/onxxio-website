import { getBlogIndex } from '$lib/content/blog.server.js';

import type { PageServerLoad } from './$types.js';

export const load = (async ({ fetch }) => {
	const posts = await getBlogIndex(fetch);
	return { posts };
}) satisfies PageServerLoad;
