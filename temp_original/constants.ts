import { Post, SocialLink } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Evolution of Spatial Computing',
    excerpt: 'Exploring how depth, lighting, and physics are reshaping user interfaces in the post-flat design era. Why "Liquid Glass" is the future.',
    date: 'Oct 12, 2025',
    category: 'Design',
    readTime: '5 min',
    views: 1240,
    tags: ['Spatial', 'UX', 'Liquid', 'Design'],
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Understanding React 19 Server Components',
    excerpt: 'A deep dive into the new streaming architecture and how it improves Time-to-Interactive for content-heavy blogs.',
    date: 'Oct 08, 2025',
    category: 'Engineering',
    readTime: '8 min',
    views: 890,
    tags: ['React', 'TypeScript', 'Performance'],
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Liquid Physics in CSS',
    excerpt: 'How to use SVG filters and CSS animations to create realistic refraction effects without WebGL.',
    date: 'Sep 29, 2025',
    category: 'Tutorial',
    readTime: '12 min',
    views: 2100,
    tags: ['CSS', 'Animation', 'Liquid', 'Framer'],
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'The Psychology of Micro-Interactions',
    excerpt: 'Why the bounce of a scroll and the blur of a backdrop matter more than you think for user retention.',
    date: 'Sep 15, 2025',
    category: 'UX Research',
    readTime: '6 min',
    views: 1560,
    tags: ['UX', 'Psychology', 'Design'],
    coverImage: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Building a Hexo Theme from Scratch',
    excerpt: 'A comprehensive guide to creating a custom theme using EJS and Stylus, and why migrating to a React-based frontend might be better.',
    date: 'Aug 22, 2025',
    category: 'DevOps',
    readTime: '15 min',
    views: 3400,
    tags: ['DevOps', 'React', 'Legacy'],
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop'
  },
  {
    id: '6',
    title: 'Aesthetic Usability Effect',
    excerpt: 'Users often perceive aesthetically pleasing design as design that’s more usable. Lets test this theory.',
    date: 'Aug 10, 2025',
    category: 'Theory',
    readTime: '4 min',
    views: 900,
    tags: ['Theory', 'UX', 'Design'],
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop'
  }
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'github', url: 'https://github.com' },
  { platform: 'telegram', url: 'https://t.me' },
  { platform: 'email', url: 'mailto:hello@example.com' }
];

export const BLOG_TITLE = "Liquid Design";
export const BLOG_SUBTITLE = "Exploring the boundaries of digital aesthetics.";