export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated: string;
  categories: string[];
  tags: string[];
  layout: string;
  excerpt: string;
  content: string;
  author: string;
  path: string;
  coverImage?: string;
  readTime?: string;
  views?: number;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  path: string;
}

export interface PageType {
  home: string;
  post: string;
  tags: string;
  categories: string;
  about: string;
  contact: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BlogData {
  posts: Post[];
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  site: {
    title: string;
    description: string;
    author: string;
    url: string;
    postsCount: number;
    categoriesCount: number;
    tagsCount: number;
  };
  lastUpdated: string;
}