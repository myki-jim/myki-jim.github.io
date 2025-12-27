import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from 'lucide-react';
import { Post, BlogData } from './types';
import Sidebar from './Sidebar';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MediaLightbox from './MediaLightbox';

interface PostViewProps {
  post: Post | undefined;
  onBack: () => void;
  blogData?: BlogData;
}

const PostView: React.FC<PostViewProps> = ({ post, onBack, blogData }) => {
  if (!post) return <div>文章未找到</div>;

  // Calculate read time based on content
  const readTime = Math.ceil(post.content.split(' ').length / 200) + ' 分钟';
  const formattedDate = format(new Date(post.date), 'MMMM dd, yyyy');

  // Track current theme for syntax highlighting
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Image/Video lightbox state
  const [lightboxMedia, setLightboxMedia] = useState<{ src: string; alt: string; type: 'image' | 'video' } | null>(null);

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

  const handleImageClick = (src: string, alt: string) => {
    setLightboxMedia({ src, alt, type: 'image' });
  };

  const handleVideoClick = (src: string, alt: string) => {
    setLightboxMedia({ src, alt, type: 'video' });
  };

  const closeLightbox = () => {
    setLightboxMedia(null);
  };

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
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] leading-tight mb-6 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
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
                rehypePlugins={[rehypeRaw]}
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
                        loading="lazy"
                        decoding="async"
                        onClick={() => handleImageClick(src, alt || '')}
                        style={{
                          borderRadius: '1rem',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                          margin: '2em 0',
                          maxWidth: '100%',
                          height: 'auto',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        sizes="(max-width: 768px) 100vw, 80vw"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        {...props}
                      />
                    )
                  },
                  video({ src, poster, ...props }) {
                    if (!src) return null;

                    return (
                      <div
                        className="video-container my-8 relative rounded-xl overflow-hidden shadow-lg cursor-pointer group"
                        onClick={() => handleVideoClick(src, alt || '视频')}
                      >
                        <video
                          src={src}
                          poster={poster}
                          controls={false}
                          preload="metadata"
                          className="w-full block"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            colorPrimaries: 'bt2020',
                            transferCharacteristics: 'smpte2084',
                            matrixCoefficients: 'bt2020-ncl',
                          } as React.CSSProperties}
                        />
                        {/* HDR Badge */}
                        <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/90 text-white text-xs rounded backdrop-blur-sm z-10">
                          HDR
                        </div>
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors z-5">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
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
          <Sidebar blogData={blogData} />
        </div>
      </motion.div>

      {/* Media Lightbox (Image & Video) */}
      {lightboxMedia && (
        <MediaLightbox
          src={lightboxMedia.src}
          alt={lightboxMedia.alt}
          type={lightboxMedia.type}
          isOpen={!!lightboxMedia}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default PostView;