import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON 格式化器',
  description: '格式化、压缩和验证 JSON 数据，支持语法高亮和错误提示',
  keywords: ['JSON', '格式化', '压缩', '验证', '解析器'],
  openGraph: {
    title: 'jimmyki | JSON 格式化器',
    description: '格式化、压缩和验证 JSON 数据',
    url: 'https://jimmy.wiki/tools/json',
  },
  twitter: {
    title: 'jimmyki | JSON 格式化器',
    description: '格式化、压缩和验证 JSON 数据',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
