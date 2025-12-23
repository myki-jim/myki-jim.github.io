import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '哈希生成器',
  description: '支持 MD5、SHA-1、SHA-256、SHA-512 等多种哈希算法，实时生成哈希值',
  keywords: ['哈希', 'MD5', 'SHA-1', 'SHA-256', 'SHA-512', '加密'],
  openGraph: {
    title: 'jimmyki | 哈希生成器',
    description: '支持 MD5、SHA-1、SHA-256 等多种哈希算法',
    url: 'https://jimmy.wiki/tools/hash',
  },
  twitter: {
    title: 'jimmyki | 哈希生成器',
    description: '支持 MD5、SHA-1、SHA-256 等多种哈希算法',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
