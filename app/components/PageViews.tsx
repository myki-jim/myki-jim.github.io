import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Folder, Mail, Send, Filter, X } from 'lucide-react';
import Sidebar from './Sidebar';
import ArticleCard from './ArticleCard';
import { Post, BlogData } from './types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)' }
};

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

interface PageViewProps {
  onOpenPost: (id: string) => void;
  posts: Post[];
  blogData?: BlogData;
}

export const TagsView: React.FC<PageViewProps> = ({ onOpenPost, posts }) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Extract all unique tags from posts with counts
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(post => post.tags?.includes(activeTag));
  }, [activeTag, posts]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">按标签浏览</h1>
        <p className="text-[var(--text-secondary)]">按主题筛选文章。</p>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-16">
        <motion.button
          onClick={() => setActiveTag(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md text-sm font-medium flex items-center gap-2 ${
            activeTag === null
            ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)] shadow-[0_0_20px_var(--accent-glow)]'
            : 'bg-[var(--glass-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
          }`}
        >
          <Filter size={14} /> 全部 ({posts.length})
        </motion.button>
        {allTags.map((tag) => (
          <motion.button
            key={tag.name}
            onClick={() => setActiveTag(tag.name === activeTag ? null : tag.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md text-sm font-medium flex items-center gap-2 ${
              activeTag === tag.name
              ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)] shadow-[0_0_20px_var(--accent-glow)]'
              : 'bg-[var(--glass-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
            }`}
          >
            <Tag size={14} /> {tag.name} ({tag.count})
          </motion.button>
        ))}
      </div>

      {/* Filtered Results */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, index) => (
            <ArticleCard
              key={post.id}
              post={post}
              index={index}
              onClick={() => onOpenPost(post.id)}
              layout="grid"
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 text-[var(--text-tertiary)]">
          该标签下未找到文章。
        </div>
      )}
    </motion.div>
  );
};

export const CategoriesView: React.FC<PageViewProps> = ({ onOpenPost, posts }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Dynamic Categories with counts
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    posts.forEach(post => {
      post.categories?.forEach(cat => {
        catMap.set(cat, (catMap.get(cat) || 0) + 1);
      });
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter(post => post.categories?.includes(activeCategory));
  }, [activeCategory, posts]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Categories Sidebar / Top Grid */}
        <div className="md:w-1/3 flex-shrink-0">
          <div className="sticky top-32">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">分类</h1>
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                onClick={() => setActiveCategory(null)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                  activeCategory === null
                  ? 'bg-[var(--glass-surface-hover)] border-[var(--accent-color)] shadow-[0_0_15px_var(--accent-glow)]'
                  : 'bg-[var(--glass-surface)] border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full transition-colors ${activeCategory === null ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]'}`}>
                    <Filter size={20} />
                  </div>
                  <span className={`text-lg font-bold ${activeCategory === null ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>查看全部</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-tertiary)] text-sm font-mono">{posts.length}</span>
              </motion.div>

              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                    activeCategory === cat.name
                    ? 'bg-[var(--glass-surface-hover)] border-[var(--accent-color)] shadow-[0_0_15px_var(--accent-glow)]'
                    : 'bg-[var(--glass-surface)] border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full transition-colors ${activeCategory === cat.name ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--glass-surface-hover)] text-[var(--accent-color)]'}`}>
                      <Folder size={20} />
                    </div>
                    <span className={`text-lg font-bold ${activeCategory === cat.name ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{cat.name}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-tertiary)] text-sm font-mono">{cat.count}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[var(--text-secondary)]">
              {activeCategory ? `${activeCategory} 下的文章` : '全部文章'}
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-color)] flex items-center gap-1"
              >
                <X size={14} /> 清除筛选
              </button>
            )}
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  index={index}
                  onClick={() => onOpenPost(post.id)}
                  layout="list"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const AboutView: React.FC = () => {
  const aboutContent = `# 关于我

你好！欢迎来到我的个人技术博客。

## 我是谁

我是一名热爱编程的开发者，喜欢探索新技术，分享开发经验。

## 技能领域

- 前端开发 (JavaScript, React, Vue)
- 后端开发 (Node.js, Python)
- 数据库 (MySQL, MongoDB)
- 云计算和部署

## 博客内容

这个博客主要记录：

-  **技术学习笔记**: 分享学习过程中的心得
-  **项目经验**: 记录实际开发中的问题和解决方案
-  **工具推荐**: 推荐好用的开发工具和资源
-  **生活感悟**: 分享一些技术之外的思考

## 联系方式

如果你对我的文章有任何疑问或建议，欢迎通过以下方式联系我：

- GitHub: [myki-jim](https://github.com/myki-jim)

## 版权声明

本博客所有文章采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议进行许可。

转载请注明出处和原作者！`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[40px] p-8 md:p-12 backdrop-blur-2xl">
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                h1: ({children}) => <h1 className="text-5xl font-extrabold text-[var(--text-primary)] mb-8">{children}</h1>,
                h2: ({children}) => <h2 className="text-3xl font-bold text-[var(--text-primary)] mt-12 mb-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4">{children}</h3>,
                p: ({children}) => <p className="mb-6 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
                li: ({children}) => <li className="text-[var(--text-secondary)]">{children}</li>,
                strong: ({children}) => <strong className="text-[var(--text-primary)] font-semibold">{children}</strong>,
                a: ({href, children}) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors">
                    {children}
                  </a>
                ),
              }}>
                {aboutContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="lg:w-[320px]">
          <Sidebar />
        </div>
      </motion.div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="w-full max-w-2xl mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--accent-color)] mb-6">
          <Mail size={32} />
        </div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)]">联系我</h1>
        <p className="text-[var(--text-secondary)] mt-4">有问题或建议？我很乐意听取您的反馈！</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-[40px] bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-xl">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">邮箱</h3>
          <p className="text-[var(--text-secondary)] mb-2">发邮件给我：</p>
          <a href="mailto:myki.jim@gmail.com" className="text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors">
            myki.jim@gmail.com
          </a>
        </div>

        <div className="p-6 rounded-[40px] bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-xl">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">GitHub</h3>
          <p className="text-[var(--text-secondary)] mb-2">查看我的代码和项目：</p>
          <a href="https://github.com/myki-jim" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors">
            github.com/myki-jim
          </a>
        </div>

        <div className="p-6 rounded-[40px] bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-xl">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">博客反馈</h3>
          <p className="text-[var(--text-secondary)]">
            发现有趣的内容或有改进建议？您的反馈能让这个博客变得更好！
          </p>
        </div>
      </div>
    </motion.div>
  );
};