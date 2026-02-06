import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { load } from 'cheerio';

const ORIGIN = 'https://www.essentialfitness.co';
const RSS_URL = `${ORIGIN}/blog?format=rss`;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(scriptDir, '..', 'content');
const blogDir = path.join(contentDir, 'blog');
const routesFile = path.join(contentDir, 'routes.json');
const blogIndexFile = path.join(contentDir, 'blog-index.json');

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced'
});

function normalizeBlogUrl(input) {
	try {
		const parsed = new URL(input, ORIGIN);
		if (parsed.origin !== ORIGIN) return null;
		parsed.hash = '';
		parsed.search = '';
		if (!/^\/blog\/[^/]+$/.test(parsed.pathname)) return null;
		return `${ORIGIN}${parsed.pathname}`;
	} catch {
		return null;
	}
}

function slugFromUrl(url, fallback = 'post') {
	try {
		const parsed = new URL(url);
		const last = parsed.pathname.split('/').filter(Boolean).pop() || fallback;
		const decoded = decodeURIComponent(last);
		return decoded
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '') || fallback;
	} catch {
		return fallback;
	}
}

function toISODate(input) {
	if (!input) return null;
	const d = new Date(input);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}

function collapseWhitespace(input) {
	return (input || '').replace(/\s+/g, ' ').trim();
}

function excerptFromText(input, maxLength = 200) {
	const clean = collapseWhitespace(input);
	if (!clean) return '';
	if (clean.length <= maxLength) return clean;
	return `${clean.slice(0, maxLength).trimEnd()}...`;
}

function yamlQuote(input) {
	return `"${String(input ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\r?\n/g, ' ')
		.trim()}"`;
}

async function fetchText(url) {
	const response = await fetch(url, {
		redirect: 'follow',
		headers: {
			'user-agent': 'onxx-blog-importer/1.0 (+https://www.essentialfitness.co)'
		}
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	return response.text();
}

function parseRssItems(xmlText) {
	const $ = load(xmlText, { xmlMode: true });
	const items = [];

	$('item').each((_, item) => {
		const node = $(item);
		const link = normalizeBlogUrl(node.find('link').first().text());
		if (!link) return;
		items.push({
			title: collapseWhitespace(node.find('title').first().text()),
			link,
			pubDate: collapseWhitespace(node.find('pubDate').first().text())
		});
	});

	return items;
}

async function loadPostsFromRss() {
	try {
		const xml = await fetchText(RSS_URL);
		const items = parseRssItems(xml);
		console.log(`RSS: parsed ${items.length} items`);
		return items;
	} catch (error) {
		console.warn(`RSS unavailable (${error.message})`);
		return [];
	}
}

async function loadPostsFromRoutesFallback() {
	try {
		const raw = await readFile(routesFile, 'utf8');
		const parsed = JSON.parse(raw);
		const routes = Array.isArray(parsed?.routes) ? parsed.routes : [];
		const posts = routes
			.filter((route) => route?.type === 'blogPost' || /^\/blog\/[^/]+$/.test(route?.pathname || ''))
			.map((route) => {
				const link = normalizeBlogUrl(route.url);
				if (!link) return null;
				return { title: '', link, pubDate: '' };
			})
			.filter(Boolean);
		console.log(`Routes fallback: parsed ${posts.length} posts`);
		return posts;
	} catch (error) {
		console.warn(`Routes fallback unavailable (${error.message})`);
		return [];
	}
}

function uniqueByLink(posts) {
	const deduped = new Map();
	for (const post of posts) {
		if (!deduped.has(post.link)) {
			deduped.set(post.link, post);
		}
	}
	return Array.from(deduped.values());
}

function pickContentRoot($) {
	const selectors = [
		'main article',
		'article .blog-item-content',
		'article .entry-content',
		'article .sqs-html-content',
		'article',
		'main .sqs-layout',
		'main',
		'#page',
		'body'
	];

	for (const selector of selectors) {
		const candidate = $(selector).first();
		if (!candidate.length) continue;
		const clone = candidate.clone();
		clone.find('script,style,noscript,iframe,header,footer,nav,aside,form').remove();
		const text = collapseWhitespace(clone.text());
		if (text.length >= 120 || selector === 'body') {
			return clone;
		}
	}

	return $('body').first().clone();
}

async function importSinglePost(post, usedSlugs) {
	const html = await fetchText(post.link);
	const $ = load(html);

	const contentRoot = pickContentRoot($);
	const contentHtml = contentRoot.html() || '';
	const plainText = collapseWhitespace(contentRoot.text());
	const excerpt = excerptFromText(plainText, 200);

	const pageTitle =
		collapseWhitespace($('meta[property="og:title"]').attr('content')) ||
		collapseWhitespace($('article h1').first().text()) ||
		collapseWhitespace($('h1').first().text());
	const title = post.title || pageTitle || slugFromUrl(post.link, 'post');

	const pageDate =
		collapseWhitespace($('meta[property="article:published_time"]').attr('content')) ||
		collapseWhitespace($('time').first().attr('datetime')) ||
		'';
	const date = toISODate(post.pubDate) || toISODate(pageDate) || new Date().toISOString();

	const baseSlug = slugFromUrl(post.link, 'post');
	let slug = baseSlug;
	let n = 2;
	while (usedSlugs.has(slug)) {
		slug = `${baseSlug}-${n}`;
		n += 1;
	}
	usedSlugs.add(slug);

	let markdown = turndown.turndown(contentHtml).trim();
	if (!markdown) {
		markdown = plainText;
	}

	const frontmatter = [
		'---',
		`title: ${yamlQuote(title)}`,
		`date: ${yamlQuote(date)}`,
		`slug: ${yamlQuote(slug)}`,
		`source: ${yamlQuote(post.link)}`,
		`excerpt: ${yamlQuote(excerpt)}`,
		'---',
		''
	].join('\n');

	const outPath = path.join(blogDir, `${slug}.md`);
	await writeFile(outPath, `${frontmatter}\n${markdown}\n`, 'utf8');

	return {
		slug,
		title,
		date,
		source: post.link,
		excerpt
	};
}

async function main() {
	await mkdir(blogDir, { recursive: true });

	let posts = await loadPostsFromRss();
	if (posts.length === 0) {
		posts = await loadPostsFromRoutesFallback();
	}
	posts = uniqueByLink(posts);

	if (posts.length === 0) {
		await writeFile(
			blogIndexFile,
			`${JSON.stringify({ source: ORIGIN, generatedAtISO: new Date().toISOString(), posts: [] }, null, 2)}\n`,
			'utf8'
		);
		console.log('Import complete: 0 imported, 0 failed');
		return;
	}

	const usedSlugs = new Set();
	const imported = [];
	let failed = 0;

	for (const post of posts) {
		try {
			const entry = await importSinglePost(post, usedSlugs);
			imported.push(entry);
		} catch (error) {
			failed += 1;
			console.warn(`Failed ${post.link} (${error.message})`);
		}
	}

	imported.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	await writeFile(
		blogIndexFile,
		`${JSON.stringify(
			{ source: ORIGIN, generatedAtISO: new Date().toISOString(), posts: imported },
			null,
			2
		)}\n`,
		'utf8'
	);

	console.log(`Import complete: ${imported.length} imported, ${failed} failed`);
	console.log(`Wrote ${blogIndexFile}`);
	console.log(`Wrote ${imported.length} markdown files to ${blogDir}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
