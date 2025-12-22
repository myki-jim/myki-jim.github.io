import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Folder, Mail, Send, Filter, X } from 'lucide-react';
import Sidebar from '../Sidebar';
import ArticleCard from '../ArticleCard';
import { MOCK_POSTS } from '../../constants';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)' }
};

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

interface PageViewProps {
    onOpenPost: (id: string) => void;
}

export const TagsView: React.FC<PageViewProps> = ({ onOpenPost }) => {
    const [activeTag, setActiveTag] = useState<string | null>(null);

    // Extract all unique tags from posts
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        MOCK_POSTS.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    const filteredPosts = useMemo(() => {
        if (!activeTag) return MOCK_POSTS;
        return MOCK_POSTS.filter(post => post.tags?.includes(activeTag));
    }, [activeTag]);

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Explore by Tags</h1>
                <p className="text-[var(--text-secondary)]">Filter articles by topic.</p>
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
                   <Filter size={14} /> All
                </motion.button>
                {allTags.map((tag) => (
                    <motion.button
                        key={tag}
                        onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md text-sm font-medium flex items-center gap-2 ${
                            activeTag === tag
                            ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)] shadow-[0_0_20px_var(--accent-glow)]'
                            : 'bg-[var(--glass-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                        }`}
                    >
                        <Tag size={14} /> {tag}
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
                     No articles found for this tag.
                 </div>
            )}
        </motion.div>
    );
};

export const CategoriesView: React.FC<PageViewProps> = ({ onOpenPost }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Dynamic Categories with counts
    const categories = useMemo(() => {
        const catMap = new Map<string, number>();
        MOCK_POSTS.forEach(post => {
            const c = post.category;
            catMap.set(c, (catMap.get(c) || 0) + 1);
        });
        return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
    }, []);

    const filteredPosts = useMemo(() => {
        if (!activeCategory) return MOCK_POSTS;
        return MOCK_POSTS.filter(post => post.category === activeCategory);
    }, [activeCategory]);

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Categories Sidebar / Top Grid */}
                <div className="md:w-1/3 flex-shrink-0">
                     <div className="sticky top-32">
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Categories</h1>
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
                                    <span className={`text-lg font-bold ${activeCategory === null ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>View All</span>
                                </div>
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
                            {activeCategory ? `Posts in ${activeCategory}` : 'All Posts'}
                        </h2>
                        {activeCategory && (
                            <button 
                                onClick={() => setActiveCategory(null)}
                                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-color)] flex items-center gap-1"
                            >
                                <X size={14} /> Clear Filter
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
                                    layout="list" // Use list layout for categories view to differentiate
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
    return (
        <div className="w-full max-w-7xl mx-auto px-4 pt-32 pb-20">
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition} className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <h1 className="text-5xl font-extrabold text-[var(--text-primary)] mb-8">About Me</h1>
                    <div className="prose prose-lg prose-invert text-[var(--text-secondary)]">
                        <p className="text-xl text-[var(--text-primary)] leading-relaxed">
                            I am a User Interface Engineer obsessed with the physics of digital objects.
                        </p>
                        <p>
                            Currently working at the intersection of design and engineering, creating fluid, non-linear interactions for the web of tomorrow. 
                            My philosophy is that interfaces should not just be looked at, but "felt".
                        </p>
                        <div className="grid grid-cols-2 gap-4 my-8">
                             <div className="p-4 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)]">
                                <h3 className="font-bold text-[var(--text-primary)]">Frontend</h3>
                                <p className="text-sm">React, Three.js, WebGL</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)]">
                                <h3 className="font-bold text-[var(--text-primary)]">Design</h3>
                                <p className="text-sm">Figma, Motion, 3D</p>
                             </div>
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
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">Get in Touch</h1>
                <p className="text-[var(--text-secondary)] mt-4">Have a project in mind? Let's build something liquid.</p>
             </div>

             <form className="flex flex-col gap-6 p-8 rounded-[40px] bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-xl">
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Name</label>
                    <input type="text" className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
                    <input type="email" className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Message</label>
                    <textarea rows={4} className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors" placeholder="Tell me about your idea..."></textarea>
                </div>
                <button type="button" className="mt-4 w-full py-4 rounded-xl bg-[var(--accent-color)] text-black font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Send Message <Send size={20} />
                </button>
             </form>
        </motion.div>
    );
};