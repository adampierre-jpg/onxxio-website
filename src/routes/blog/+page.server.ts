import { getBlogIndex } from '$lib/content/blog.server.js';

import type { PageServerLoad } from './$types.js';

export const load = (async () => {
	const posts = await getBlogIndex();
	return { posts };
}) satisfies PageServerLoad;
