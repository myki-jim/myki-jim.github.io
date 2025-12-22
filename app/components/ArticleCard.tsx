import React from 'react';
import { Clock, Eye, ArrowUpRight } from 'lucide-react';
import { Post } from './types';
import { format } from 'date-fns';

interface ArticleCardProps {
  post: Post;
  index: number;
  onClick: () => void;
  layout?: 'grid' | 'list';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, index, onClick, layout = 'list' }) => {
  const isGrid = layout === 'grid';

  // Format date
  const formattedDate = format(new Date(post.date), 'MMM dd, yyyy');
  // Calculate read time based on excerpt length or use default
  const wordCount = post.excerpt ? post.excerpt.split(' ').length : 200;
  const readTime = Math.ceil(wordCount / 200) + ' min';

  return (
    <div
      className={`group relative flex ${isGrid ? 'flex-col' : 'flex-col md:flex-row'} gap-6 p-5 sm:p-6 rounded-[32px] bg-[var(--glass-surface)] hover:bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] transition-all duration-500 cursor-pointer overflow-hidden transform hover:scale-[1.02]`}
      style={{
        backdropFilter: 'blur(var(--glass-blur))',
      }}
      onClick={onClick}
    >
      {/* Subtle Glow on Hover */}
      <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-[var(--accent-glow)] to-transparent pointer-events-none z-0" />

      {/* Cover Image */}
      {post.coverImage && (
        <div className={`relative z-10 overflow-hidden rounded-2xl flex-shrink-0 ${isGrid ? 'w-full aspect-video' : 'w-full md:w-48 lg:w-64 aspect-video md:aspect-[4/3]'} bg-black/20`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        </div>
      )}

      {/* Content Container */}
      <div className={`flex flex-col z-10 flex-1 ${!post.coverImage ? 'w-full' : ''}`}>
        {/* Top Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[var(--accent-color)] bg-[var(--glass-surface-hover)] rounded-full border border-[var(--glass-border)]">
            {post.categories[0] || 'Uncategorized'}
          </span>
          <span className="text-xs text-[var(--text-tertiary)] font-medium">{formattedDate}</span>
        </div>

        {/* Title & Excerpt */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-color)] transition-colors duration-300 leading-tight">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Bottom Meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--glass-border)]/50">
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={12} /> {post.views || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-color)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Read <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;