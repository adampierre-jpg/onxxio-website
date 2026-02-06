import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const PAGES_INDEX_PATH = resolve(process.cwd(), 'content', 'pages-index.json');
const PAGES_CONTENT_DIR = resolve(process.cwd(), 'content', 'pages');

export type PageIndexItem = {
	slug: string;
	title: string;
	type: string;
	source: string;
};

export type ImportedPage = PageIndexItem & {
	contentMarkdown: string;
};

type PagesIndexFile = {
	pages?: PageIndexItem[];
};

function normalizeSlug(slug: string): string {
	return slug.trim().toLowerCase();
}

function parseFrontmatter(markdown: string): { frontmatter: Record<string, string>; body: string } {
	const normalized = markdown.replace(/^\uFEFF/, '');
	if (!normalized.startsWith('---')) {
		return { frontmatter: {}, body: normalized.trim() };
	}

	const lines = normalized.split(/\r?\n/);
	if (lines[0]?.trim() !== '---') {
		return { frontmatter: {}, body: normalized.trim() };
	}

	const frontmatter: Record<string, string> = {};
	let endLine = -1;

	for (let i = 1; i < lines.length; i += 1) {
		const line = lines[i] ?? '';
		if (line.trim() === '---') {
			endLine = i;
			break;
		}

		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) {
			continue;
		}

		let value = match[2]?.trim() ?? '';
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		frontmatter[match[1]] = value;
	}

	if (endLine === -1) {
		return { frontmatter, body: normalized.trim() };
	}

	const body = lines.slice(endLine + 1).join('\n').trim();
	return { frontmatter, body };
}

export async function getPagesIndex(): Promise<PageIndexItem[]> {
	let raw: string;
	try {
		raw = await readFile(PAGES_INDEX_PATH, 'utf8');
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === 'ENOENT') {
			return [];
		}
		throw error;
	}

	let parsed: PagesIndexFile;
	try {
		parsed = JSON.parse(raw) as PagesIndexFile;
	} catch {
		return [];
	}

	const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
	return pages
		.map((page) => ({
			slug: normalizeSlug(page.slug ?? ''),
			title: (page.title ?? '').trim(),
			type: (page.type ?? '').trim(),
			source: (page.source ?? '').trim()
		}))
		.filter((page) => page.slug.length > 0);
}

export async function getPageBySlug(slug: string): Promise<ImportedPage | null> {
	const normalizedSlug = normalizeSlug(slug);
	if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
		return null;
	}

	const filePath = resolve(PAGES_CONTENT_DIR, `${normalizedSlug}.md`);
	let markdown: string;
	try {
		markdown = await readFile(filePath, 'utf8');
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === 'ENOENT') {
			return null;
		}
		throw error;
	}

	const { frontmatter, body } = parseFrontmatter(markdown);
	const pages = await getPagesIndex();
	const indexed = pages.find((page) => page.slug === normalizedSlug);

	return {
		slug: frontmatter.slug?.trim() || indexed?.slug || normalizedSlug,
		title: frontmatter.title?.trim() || indexed?.title || normalizedSlug,
		type: frontmatter.type?.trim() || indexed?.type || 'page',
		source: frontmatter.source?.trim() || indexed?.source || '',
		contentMarkdown: body
	};
}

export async function getHomePage(): Promise<ImportedPage | null> {
	const pages = await getPagesIndex();
	const orderedCandidates = [
		'home',
		'index',
		pages.find((page) => page.type.toLowerCase() === 'home')?.slug,
		pages[0]?.slug
	].filter((slug): slug is string => Boolean(slug && slug.length > 0));

	// Keep candidate order but remove duplicates so we only try each slug once.
	const seen = new Set<string>();
	const uniqueCandidates: string[] = [];
	for (const slug of orderedCandidates) {
		const normalized = normalizeSlug(slug);
		if (seen.has(normalized)) {
			continue;
		}
		seen.add(normalized);
		uniqueCandidates.push(normalized);
	}

	for (const slug of uniqueCandidates) {
		const page = await getPageBySlug(slug);
		if (page) {
			return page;
		}
	}

	return null;
}
