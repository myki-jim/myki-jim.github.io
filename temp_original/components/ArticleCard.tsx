import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, ArrowUpRight } from 'lucide-react';
import { Post } from '../types';

interface ArticleCardProps {
  post: Post;
  index: number;
  onClick: () => void;
  layout?: 'grid' | 'list';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, index, onClick, layout = 'list' }) => {
  const isGrid = layout === 'grid';

  return (
    <motion.article
      layout // Enable layout animation
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.4 } }}
      onClick={onClick}
      className={`group relative flex ${isGrid ? 'flex-col' : 'flex-col md:flex-row'} gap-6 p-5 sm:p-6 rounded-[32px] bg-[var(--glass-surface)] hover:bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] transition-colors duration-500 cursor-pointer overflow-hidden`}
      style={{
        backdropFilter: "blur(var(--glass-blur))",
      }}
    >
      {/* Subtle Glow on Hover */}
      <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-[var(--accent-glow)] to-transparent pointer-events-none z-0" />
      
      {/* Cover Image */}
      {post.coverImage && (
        <motion.div layout className={`relative z-10 overflow-hidden rounded-2xl flex-shrink-0 ${isGrid ? 'w-full aspect-video' : 'w-full md:w-48 lg:w-64 aspect-video md:aspect-[4/3]'} bg-black/20`}>
             <img 
               src={post.coverImage} 
               alt={post.title} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
             />
             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        </motion.div>
      )}

      {/* Content Container */}
      <motion.div layout className={`flex flex-col z-10 flex-1 ${!post.coverImage ? 'w-full' : ''}`}>
          {/* Top Meta */}
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[var(--accent-color)] bg-[var(--glass-surface-hover)] rounded-full border border-[var(--glass-border)]">
              {post.category}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">{post.date}</span>
          </div>

          {/* Title & Excerpt */}
          <div className="mb-4 flex-1">
            <h3 className={`font-semibold text-[var(--text-primary)] mb-3 leading-tight group-hover:text-[var(--accent-color)] transition-colors ${isGrid ? 'text-xl' : 'text-2xl'}`}>
              {post.title}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm line-clamp-2 group-hover:text-[var(--text-primary)] transition-colors">
              {post.excerpt}
            </p>
          </div>

          {/* Action Footer */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
            <div className="flex gap-4 text-xs font-medium text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={12} /> {post.views}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-color)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              Read <ArrowUpRight size={14} />
            </div>
          </div>
      </motion.div>
    </motion.article>
  );
};

export default ArticleCard;