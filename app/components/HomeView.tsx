import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import ArticleCard from './ArticleCard';
import Sidebar from './Sidebar';
import { Post, BlogData } from './types';

interface HomeViewProps {
  onOpenPost: (id: string) => void;
  posts: Post[];
  blogData?: any;
}

type LayoutMode = 'list' | 'grid';

const HomeView: React.FC<HomeViewProps> = ({ onOpenPost, posts, blogData }) => {
  const [layout, setLayout] = useState<LayoutMode>('list');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-[450px]"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 opacity-60">
              <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">Latest Articles</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--glass-border)] to-transparent" />
            </div>

            {/* Layout Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--glass-surface)] border border-[var(--glass-border)]">
              <button
                onClick={() => setLayout('list')}
                className={`p-2 rounded-md transition-all ${layout === 'list' ? 'bg-[var(--glass-surface-hover)] text-[var(--accent-color)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setLayout('grid')}
                className={`p-2 rounded-md transition-all ${layout === 'grid' ? 'bg-[var(--glass-surface-hover)] text-[var(--accent-color)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={layout}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
            >
              {posts.map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  index={index}
                  onClick={() => onOpenPost(post.id)}
                  layout={layout}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button - can be implemented later */}
          {posts.length > 0 && (
            <div className="mt-20 flex justify-center">
              <div className="text-xs text-[var(--text-tertiary)] text-center">
                End of articles • {posts.length} total
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 relative">
          <Sidebar blogData={blogData} />
        </div>
      </div>
    </motion.div>
  );
};

export default HomeView;