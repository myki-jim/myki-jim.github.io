import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开发工具箱',
  description: '精心打造的实用工具集合，包括正则表达式测试器、哈希生成器、编解码转换器、JSON格式化器、UUID生成器等开发工具，提升你的开发效率',
  keywords: ['工具箱', '正则表达式', '哈希生成', 'Base64', 'JSON格式化', 'UUID', '密码生成', 'Markdown编辑器', '二维码生成'],
  openGraph: {
    title: 'jimmyki | 开发工具箱',
    description: '精心打造的实用工具集合，提升你的开发效率',
    url: 'https://myki-jim.github.io/tools',
    images: [
      {
        url: 'https://github.com/myki-jim.png',
        width: 400,
        height: 400,
        alt: 'Jimmy Ki'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'jimmyki | 开发工具箱',
    description: '精心打造的实用工具集合，提升你的开发效率',
    images: ['https://github.com/myki-jim.png'],
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
