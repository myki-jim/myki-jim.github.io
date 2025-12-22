import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'source/_posts');
  const params = [];

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    files.forEach(file => {
      const slug = file.replace('.md', '');
      params.push({ slug });
    });
  }

  return params;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}