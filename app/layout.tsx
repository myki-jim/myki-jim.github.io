import './globals.css'
import './styles/theme.css'
import './styles/markdown.css'
import { Metadata } from 'next'
import BodyWrapper from './components/BodyWrapper'

export const metadata: Metadata = {
  title: {
    default: "Jimmy Ki's Blog",
    template: 'jimmyki | %s'
  },
  description: '技术笔记、编程体验和生活思考',
  keywords: ['博客', '技术', '编程', '开发', 'JavaScript', 'TypeScript', 'React', 'Next.js'],
  authors: [{ name: 'Jimmy Ki', url: 'https://github.com/myki-jim' }],
  creator: 'Jimmy Ki',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://myki-jim.github.io',
    title: "Jimmy Ki's Blog",
    description: '技术笔记、编程体验和生活思考',
    siteName: "Jimmy Ki's Blog",
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
    title: "Jimmy Ki's Blog",
    description: '技术笔记、编程体验和生活思考',
    images: ['https://github.com/myki-jim.png'],
    creator: '@myki_jim',
  },
  icons: {
    icon: 'https://github.com/myki-jim.png',
    apple: 'https://github.com/myki-jim.png',
  },
  metadataBase: new URL('https://jimmy.wiki'),
  alternates: {
    canonical: 'https://jimmy.wiki',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;800&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="https://github.com/myki-jim.png" />
        <link rel="apple-touch-icon" href="https://github.com/myki-jim.png" />
        {/* Alternate domains for SEO */}
        <link rel="alternate" hrefLang="zh-cn" href="https://jimmy.wiki" />
        <link rel="alternate" hrefLang="zh-cn" href="https://jimmyki.com" />
        <link rel="alternate" hrefLang="zh-cn" href="https://myki-jim.github.io" />
      </head>
      <body>
        <BodyWrapper>{children}</BodyWrapper>
      </body>
    </html>
  )
}