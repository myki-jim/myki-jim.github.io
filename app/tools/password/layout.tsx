import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '密码生成器',
  description: '生成安全的随机密码，支持自定义长度、字符类型和强度',
  keywords: ['密码生成', '随机密码', '安全密码', '强密码'],
  openGraph: {
    title: 'jimmyki | 密码生成器',
    description: '生成安全的随机密码，支持自定义强度',
    url: 'https://jimmy.wiki/tools/password',
  },
  twitter: {
    title: 'jimmyki | 密码生成器',
    description: '生成安全的随机密码，支持自定义强度',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
