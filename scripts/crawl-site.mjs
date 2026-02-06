import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://www.essentialfitness.co';
const SEEDS = [
	'https://www.essentialfitness.co/',
	'https://www.essentialfitness.co/blog',
	'https://www.essentialfitness.co/dad-ready-assessment'
];
const OUTPUT_FILE = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
	'content',
	'routes.json'
);
const ASSET_EXTENSIONS = /\.(png|jpe?g|webp|svg|gif|css|js|woff2?|pdf)$/i;

function normalizePathname(pathname) {
	let normalized = pathname || '/';
	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}
	normalized = normalized.replace(/\/{2,}/g, '/');
	if (normalized.length > 1 && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}
	return normalized || '/';
}

function normalizeUrl(input, base = ORIGIN) {
	let resolved;
	try {
		resolved = new URL(input, base);
	} catch {
		return null;
	}

	if (!['http:', 'https:'].includes(resolved.protocol)) {
		return null;
	}
	if (resolved.origin !== ORIGIN) {
		return null;
	}

	resolved.hash = '';
	resolved.search = '';
	resolved.pathname = normalizePathname(resolved.pathname);

	if (ASSET_EXTENSIONS.test(resolved.pathname)) {
		return null;
	}

	return `${ORIGIN}${resolved.pathname}`;
}

function extractInternalLinks(html, pageUrl) {
	const links = [];
	const hrefRegex = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

	for (const match of html.matchAll(hrefRegex)) {
		const href = match[1] ?? match[2] ?? match[3] ?? '';
		if (!href || href.startsWith('#')) {
			continue;
		}
		if (
			href.startsWith('mailto:') ||
			href.startsWith('tel:') ||
			href.startsWith('javascript:')
		) {
			continue;
		}

		const normalized = normalizeUrl(href, pageUrl);
		if (normalized) {
			links.push(normalized);
		}
	}

	return links;
}

function routeType(pathname) {
	if (pathname === '/') {
		return 'home';
	}
	if (pathname === '/blog') {
		return 'blogIndex';
	}
	if (/^\/blog\/[^/]+$/.test(pathname)) {
		return 'blogPost';
	}
	if (pathname === '/dad-ready-assessment') {
		return 'assessment';
	}
	return 'page';
}

async function crawlSite() {
	const queue = [];
	const discovered = new Set();
	const htmlRoutes = new Set();
	const visited = new Set();

	for (const seed of SEEDS) {
		const normalized = normalizeUrl(seed);
		if (!normalized || discovered.has(normalized)) {
			continue;
		}
		discovered.add(normalized);
		queue.push(normalized);
	}

	while (queue.length > 0) {
		const currentUrl = queue.shift();
		if (!currentUrl || visited.has(currentUrl)) {
			continue;
		}
		visited.add(currentUrl);

		let response;
		try {
			response = await fetch(currentUrl, {
				redirect: 'follow',
				headers: {
					'user-agent': 'onxx-site-crawler/1.0 (+https://www.essentialfitness.co)'
				}
			});
		} catch (error) {
			console.warn(`Skipping ${currentUrl} (network error: ${error.message})`);
			continue;
		}

		if (!response.ok) {
			console.warn(`Skipping ${currentUrl} (HTTP ${response.status})`);
			continue;
		}

		const finalUrl = normalizeUrl(response.url, ORIGIN) ?? currentUrl;
		const contentType = response.headers.get('content-type') ?? '';
		if (!contentType.toLowerCase().includes('text/html')) {
			continue;
		}

		htmlRoutes.add(finalUrl);
		const html = await response.text();
		const links = extractInternalLinks(html, finalUrl);
		for (const link of links) {
			if (discovered.has(link)) {
				continue;
			}
			discovered.add(link);
			queue.push(link);
		}
	}

	const routes = Array.from(htmlRoutes)
		.map((url) => {
			const pathname = new URL(url).pathname;
			return { url, pathname, type: routeType(pathname) };
		})
		.sort((a, b) => a.pathname.localeCompare(b.pathname));

	const payload = {
		origin: ORIGIN,
		discoveredAtISO: new Date().toISOString(),
		routes
	};

	await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
	await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

	console.log(`Discovered ${routes.length} HTML routes from ${ORIGIN}`);
	console.log(`Wrote ${OUTPUT_FILE}`);
}

crawlSite().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
