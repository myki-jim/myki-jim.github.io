import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from 'lucide-react';
import { Post } from './types';
import Sidebar from './Sidebar';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PostViewProps {
  post: Post | undefined;
  onBack: () => void;
}

const PostView: React.FC<PostViewProps> = ({ post, onBack }) => {
  if (!post) return <div>文章未找到</div>;

  // Calculate read time based on content
  const readTime = Math.ceil(post.content.split(' ').length / 200) + ' 分钟';
  const formattedDate = format(new Date(post.date), 'MMMM dd, yyyy');

  // Track current theme for syntax highlighting
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme !== 'light');
    };

    updateTheme();

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const syntaxTheme = isDarkMode ? oneDark : oneLight;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col lg:flex-row gap-12"
      >
        <div className="flex-1">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
          >
            <ArrowLeft size={18} /> 返回主页
          </button>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase text-[var(--accent-color)] bg-[var(--glass-surface)] rounded-full border border-[var(--glass-border)]">
              {post.categories[0] || '未分类'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-2"><Calendar size={14} /> {formattedDate}</span>
              <span className="flex items-center gap-2"><Clock size={14} /> {readTime} 阅读</span>
              {post.updated !== post.date && (
                <span className="flex items-center gap-2 opacity-60">
                  更新于 {format(new Date(post.updated), 'MMMM dd, yyyy')}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 text-xs bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] rounded-full border border-[var(--glass-border)]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[40px] p-8 md:p-12 backdrop-blur-2xl">
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)]">
              {post.excerpt && (
                <p className="lead text-xl text-[var(--text-primary)] mb-6 font-medium">
                  {post.excerpt}
                </p>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={syntaxTheme}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: 'var(--glass-surface-hover)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          margin: '1.5em 0',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={className}
                        style={{
                          backgroundColor: 'var(--glass-surface-hover)',
                          color: 'var(--text-primary)',
                          padding: '0.25em 0.5em',
                          borderRadius: '0.375rem',
                          fontSize: '0.875em',
                          fontWeight: '500',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote
                        style={{
                          borderLeft: '4px solid var(--accent-color)',
                          paddingLeft: '1.5rem',
                          margin: '1.5em 0',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        {children}
                      </blockquote>
                    )
                  },
                  img({ src, alt, ...props }) {
                    return (
                      <img
                        src={src}
                        alt={alt}
                        style={{
                          borderRadius: '1rem',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                          margin: '2em 0',
                          maxWidth: '100%',
                          height: 'auto',
                        }}
                        {...props}
                      />
                    )
                  },
                  hr() {
                    return (
                      <hr
                        style={{
                          border: 'none',
                          borderTop: '1px solid var(--glass-border)',
                          margin: '3em 0',
                        }}
                      />
                    )
                  },
                  table({ children }) {
                    return (
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          margin: '2em 0',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                        }}
                      >
                        {children}
                      </table>
                    )
                  },
                  th({ children }) {
                    return (
                      <th
                        style={{
                          border: '1px solid var(--glass-border)',
                          padding: '0.75rem',
                          textAlign: 'left',
                          backgroundColor: 'var(--glass-surface-hover)',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                        }}
                      >
                        {children}
                      </th>
                    )
                  },
                  td({ children }) {
                    return (
                      <td
                        style={{
                          border: '1px solid var(--glass-border)',
                          padding: '0.75rem',
                          textAlign: 'left',
                        }}
                      >
                        {children}
                      </td>
                    )
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Interaction Bar */}
            <div className="mt-12 pt-8 border-t border-[var(--glass-border)] flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        url: post.path,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.origin + post.path);
                    }
                  }}
                  className="p-3 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-black transition-colors"
                  title="分享"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => alert('书签功能即将推出！')}
                  className="p-3 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-black transition-colors"
                  title="书签"
                >
                  <Bookmark size={20} />
                </button>
              </div>

              <div className="text-xs text-[var(--text-tertiary)]">
                作者：{post.author}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[320px] flex-shrink-0">
          <Sidebar />
        </div>
      </motion.div>
    </div>
  );
};

export default PostView;