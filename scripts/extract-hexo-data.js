const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../source/_posts');
const outputDir = path.join(__dirname, '../public/data');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function extractHexoData() {
  const posts = [];
  const categories = new Set();
  const tags = new Set();
  const postsDir = path.join(__dirname, '../source/_posts');
  const outputDir = path.join(__dirname, '../public/data');

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 创建posts子目录用于存放每篇文章的独立JSON
  const postsOutputDir = path.join(outputDir, 'posts');
  if (!fs.existsSync(postsOutputDir)) {
    fs.mkdirSync(postsOutputDir, { recursive: true });
  }

  // 读取所有文章
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

    files.forEach(file => {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content, excerpt } = matter(fileContent);

      const slug = file.replace('.md', '');

      // 提取分类和标签
      if (data.categories) {
        if (Array.isArray(data.categories)) {
          data.categories.forEach(cat => categories.add(cat));
        } else if (typeof data.categories === 'string') {
          categories.add(data.categories);
        }
      }

      if (data.tags) {
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => tags.add(tag));
        } else if (typeof data.tags === 'string') {
          tags.add(data.tags);
        }
      }

      // 创建文章对象
      const post = {
        id: slug,
        slug: slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        updated: data.updated || data.date || new Date().toISOString(),
        categories: data.categories ? (Array.isArray(data.categories) ? data.categories : [data.categories]) : [],
        tags: data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : [],
        layout: data.layout || 'post',
        excerpt: excerpt || '',
        content: content,
        author: data.author || 'Jimmy Ki',
        path: `/${slug}/`,
        coverImage: data.cover || data.coverImage || null
      };

      // 为每篇文章生成独立的JSON文件
      const postJsonPath = path.join(postsOutputDir, `${slug}.json`);
      fs.writeFileSync(postJsonPath, JSON.stringify(post, null, 2));

      // 添加到posts数组（只包含基本信息，用于列表显示）
      posts.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        date: post.date,
        updated: post.updated,
        categories: post.categories,
        tags: post.tags,
        excerpt: post.excerpt,
        author: post.author,
        path: post.path,
        coverImage: post.coverImage
      });
    });
  }

  // 按日期排序
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 生成索引数据文件（只包含文章列表，不包含完整内容）
  const blogData = {
    posts: posts,
    categories: Array.from(categories).map(name => ({
      name,
      count: posts.filter(post => post.categories.includes(name)).length
    })),
    tags: Array.from(tags).map(name => ({
      name,
      count: posts.filter(post => post.tags.includes(name)).length
    })),
    site: {
      title: 'MyKi\'s Blog',
      description: 'Tech notes, coding experiences, and life thoughts',
      author: 'Jimmy Ki',
      url: 'https://myki-jim.github.io',
      postsCount: posts.length,
      categoriesCount: categories.size,
      tagsCount: tags.size
    },
    lastUpdated: new Date().toISOString()
  };

  // 写入索引JSON文件
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(blogData, null, 2)
  );

  console.log(`✅ 提取了 ${posts.length} 篇文章`);
  console.log(`✅ ${categories.size} 个分类`);
  console.log(`✅ ${tags.size} 个标签`);
  console.log(`✅ 文章列表已保存到 public/data/index.json`);
  console.log(`✅ 每篇文章的完整数据已保存到 public/data/posts/`);

  return blogData;
}

// 如果直接运行此脚本
if (require.main === module) {
  extractHexoData();
}

module.exports = extractHexoData;