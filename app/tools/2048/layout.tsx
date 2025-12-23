import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2048 游戏',
  description: '经典 2048 益智游戏，支持键盘和触摸操作，挑战高分',
  keywords: ['2048', '益智游戏', '休闲游戏', '数字游戏'],
  openGraph: {
    title: 'jimmyki | 2048 游戏',
    description: '经典 2048 益智游戏，支持键盘和触摸操作',
    url: 'https://jimmy.wiki/tools/2048',
  },
  twitter: {
    title: 'jimmyki | 2048 游戏',
    description: '经典 2048 益智游戏，支持键盘和触摸操作',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
