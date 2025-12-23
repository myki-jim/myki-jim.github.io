import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '二维码生成器',
  description: '支持文本、链接、WiFi、名片等多种格式的二维码生成',
  keywords: ['二维码', 'QR Code', '生成器', 'WiFi', '名片'],
  openGraph: {
    title: 'jimmyki | 二维码生成器',
    description: '支持文本、链接、WiFi、名片等多种格式',
    url: 'https://jimmy.wiki/tools/qrcode',
  },
  twitter: {
    title: 'jimmyki | 二维码生成器',
    description: '支持文本、链接、WiFi、名片等多种格式',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
