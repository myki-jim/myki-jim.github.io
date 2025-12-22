import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from 'lucide-react';
import { Post } from '../../types';
import Sidebar from '../Sidebar';

interface PostViewProps {
  post: Post | undefined;
  onBack: () => void;
}

const PostView: React.FC<PostViewProps> = ({ post, onBack }) => {
  if (!post) return <div>Post not found</div>;

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
                <ArrowLeft size={18} /> Back to Feed
             </button>

             {/* Header */}
             <div className="mb-10">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase text-[var(--accent-color)] bg-[var(--glass-surface)] rounded-full border border-[var(--glass-border)]">
                  {post.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] leading-tight mb-6">
                   {post.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
                   <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
                   <span className="flex items-center gap-2"><Clock size={14} /> {post.readTime} Read</span>
                </div>
             </div>

             {/* Content */}
             <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[40px] p-8 md:p-12 backdrop-blur-2xl">
                <div className="prose prose-lg prose-invert max-w-none text-[var(--text-secondary)]">
                    <p className="lead text-xl text-[var(--text-primary)] mb-6 font-medium">{post.excerpt}</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4">The Physics of Glass</h3>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <div className="my-8 p-6 bg-[var(--glass-surface-hover)] rounded-2xl border-l-4 border-[var(--accent-color)] italic">
                        "Design is not just what it looks like and feels like. Design is how it works."
                    </div>
                     <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
                    </p>
                </div>

                {/* Interaction Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--glass-border)] flex items-center justify-between">
                    <div className="flex gap-2">
                        <button className="p-3 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-black transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-black transition-colors">
                            <Bookmark size={20} />
                        </button>
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