import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '正则表达式测试器',
  description: '实时测试和调试正则表达式，内置常用模式库，支持语法高亮和错误提示',
  keywords: ['正则表达式', 'regex', '测试器', '调试', '模式匹配'],
  openGraph: {
    title: 'jimmyki | 正则表达式测试器',
    description: '实时测试和调试正则表达式，内置常用模式库',
    url: 'https://jimmy.wiki/tools/regex',
  },
  twitter: {
    title: 'jimmyki | 正则表达式测试器',
    description: '实时测试和调试正则表达式，内置常用模式库',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
