import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '编解码转换器',
  description: '支持 Base64、URL、HTML、十六进制等多种编码方式实时转换',
  keywords: ['Base64', 'URL编码', 'HTML编码', '十六进制', '编码', '解码'],
  openGraph: {
    title: 'jimmyki | 编解码转换器',
    description: '支持 Base64、URL、HTML、十六进制等多种编码实时转换',
    url: 'https://jimmy.wiki/tools/encoder',
  },
  twitter: {
    title: 'jimmyki | 编解码转换器',
    description: '支持 Base64、URL、HTML、十六进制等多种编码实时转换',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
