import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, X, Command, Menu, Sun, Moon, MoreHorizontal, ChevronRight } from 'lucide-react';

// Types for our blog data
export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated: string;
  categories: string[];
  tags: string[];
  layout: string;
  excerpt: string;
  content: string;
  author: string;
  path: string;
}

export type PageType = 'home' | 'post' | 'tags' | 'categories' | 'about' | 'contact';

interface MagicNavbarProps {
  onNavigate: (page: PageType, id?: string) => void;
  activePage: PageType;
  posts?: Post[];
}

const MagicNavbar: React.FC<MagicNavbarProps> = ({ onNavigate, activePage, posts = [] }) => {
  const { scrollY } = useScroll();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isFloatingSearchOpen, setIsFloatingSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Morphing Config ---
  const isHome = activePage === 'home';
  const threshold = isHome ? 250 : 1;
  const HERO_SEARCH_TOP = isHome ? 280 : 0;

  // Transforms
  const top = useTransform(scrollY, [0, threshold], isHome ? [HERO_SEARCH_TOP, 0] : [0, 0]);
  const width = useTransform(scrollY, [0, threshold], isHome ? ['min(66%, 380px)', '100%'] : ['100%', '100%']);
  const borderRadius = useTransform(scrollY, [0, threshold], isHome ? [30, 0] : [0, 0]);
  const height = useTransform(scrollY, [0, threshold], isHome ? [60, 80] : [80, 80]);
  const glassOpacity = useTransform(scrollY, [0, threshold], isHome ? [0.4, 0.9] : [0.9, 0.9]);
  const glassBlurValue = useTransform(scrollY, [0, threshold], isHome ? [15, 50] : [50, 50]);

  // Content Visibility
  const heroInputOpacity = useTransform(scrollY, [0, Math.max(threshold - 50, 0.1)], isHome ? [1, 0] : [0, 0]);
  const navContentOpacity = useTransform(scrollY, [Math.max(threshold - 50, 0), threshold], isHome ? [0, 1] : [1, 1]);

  const heroInputPointerEvents = useTransform(scrollY, v => (isHome && v < threshold - 50) ? 'auto' : 'none');
  const finalNavPointerEvents = useTransform(navContentOpacity, v => v > 0.5 ? 'auto' : 'none');

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = posts.filter(post =>
      (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (post.categories?.[0]?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setSearchResults(results);
  }, [searchQuery, posts]);

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks: { label: string; id: PageType }[] = [
    { label: '主页', id: 'home' },
    { label: '标签', id: 'tags' },
    { label: '分类', id: 'categories' },
    { label: '关于', id: 'about' },
    { label: '联系', id: 'contact' },
  ];

  return (
    <>
      <motion.nav
        className="fixed z-50 left-1/2 -translate-x-1/2 flex items-center justify-center overflow-visible shadow-2xl shadow-black/5"
        style={{
          width: isHome ? width : '100%',
          top,
          height,
          borderRadius: isHome ? borderRadius : 0,
          background: useTransform(glassOpacity, (val) => `rgba(var(--bg-main-rgb), ${val})`),
          backgroundColor: 'var(--glass-surface)',
          borderColor: 'var(--glass-border)',
          borderWidth: '1px',
          backdropFilter: useTransform(glassBlurValue, (val) => `blur(${val}px) saturate(180%)`),
        }}
      >
        <div className="w-full h-full relative max-w-7xl mx-auto px-6 flex items-center justify-between" ref={navbarRef}>

            {/* --- STATE 1: HERO SEARCH INPUT (Initial - Home Only) --- */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center px-4"
                style={{ opacity: heroInputOpacity, pointerEvents: heroInputPointerEvents }}
            >
                <div className="w-full h-full flex items-center relative group">
                    <Search className="absolute left-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索..."
                        className="flex-1 min-w-0 bg-transparent text-[var(--text-primary)] text-lg placeholder-[var(--text-tertiary)] focus:outline-none pl-12 pr-4 font-light"
                    />

                    {/* Visual Separator */}
                    <div className="h-6 w-[1px] bg-[var(--text-tertiary)] opacity-20 mx-2 flex-shrink-0" />

                    {/* More Button (Initial State) */}
                    <button
                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                        className={`p-2 rounded-full transition-all active:scale-95 flex-shrink-0 ${isMoreMenuOpen ? 'bg-[var(--glass-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)]'}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {/* Inline Results for Hero Search */}
                    <AnimatePresence>
                        {searchQuery && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                className="absolute top-[calc(100%+12px)] left-0 right-0 rounded-2xl overflow-hidden shadow-2xl z-[60] max-h-[400px] overflow-y-auto custom-scrollbar"
                                style={{
                                    backgroundColor: "rgba(var(--bg-main-rgb), 0.95)",
                                    backdropFilter: "blur(60px) saturate(200%)",
                                    WebkitBackdropFilter: "blur(60px) saturate(200%)",
                                    border: "1px solid var(--glass-border)"
                                }}
                            >
                                <div className="p-2">
                                  {searchResults.map((post) => (
                                      <div key={post.id} onClick={() => onNavigate('post', post.id)} className="flex items-center gap-3 p-3 hover:bg-[var(--glass-surface-hover)] transition-colors rounded-xl cursor-pointer group">
                                          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--glass-surface)] border border-[var(--glass-border)]">
                                            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] bg-[var(--glass-surface)]">
                                                <div className="w-4 h-4 rounded-full bg-[var(--accent-color)] opacity-20" />
                                            </div>
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="text-[var(--text-primary)] font-medium text-sm group-hover:text-[var(--accent-color)] transition-colors truncate pr-2">{post.title}</div>
                                                <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] border border-[var(--glass-border)] px-1 py-0.5 rounded flex-shrink-0">{post.categories[0] || 'Uncategorized'}</span>
                                            </div>
                                            <div className="text-[var(--text-secondary)] text-[11px] mt-0.5 line-clamp-1">{post.excerpt}</div>
                                          </div>
                                      </div>
                                  ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* --- STATE 2: DOCKED NAVBAR CONTENT --- */}
            <motion.div
                className="w-full h-full flex items-center justify-between"
                style={{ opacity: navContentOpacity, pointerEvents: finalNavPointerEvents }}
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                    <img
                        src="https://github.com/myki-jim.png"
                        alt="Jimmy Ki's Avatar"
                        className="w-8 h-8 rounded-full border-2 border-[var(--glass-border)] shadow-lg group-hover:scale-110 transition-transform duration-300 object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                        }}
                    />
                    <div
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform duration-300 hidden"
                        style={{ display: 'none' }}
                    />
                    <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">Jimmy Ki</span>
                </div>

                {/* Center: Navigation (Desktop) - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activePage === link.id
                                ? 'bg-[var(--glass-surface-hover)] text-[var(--text-primary)] shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)]'
                            }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setIsFloatingSearchOpen(true)}
                        className="p-2 rounded-full hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all active:scale-95"
                    >
                        <Search size={22} />
                    </button>

                    {/* Theme Toggle Button (Docked State) */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-all active:scale-95 text-[var(--text-secondary)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--accent-color)]"
                        title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
                    >
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                </div>
            </motion.div>

            {/* SHARED MORE MENU DROPDOWN */}
            <AnimatePresence>
                {isMoreMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                        className="absolute top-[calc(100%+12px)] right-6 w-56 rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-2xl z-[70]"
                        style={{
                            backgroundColor: "rgba(var(--bg-main-rgb), 0.95)",
                            backdropFilter: "blur(60px) saturate(200%)",
                            WebkitBackdropFilter: "blur(60px) saturate(200%)",
                        }}
                    >
                        <div className="p-2 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        onNavigate(link.id);
                                        setIsMoreMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-left text-sm font-medium text-[var(--text-primary)] transition-colors"
                                >
                                    {link.label}
                                    {activePage === link.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />}
                                </button>
                            ))}
                            <div className="h-[1px] bg-[var(--glass-border)] my-1 mx-2" />
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setIsMoreMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-left text-sm font-medium text-[var(--text-primary)] transition-colors"
                            >
                                <span>外观</span>
                                <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs">
                                    {theme === 'dark' ? '深色' : '浅色'}
                                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.nav>

      {/* --- FLOATING SEARCH OVERLAY --- */}
      <AnimatePresence>
        {isFloatingSearchOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    onClick={() => setIsFloatingSearchOpen(false)}
                    className="absolute inset-0 bg-black/40"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    className="relative w-full max-w-2xl bg-[var(--bg-main)]/90 border border-[var(--glass-border)] rounded-3xl shadow-2xl overflow-hidden"
                    style={{ backdropFilter: "blur(var(--glass-blur)) saturate(200%)" }}
                >
                    <div className="flex items-center p-6 border-b border-[var(--glass-border)]">
                        <Search className="text-[var(--accent-color)] mr-4" size={24} />
                        <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="flex-1 bg-transparent text-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
                        />
                        <button onClick={() => setIsFloatingSearchOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                         {searchQuery && searchResults.length === 0 && (
                            <div className="p-8 text-center text-[var(--text-tertiary)]">
                                未找到结果
                            </div>
                        )}
                        {searchResults.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => {
                                    onNavigate('post', post.id);
                                    setIsFloatingSearchOpen(false);
                                }}
                                className="flex items-center gap-4 p-4 hover:bg-[var(--glass-surface-hover)] rounded-xl transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-[var(--glass-surface)] overflow-hidden flex-shrink-0">
                                    <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                                        <div className="w-4 h-4 rounded-full bg-[var(--accent-color)] opacity-20" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-color)] transition-colors">{post.title}</h4>
                                    <p className="text-[var(--text-secondary)] text-sm">{post.excerpt?.substring(0, 60)}...</p>
                                </div>
                                <span className="text-[var(--text-tertiary)]">→</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MagicNavbar;