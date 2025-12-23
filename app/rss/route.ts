import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated: string;
  excerpt: string;
  content: string;
  author: string;
  path: string;
  coverImage?: string;
  categories?: string[];
  tags?: string[];
}

interface BlogData {
  posts: BlogPost[];
  site: {
    title: string;
    description: string;
    author: string;
    url: string;
  };
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function generateDescription(content: string, excerpt: string): string {
  // Use excerpt if available, otherwise generate from content
  if (excerpt && excerpt.trim()) {
    return escapeXml(stripHtml(excerpt));
  }

  // Generate a brief description from content (first 200 characters)
  const textContent = stripHtml(content);
  const brief = textContent.substring(0, 200);
  return escapeXml(brief + (textContent.length > 200 ? '...' : ''));
}

function generateRSS(data: BlogData): string {
  const { posts, site } = data;
  const lastBuildDate = new Date().toUTCString();

  // Filter out posts with invalid dates and sort by date (newest first)
  const validPosts = posts
    .filter(post => {
      const date = new Date(post.date);
      return date.getFullYear() > 1970;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${site.title}]]></title>
    <description><![CDATA[${site.description}]]></description>
    <link>${site.url}</link>
    <atom:link href="${site.url}/rss" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>${site.author}</managingEditor>
    <webMaster>${site.author}</webMaster>
    <generator>MyKi Blog RSS Generator</generator>
`;

  // Add items
  for (const post of validPosts) {
    const postUrl = `${site.url}${post.path}`;
    const pubDate = formatDate(post.date);
    const description = generateDescription(post.content, post.excerpt);

    rss += `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <description><![CDATA[${description}]]></description>
      <author>${post.author}</author>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.categories ? post.categories[0] : '未分类'}]]></category>
    </item>
`;
  }

  rss += `  </channel>
</rss>`;

  return rss;
}

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/index.json');

    // Check if file exists
    if (!fs.existsSync(dataPath)) {
      return new NextResponse('RSS feed not available', {
        status: 404,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      });
    }

    // Read and parse the blog data
    const data = fs.readFileSync(dataPath, 'utf8');
    const blogData: BlogData = JSON.parse(data);

    // Generate RSS XML
    const rss = generateRSS(blogData);

    // Return RSS with proper headers
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Failed to generate RSS feed</description>
  </channel>
</rss>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
}
