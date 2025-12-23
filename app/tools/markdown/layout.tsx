import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markdown 编辑器',
  description: '实时预览编辑器，支持 GitHub Flavored Markdown 语法',
  keywords: ['Markdown', '编辑器', '实时预览', 'GFM'],
  openGraph: {
    title: 'jimmyki | Markdown 编辑器',
    description: '实时预览编辑器，支持 GitHub Flavored Markdown',
    url: 'https://jimmy.wiki/tools/markdown',
  },
  twitter: {
    title: 'jimmyki | Markdown 编辑器',
    description: '实时预览编辑器，支持 GitHub Flavored Markdown',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
