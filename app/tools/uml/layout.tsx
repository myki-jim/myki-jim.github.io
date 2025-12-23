import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UML 图表设计器',
  description: '专业的 UML 建模工具，支持类图、用例图、时序图等多种UML图表',
  keywords: ['UML', '类图', '用例图', '时序图', '建模工具', 'PlantUML'],
  openGraph: {
    title: 'jimmyki | UML 图表设计器',
    description: '专业的 UML 建模工具，支持类图、用例图等',
    url: 'https://jimmy.wiki/tools/uml',
  },
  twitter: {
    title: 'jimmyki | UML 图表设计器',
    description: '专业的 UML 建模工具，支持类图、用例图等',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
