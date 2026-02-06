import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { load } from 'cheerio';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(scriptDir, '..', 'content');
const routesFile = path.join(contentDir, 'routes.json');
const pagesDir = path.join(contentDir, 'pages');
const pagesIndexFile = path.join(contentDir, 'pages-index.json');
const ALLOWED_TYPES = new Set(['home', 'page', 'assessment']);

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced'
});

function collapseWhitespace(input) {
	return (input || '').replace(/\s+/g, ' ').trim();
}

function yamlQuote(input) {
	return `"${String(input ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\r?\n/g, ' ')
		.trim()}"`;
}

function slugFromPathname(pathname) {
	const normalized = pathname === '/' ? '/home' : pathname;
	const raw = decodeURIComponent(normalized)
		.replace(/^\//, '')
		.replace(/\//g, '-')
		.replace(/\+/g, '-');
	const slug = raw
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'page';
}

function uniqueSlug(base, usedSlugs) {
	let slug = base;
	let n = 2;
	while (usedSlugs.has(slug)) {
		slug = `${base}-${n}`;
		n += 1;
	}
	usedSlugs.add(slug);
	return slug;
}

async function fetchHtml(url) {
	const response = await fetch(url, {
		redirect: 'follow',
		headers: {
			'user-agent': 'onxx-pages-importer/1.0 (+https://www.essentialfitness.co)'
		}
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.toLowerCase().includes('text/html')) {
		throw new Error(`Not HTML (${contentType || 'unknown content-type'})`);
	}
	return response.text();
}

function pickContentRoot($) {
	const selectors = [
		'main article',
		'main .sqs-layout',
		'main',
		'#page',
		'article',
		'.main-content',
		'body'
	];

	for (const selector of selectors) {
		const candidate = $(selector).first();
		if (!candidate.length) continue;
		const clone = candidate.clone();
		clone.find('script,style,noscript,iframe,header,footer,nav,aside,form').remove();
		const text = collapseWhitespace(clone.text());
		if (text.length >= 100 || selector === 'body') {
			return clone;
		}
	}

	return $('body').first().clone();
}

function extractTitle($) {
	const titleText = collapseWhitespace($('title').first().text());
	if (titleText) return titleText;
	return (
		collapseWhitespace($('main h1').first().text()) ||
		collapseWhitespace($('h1').first().text()) ||
		'Untitled'
	);
}

async function loadRoutes() {
	const raw = await readFile(routesFile, 'utf8');
	const parsed = JSON.parse(raw);
	const routes = Array.isArray(parsed?.routes) ? parsed.routes : [];
	return routes
		.filter((route) => ALLOWED_TYPES.has(route?.type))
		.map((route) => ({
			url: route.url,
			pathname: route.pathname,
			type: route.type
		}))
		.filter((route) => route.url && route.pathname && route.type);
}

async function importRoute(route, usedSlugs) {
	const html = await fetchHtml(route.url);
	const $ = load(html);
	const title = extractTitle($);

	const contentRoot = pickContentRoot($);
	const contentHtml = contentRoot.html() || '';
	const plainText = collapseWhitespace(contentRoot.text());
	let markdown = turndown.turndown(contentHtml).trim();
	if (!markdown) {
		markdown = plainText;
	}

	const slug = uniqueSlug(slugFromPathname(route.pathname), usedSlugs);
	const frontmatter = [
		'---',
		`title: ${yamlQuote(title)}`,
		`slug: ${yamlQuote(slug)}`,
		`source: ${yamlQuote(route.url)}`,
		`type: ${yamlQuote(route.type)}`,
		'---',
		''
	].join('\n');

	await writeFile(path.join(pagesDir, `${slug}.md`), `${frontmatter}\n${markdown}\n`, 'utf8');

	return {
		slug,
		title,
		type: route.type,
		source: route.url
	};
}

async function main() {
	await mkdir(pagesDir, { recursive: true });
	const routes = await loadRoutes();
	const usedSlugs = new Set();
	const imported = [];
	let failed = 0;

	for (const route of routes) {
		try {
			const entry = await importRoute(route, usedSlugs);
			imported.push(entry);
		} catch (error) {
			failed += 1;
			console.warn(`Failed ${route.url} (${error.message})`);
		}
	}

	imported.sort((a, b) => a.slug.localeCompare(b.slug));
	await writeFile(
		pagesIndexFile,
		`${JSON.stringify({ generatedAtISO: new Date().toISOString(), pages: imported }, null, 2)}\n`,
		'utf8'
	);

	console.log(`Import complete: ${imported.length} imported, ${failed} failed`);
	console.log(`Wrote ${pagesIndexFile}`);
	console.log(`Wrote ${imported.length} markdown files to ${pagesDir}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
