import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { env } from '$env/dynamic/private';

import blogIndexFile from '../../../content/blog-index.json' with { type: 'json' };

const BLOG_CONTENT_DIR = resolve(process.cwd(), 'content', 'blog');
const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

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

type NotionRichText = {
	plain_text?: string;
	href?: string | null;
	annotations?: {
		bold?: boolean;
		italic?: boolean;
		strikethrough?: boolean;
		code?: boolean;
	};
};

type NotionProperty = {
	type?: string;
	title?: NotionRichText[];
	rich_text?: NotionRichText[];
	select?: { name?: string } | null;
	status?: { name?: string } | null;
	multi_select?: { name?: string }[];
	date?: { start?: string | null } | null;
	url?: string | null;
};

type NotionPage = {
	id: string;
	properties: Record<string, NotionProperty>;
};

type NotionBlock = {
	id: string;
	type: string;
	has_children?: boolean;
	[key: string]: unknown;
};

type NotionListResponse<T> = {
	results: T[];
	has_more?: boolean;
	next_cursor?: string | null;
};

type Fetcher = typeof globalThis.fetch;

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

function getFallbackBlogIndex(): BlogIndexItem[] {
	const parsed = blogIndexFile as BlogIndexFile;
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

function normalizeDatabaseId(value: string): string {
	const trimmed = value.trim();
	const compactMatch = trimmed.replace(/-/g, '').match(/[0-9a-f]{32}/i);
	return compactMatch?.[0] ?? trimmed;
}

function getNotionConfig(): { token: string; databaseId: string } | null {
	const token = env.NOTION_TOKEN?.trim();
	const databaseId = env.NOTION_BLOG_DATABASE_ID?.trim();

	if (!token || !databaseId) {
		return null;
	}

	return {
		token,
		databaseId: normalizeDatabaseId(databaseId)
	};
}

async function notionRequest<T>(
	path: string,
	init: RequestInit = {},
	fetcher: Fetcher
): Promise<T> {
	const config = getNotionConfig();
	if (!config) {
		throw new Error('Notion blog environment variables are not configured.');
	}

	const response = await fetcher(`${NOTION_API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${config.token}`,
			'Notion-Version': NOTION_VERSION,
			'content-type': 'application/json',
			...init.headers
		}
	});

	if (!response.ok) {
		throw new Error(`Notion request failed: ${response.status} ${await response.text()}`);
	}

	return (await response.json()) as T;
}

function getProperty(
	properties: Record<string, NotionProperty>,
	names: string[]
): NotionProperty | undefined {
	return names.map((name) => properties[name]).find(Boolean);
}

function richTextToPlainText(items: NotionRichText[] | undefined): string {
	return (items ?? []).map((item) => item.plain_text ?? '').join('');
}

function richTextToMarkdown(items: NotionRichText[] | undefined): string {
	return (items ?? [])
		.map((item) => {
			let text = item.plain_text ?? '';
			if (!text) return '';

			if (item.annotations?.code) text = `\`${text}\``;
			if (item.annotations?.bold) text = `**${text}**`;
			if (item.annotations?.italic) text = `_${text}_`;
			if (item.annotations?.strikethrough) text = `~~${text}~~`;
			if (item.href) text = `[${text}](${item.href})`;

			return text;
		})
		.join('');
}

function propertyText(property: NotionProperty | undefined): string {
	if (!property) return '';

	if (property.type === 'title') return richTextToPlainText(property.title);
	if (property.type === 'rich_text') return richTextToPlainText(property.rich_text);
	if (property.type === 'select') return property.select?.name ?? '';
	if (property.type === 'status') return property.status?.name ?? '';
	if (property.type === 'date') return property.date?.start ?? '';
	if (property.type === 'url') return property.url ?? '';
	if (property.type === 'multi_select') {
		return property.multi_select?.map((option) => option.name).filter(Boolean).join(', ') ?? '';
	}

	return '';
}

function isPublished(properties: Record<string, NotionProperty>): boolean {
	const status = propertyText(getProperty(properties, ['Status', 'status']));
	return status.toLowerCase() === 'published';
}

function pageToBlogIndexItem(page: NotionPage): BlogIndexItem | null {
	const title = propertyText(getProperty(page.properties, ['Title', 'Name', 'Post']));
	const slug = normalizeSlug(propertyText(getProperty(page.properties, ['Slug', 'slug'])));

	if (!title || !slug) {
		return null;
	}

	return {
		slug,
		title,
		date: propertyText(getProperty(page.properties, ['Published Date', 'Date', 'Published'])),
		source: propertyText(getProperty(page.properties, ['Source URL', 'Source', 'URL'])),
		excerpt: propertyText(getProperty(page.properties, ['Excerpt', 'Summary', 'Description']))
	};
}

async function queryNotionBlogPages(fetcher: Fetcher): Promise<NotionPage[]> {
	const config = getNotionConfig();
	if (!config) {
		return [];
	}

	const pages: NotionPage[] = [];
	let startCursor: string | null = null;

	do {
		const response: NotionListResponse<NotionPage> = await notionRequest<
			NotionListResponse<NotionPage>
		>(
			`/databases/${config.databaseId}/query`,
			{
				method: 'POST',
				body: JSON.stringify({
					page_size: 100,
					start_cursor: startCursor ?? undefined
				})
			},
			fetcher
		);

		pages.push(...response.results);
		startCursor = response.next_cursor ?? null;
		if (!response.has_more) {
			startCursor = null;
		}
	} while (startCursor);

	return pages;
}

