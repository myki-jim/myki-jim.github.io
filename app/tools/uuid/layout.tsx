import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UUID 生成器',
  description: '批量生成 UUID v4，支持大写、小写、带连字符等多种格式',
  keywords: ['UUID', 'GUID', '生成器', '随机ID'],
  openGraph: {
    title: 'jimmyki | UUID 生成器',
    description: '批量生成 UUID v4，支持多种格式',
    url: 'https://jimmy.wiki/tools/uuid',
  },
  twitter: {
    title: 'jimmyki | UUID 生成器',
    description: '批量生成 UUID v4，支持多种格式',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
