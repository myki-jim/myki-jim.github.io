import './globals.css'
import './styles/theme.css'
import './styles/markdown.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Jimmy Ki's Blog",
  description: '技术笔记、编程体验和生活思考',
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
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}