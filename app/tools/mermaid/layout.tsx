import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mermaid 图表编辑器',
  description: '实时预览，支持流程图、时序图、甘特图、类图等多种图表类型',
  keywords: ['Mermaid', '流程图', '时序图', '甘特图', '类图', '图表编辑器'],
  openGraph: {
    title: 'jimmyki | Mermaid 图表编辑器',
    description: '实时预览，支持流程图、时序图、甘特图等',
    url: 'https://jimmy.wiki/tools/mermaid',
  },
  twitter: {
    title: 'jimmyki | Mermaid 图表编辑器',
    description: '实时预览，支持流程图、时序图、甘特图等',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
