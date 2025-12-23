import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

interface PostData {
  title: string;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
  date?: string;
  updated?: string;
  coverImage?: string;
}

// 从 JSON 文件读取文章数据
async function getPostData(slug: string): Promise<PostData | null> {
  try {
    const postJsonPath = path.join(process.cwd(), 'public', 'data', 'posts', `${slug}.json`);
    if (fs.existsSync(postJsonPath)) {
      const fileContent = fs.readFileSync(postJsonPath, 'utf-8');
      return JSON.parse(fileContent);
    }
    return null;
  } catch {
    return null;
  }
}

// 生成每篇文章的 metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postData = await getPostData(params.slug);

  if (!postData) {
    return {
      title: '文章未找到',
    };
  }

  const { title, excerpt, categories, tags, coverImage } = postData;
  const description = excerpt || title || '技术笔记、编程体验和生活思考';
  const imageUrl = coverImage || 'https://github.com/myki-jim.png';
  const keywords = [...(categories || []), ...(tags || [])];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `jimmyki | ${title}`,
      description,
      url: `https://jimmy.wiki/${params.slug}`,
      siteName: "Jimmy Ki's Blog",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      type: 'article',
      publishedTime: postData.date,
      modifiedTime: postData.updated,
      authors: ['Jimmy Ki'],
      tags: tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `jimmyki | ${title}`,
      description,
      images: [imageUrl],
    },
  };
}

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'source/_posts');
  const params = [];

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    files.forEach(file => {
      const slug = file.replace('.md', '');
      params.push({ slug });
    });
  }

  return params;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}