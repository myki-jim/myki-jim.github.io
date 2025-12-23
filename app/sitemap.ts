import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

// Site configuration
const SITE_URL = 'https://jimmy.wiki'

interface BlogData {
  posts: Array<{
    slug: string
    updated: string
    path: string
    sticky?: boolean
  }>
  categories: Array<{
    name: string
  }>
  tags: Array<{
    name: string
  }>
}

// Helper function to format date to YYYY-MM-DD
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Helper function to get change frequency based on page type
function getChangeFreq(type: 'homepage' | 'post' | 'static' | 'archive'): string {
  switch (type) {
    case 'homepage':
      return 'daily'
    case 'post':
      return 'monthly'
    case 'static':
      return 'weekly'
    case 'archive':
      return 'daily'
    default:
      return 'monthly'
  }
}

// Helper function to get priority based on page type
function getPriority(type: 'homepage' | 'post' | 'static' | 'archive', sticky?: boolean): number {
  switch (type) {
    case 'homepage':
      return 1.0
    case 'post':
      return sticky ? 0.9 : 0.8
    case 'static':
      return 0.6
    case 'archive':
      return 0.7
    default:
      return 0.5
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Read blog data
  const dataPath = path.join(process.cwd(), 'public/data/index.json')

  let blogData: BlogData | null = null
  if (fs.existsSync(dataPath)) {
    try {
      const data = fs.readFileSync(dataPath, 'utf8')
      blogData = JSON.parse(data)
    } catch (error) {
      console.error('Error reading blog data:', error)
    }
  }

  const sitemapEntries: MetadataRoute.Sitemap = []

  // 1. Add homepage
  sitemapEntries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // 2. Add static pages
  const staticPages = [
    { path: '/about', lastModified: new Date() },
    { path: '/contact', lastModified: new Date() },
    { path: '/categories', lastModified: new Date() },
    { path: '/tags', lastModified: new Date() },
    { path: '/tools', lastModified: new Date() },
  ]

  staticPages.forEach(page => {
    sitemapEntries.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: page.lastModified,
      changeFrequency: getChangeFreq('static'),
      priority: getPriority('static'),
    })
  })

  // 3. Add tool pages
  const toolPages = [
    '2048',
    'password',
    'uml',
    'hash',
    'markdown',
    'encoder',
    'keygen',
    'regex',
    'qrcode',
    'json',
    'mermaid',
    'uuid',
  ]

  toolPages.forEach(tool => {
    sitemapEntries.push({
      url: `${SITE_URL}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: getChangeFreq('static'),
      priority: 0.5,
    })
  })

  // 4. Add blog posts
  if (blogData?.posts) {
    blogData.posts.forEach(post => {
      sitemapEntries.push({
        url: `${SITE_URL}${post.path}`,
        lastModified: new Date(post.updated),
        changeFrequency: getChangeFreq('post'),
        priority: getPriority('post', post.sticky),
      })
    })
  }

  // 5. Add category pages
  if (blogData?.categories) {
    blogData.categories.forEach(category => {
      sitemapEntries.push({
        url: `${SITE_URL}/categories/${encodeURIComponent(category.name)}`,
        lastModified: new Date(),
        changeFrequency: getChangeFreq('archive'),
        priority: 0.6,
      })
    })
  }

  // 6. Add tag pages
  if (blogData?.tags) {
    blogData.tags.forEach(tag => {
      sitemapEntries.push({
        url: `${SITE_URL}/tags/${encodeURIComponent(tag.name)}`,
        lastModified: new Date(),
        changeFrequency: getChangeFreq('archive'),
        priority: 0.5,
      })
    })
  }

  return sitemapEntries
}