async function getNotionBlogIndex(fetcher: Fetcher): Promise<BlogIndexItem[]> {
	const pages = await queryNotionBlogPages(fetcher);
	return pages
		.filter((page) => isPublished(page.properties))
		.map(pageToBlogIndexItem)
		.filter((post): post is BlogIndexItem => Boolean(post))
		.sort((a, b) => {
			const left = Date.parse(a.date);
			const right = Date.parse(b.date);
			return Number.isNaN(right) || Number.isNaN(left) ? 0 : right - left;
		});
}

function getBlockRichText(block: NotionBlock): NotionRichText[] {
	const value = block[block.type];
	if (!value || typeof value !== 'object') {
		return [];
	}

	const blockData = value as { rich_text?: NotionRichText[] };
	return blockData.rich_text ?? [];
}

function getBlockUrl(block: NotionBlock): string {
	const value = block[block.type];
	if (!value || typeof value !== 'object') {
		return '';
	}

	const blockData = value as {
		type?: 'external' | 'file';
		external?: { url?: string };
		file?: { url?: string };
		url?: string;
	};

	if (blockData.type === 'external') return blockData.external?.url ?? '';
	if (blockData.type === 'file') return blockData.file?.url ?? '';
	return blockData.url ?? '';
}

async function getBlockChildren(blockId: string, fetcher: Fetcher): Promise<NotionBlock[]> {
	const blocks: NotionBlock[] = [];
	let startCursor: string | null = null;

	do {
		const query = new URLSearchParams({ page_size: '100' });
		if (startCursor) {
			query.set('start_cursor', startCursor);
		}

		const response: NotionListResponse<NotionBlock> = await notionRequest<
			NotionListResponse<NotionBlock>
		>(
			`/blocks/${blockId}/children?${query.toString()}`,
			{},
			fetcher
		);

		blocks.push(...response.results);
		startCursor = response.next_cursor ?? null;
		if (!response.has_more) {
			startCursor = null;
		}
	} while (startCursor);

	return blocks;
}

async function blockToMarkdown(block: NotionBlock, fetcher: Fetcher): Promise<string> {
	const text = richTextToMarkdown(getBlockRichText(block));
	let markdown = '';

	switch (block.type) {
		case 'paragraph':
			markdown = text;
			break;
		case 'heading_1':
			markdown = `# ${text}`;
			break;
		case 'heading_2':
			markdown = `## ${text}`;
			break;
		case 'heading_3':
			markdown = `### ${text}`;
			break;
		case 'bulleted_list_item':
			markdown = `- ${text}`;
			break;
		case 'numbered_list_item':
			markdown = `1. ${text}`;
			break;
		case 'quote':
			markdown = `> ${text}`;
			break;
		case 'to_do':
			markdown = `- [ ] ${text}`;
			break;
		case 'divider':
			markdown = '---';
			break;
		case 'code': {
			const value = block[block.type] as { language?: string } | undefined;
			markdown = `\`\`\`${value?.language ?? ''}\n${text}\n\`\`\``;
			break;
		}
		case 'image': {
			const url = getBlockUrl(block);
			markdown = url ? `![${text}](${url})` : '';
			break;
		}
		case 'bookmark':
		case 'embed':
		case 'link_preview':
		case 'video': {
			const url = getBlockUrl(block);
			markdown = url ? `[${text || url}](${url})` : text;
			break;
		}
		default:
			markdown = text;
			break;
	}

	if (block.has_children) {
		const childMarkdown = await blocksToMarkdown(await getBlockChildren(block.id, fetcher), fetcher);
		return [markdown, childMarkdown].filter((entry) => entry.trim().length > 0).join('\n\n');
	}

	return markdown;
}

async function blocksToMarkdown(blocks: NotionBlock[], fetcher: Fetcher): Promise<string> {
	const markdown = await Promise.all(blocks.map((block) => blockToMarkdown(block, fetcher)));
	return markdown.filter((entry) => entry.trim().length > 0).join('\n\n');
}

async function getNotionBlogPost(slug: string, fetcher: Fetcher): Promise<BlogPost | null> {
	const normalizedSlug = normalizeSlug(slug);
	const pages = await queryNotionBlogPages(fetcher);
	const page = pages.find((candidate) => {
		if (!isPublished(candidate.properties)) {
			return false;
		}

		const candidateSlug = normalizeSlug(
			propertyText(getProperty(candidate.properties, ['Slug', 'slug']))
		);
		return candidateSlug === normalizedSlug;
	});

	if (!page) {
		return null;
	}

	const indexed = pageToBlogIndexItem(page);
	if (!indexed) {
		return null;
	}

	const contentMarkdown = await blocksToMarkdown(await getBlockChildren(page.id, fetcher), fetcher);
	return {
		...indexed,
		contentMarkdown: contentMarkdown || indexed.excerpt
	};
}

export async function getBlogIndex(fetcher: Fetcher): Promise<BlogIndexItem[]> {
	if (getNotionConfig()) {
		try {
			const notionPosts = await getNotionBlogIndex(fetcher);
			if (notionPosts.length > 0) {
				return notionPosts;
			}
		} catch (error) {
			console.error('Failed to load Notion blog index.', error);
		}
	}

	return getFallbackBlogIndex();
}

async function getFallbackBlogPost(slug: string): Promise<BlogPost | null> {
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
			const indexed = getFallbackBlogIndex().find((post) => post.slug === normalizedSlug);
			if (!indexed) {
				return null;
			}

			return {
				...indexed,
				contentMarkdown: indexed.excerpt
			};
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

export async function getBlogPost(slug: string, fetcher: Fetcher): Promise<BlogPost | null> {
	if (getNotionConfig()) {
		try {
			const notionPost = await getNotionBlogPost(slug, fetcher);
			if (notionPost) {
				return notionPost;
			}
		} catch (error) {
			console.error('Failed to load Notion blog post.', error);
		}
	}

	return getFallbackBlogPost(slug);
}
