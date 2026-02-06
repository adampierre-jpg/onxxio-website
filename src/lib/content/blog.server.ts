import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BLOG_INDEX_PATH = resolve(process.cwd(), 'content', 'blog-index.json');
const BLOG_CONTENT_DIR = resolve(process.cwd(), 'content', 'blog');

export type BlogIndexItem = {
	slug: string;
	title: string;
	date: string;
	source: string;
	excerpt: string;
};

export type BlogPost = BlogIndexItem & {
	contentMarkdown: string;
};

type BlogIndexFile = {
	posts?: BlogIndexItem[];
};

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

function toExcerpt(markdown: string): string {
	const plain = markdown
		.replace(/!\[[^\]]*]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
		.replace(/[`*_>#~-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return plain.slice(0, 200);
}

function normalizeSlug(slug: string): string {
	return slug.trim().toLowerCase();
}

export async function getBlogIndex(): Promise<BlogIndexItem[]> {
	const raw = await readFile(BLOG_INDEX_PATH, 'utf8');
	const parsed = JSON.parse(raw) as BlogIndexFile;
	const posts = Array.isArray(parsed.posts) ? parsed.posts : [];

	return posts
		.map((post) => ({
			slug: normalizeSlug(post.slug ?? ''),
			title: (post.title ?? '').trim(),
			date: (post.date ?? '').trim(),
			source: (post.source ?? '').trim(),
			excerpt: (post.excerpt ?? '').trim()
		}))
		.filter((post) => post.slug.length > 0)
		.sort((a, b) => {
			const left = Date.parse(a.date);
			const right = Date.parse(b.date);
			return Number.isNaN(right) || Number.isNaN(left) ? 0 : right - left;
		});
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
	const normalizedSlug = normalizeSlug(slug);
	if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
		return null;
	}

	const filePath = resolve(BLOG_CONTENT_DIR, `${normalizedSlug}.md`);
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
	const title = frontmatter.title?.trim() || normalizedSlug;
	const date = frontmatter.date?.trim() || '';
	const source = frontmatter.source?.trim() || '';
	const excerpt = frontmatter.excerpt?.trim() || toExcerpt(body);

	return {
		slug: frontmatter.slug?.trim() || normalizedSlug,
		title,
		date,
		source,
		excerpt,
		contentMarkdown: body
	};
}
