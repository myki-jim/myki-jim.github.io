export interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  views: number;
  content?: string; // Markdown content simulation
  tags?: string[];
  coverImage?: string;
}

export interface SocialLink {
  platform: 'github' | 'telegram' | 'email';
  url: string;
}

export type PageType = 'home' | 'post' | 'tags' | 'categories' | 'about' | 'contact';

export interface ThemeConfig {
  blurStrength: number;
  saturation: number;
  glassOpacity: number;
  accentColor: string;
}