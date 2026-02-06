import { getBlogIndex } from '$lib/content/blog.server.js';

import type { PageLoad } from './$types.js';

export const csr = false;

export const load = (async () => {
	const posts = await getBlogIndex();
	return { posts };
}) satisfies PageLoad;
