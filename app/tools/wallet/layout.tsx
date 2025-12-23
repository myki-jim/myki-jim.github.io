import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '钱包地址生成器',
  description: '生成 BTC、ETH、TRX 等区块链钱包地址，支持多种加密货币',
  keywords: ['钱包', '区块链', 'BTC', '比特币', 'ETH', '以太坊', 'TRX', '波场'],
  openGraph: {
    title: 'jimmyki | 钱包地址生成器',
    description: '生成 BTC、ETH、TRX 等区块链钱包地址',
    url: 'https://jimmy.wiki/tools/wallet',
  },
  twitter: {
    title: 'jimmyki | 钱包地址生成器',
    description: '生成 BTC、ETH、TRX 等区块链钱包地址',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
