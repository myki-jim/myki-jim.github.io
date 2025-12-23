import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RSA 密钥生成器',
  description: '生成 RSA 公钥私钥对，支持 PEM、SSH 等多种格式',
  keywords: ['RSA', '密钥生成', '公钥', '私钥', 'SSL', 'SSH'],
  openGraph: {
    title: 'jimmyki | RSA 密钥生成器',
    description: '生成 RSA 公钥私钥对，支持多种格式',
    url: 'https://jimmy.wiki/tools/keygen',
  },
  twitter: {
    title: 'jimmyki | RSA 密钥生成器',
    description: '生成 RSA 公钥私钥对，支持多种格式',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
