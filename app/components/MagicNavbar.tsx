import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, X, Sun, Moon, MoreHorizontal, FileText, Hash, Folder, Wrench, Home, User, Mail } from 'lucide-react';
import { SearchResultSkeleton } from './SkeletonLoaders';

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

export type PageType = 'home' | 'post' | 'tags' | 'categories' | 'about' | 'contact' | 'tools';

interface MagicNavbarProps {
  onNavigate: (page: PageType, id?: string) => void;
  activePage: PageType;
  posts?: Post[];
  blogData?: any;
}

// Search result types
type SearchResultType = 'post' | 'page' | 'tool' | 'tag' | 'category';

interface SearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  excerpt?: string;
  url?: string;
  onClick: () => void;
  highlightedContent?: string; // Content with highlighted matches
  matchedTags?: string[]; // Matched tags for this result
}

// Helper function to extract text snippet and highlight matches
const extractSnippet = (text: string, query: string, maxLength: number = 120): string => {
  if (!text) return '';

  // Remove HTML tags and clean up whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (!cleanText) return '';

  const lowerText = cleanText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    // Return first part if no match
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  }

  // Extract context around the match (40 chars before and after)
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(cleanText.length, matchIndex + query.length + 40);
  let snippet = cleanText.substring(start, end);

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < cleanText.length) snippet = snippet + '...';

  // Highlight the match
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return snippet.replace(regex, '<mark class="bg-[var(--accent-color)]/30 text-[var(--accent-color)] px-0.5 rounded">$1</mark>');
};

const MagicNavbar: React.FC<MagicNavbarProps> = ({ onNavigate, activePage, posts = [], blogData }) => {
  const { scrollY } = useScroll();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get button position for animation
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });

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

  // Global keyboard shortcut for search (Ctrl/Cmd + F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        openSearch();
      }
      if (event.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // --- Morphing Config ---
  const isHome = activePage === 'home';
  const threshold = isHome ? 250 : 1;
  const HERO_SEARCH_TOP = isHome ? 280 : 0;

  // Transforms
  const top = useTransform(scrollY, [0, threshold], isHome ? [HERO_SEARCH_TOP, 0] : [0, 0]);
  const width = useTransform(scrollY, [0, threshold], isHome ? ['min(50%, 380px)', '100%'] : ['100%', '100%']);
  const borderRadius = useTransform(scrollY, [0, threshold], isHome ? [30, 0] : [0, 0]);
  const height = useTransform(scrollY, [0, threshold], isHome ? [60, 80] : [80, 80]);
  const glassOpacity = useTransform(scrollY, [0, threshold], isHome ? [0.4, 0.9] : [0.9, 0.9]);
  const glassBlurValue = useTransform(scrollY, [0, threshold], isHome ? [15, 50] : [50, 50]);

  // Content Visibility
  const heroInputOpacity = useTransform(scrollY, [0, Math.max(threshold - 50, 0.1)], isHome ? [1, 0] : [0, 0]);
  const navContentOpacity = useTransform(scrollY, [Math.max(threshold - 50, 0), threshold], isHome ? [0, 1] : [1, 1]);

  const heroInputPointerEvents = useTransform(scrollY, v => (isHome && v < threshold - 50) ? 'auto' : 'none');
  const finalNavPointerEvents = useTransform(navContentOpacity, v => v > 0.5 ? 'auto' : 'none');

  // Open search and capture button position
  const openSearch = useCallback(() => {
    if (searchButtonRef.current) {
      const rect = searchButtonRef.current.getBoundingClientRect();
      setButtonPosition({ top: rect.top, left: rect.left, width: rect.width });
    }
    setIsSearchOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Handle search filtering - all content types with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Show loading state
    setIsSearching(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

    // Search posts
    posts.filter(post => {
      const titleMatch = (post.title?.toLowerCase() || '').includes(query);
      const categoryMatch = (post.categories?.[0]?.toLowerCase() || '').includes(query);
      const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(query));
      const excerptMatch = (post.excerpt?.toLowerCase() || '').includes(query);

      // Clean HTML from content before searching
      const cleanContent = post.content
        ?.replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() || '';
      const contentMatch = cleanContent.includes(query);

      return titleMatch || categoryMatch || tagMatch || excerptMatch || contentMatch;
    }).forEach(post => {
      // Find matched tags
      const matchedTags = post.tags.filter(tag => tag.toLowerCase().includes(query));

      // Extract highlighted content from best match
      let highlightedContent = '';
      const titleMatch = (post.title?.toLowerCase() || '').includes(query);
      const excerptMatch = (post.excerpt?.toLowerCase() || '').includes(query);

      // Clean HTML from content before checking
      const cleanContent = post.content
        ?.replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() || '';
      const contentMatch = cleanContent.includes(query);

      if (titleMatch) {
        highlightedContent = extractSnippet(post.title, searchQuery);
      } else if (excerptMatch) {
        highlightedContent = extractSnippet(post.excerpt || '', searchQuery);
      } else if (contentMatch) {
        highlightedContent = extractSnippet(post.content || '', searchQuery);
      }

      results.push({
        id: post.id,
        title: post.title,
        type: 'post',
        excerpt: post.excerpt,
        highlightedContent,
        matchedTags,
        onClick: () => {
          onNavigate('post', post.id);
          closeSearch();
        }
      });
    });

    // Search pages (static pages)
    const pages = [
      { label: '主页', id: 'home', icon: Home, desc: '返回首页' },
      { label: '关于', id: 'about', icon: User, desc: '了解更多关于我' },
      { label: '联系', id: 'contact', icon: Mail, desc: '联系方式' },
    ];

    pages.filter(page =>
      page.label.toLowerCase().includes(query) ||
      page.desc.toLowerCase().includes(query)
    ).forEach(page => {
      results.push({
        id: page.id,
        title: page.label,
        type: 'page',
        excerpt: page.desc,
        onClick: () => {
          onNavigate(page.id as PageType);
          closeSearch();
        }
      });
    });

    // Search tags
    const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));
    allTags.filter(tag => tag.toLowerCase().includes(query)).forEach(tag => {
      results.push({
        id: tag,
        title: tag,
        type: 'tag',
        excerpt: `查看 "${tag}" 标签下的所有文章`,
        onClick: () => {
          window.location.href = `/tags/#${tag}`;
          closeSearch();
        }
      });
    });

    // Search categories
    const allCategories = Array.from(new Set(posts.flatMap(p => p.categories)));
    allCategories.filter(cat => cat.toLowerCase().includes(query)).forEach(category => {
      results.push({
        id: category,
        title: category,
        type: 'category',
        excerpt: `查看 "${category}" 分类下的所有文章`,
        onClick: () => {
          window.location.href = `/categories/#${category}`;
          closeSearch();
        }
      });
    });

    // Search tools (if available)
    const tools = [
      { label: '正则表达式测试器', slug: 'regex', desc: '测试和验证正则表达式' },
      { label: 'Hash 生成器', slug: 'hash', desc: 'MD5, SHA1, SHA256 等哈希生成' },
      { label: 'Base64 编解码', slug: 'encoder', desc: 'Base64 编码和解码工具' },
      { label: 'JSON 格式化', slug: 'json', desc: 'JSON 格式化和验证' },
      { label: 'UUID 生成器', slug: 'uuid', desc: '生成各种版本的 UUID' },
      { label: '密码生成器', slug: 'password', desc: '生成安全的随机密码' },
      { label: 'Markdown 编辑器', slug: 'markdown', desc: 'Markdown 实时预览编辑器' },
      { label: '密钥生成器', slug: 'keygen', desc: '生成各种加密密钥' },
      { label: '二维码生成器', slug: 'qrcode', desc: '生成二维码图片' },
      { label: 'Mermaid 图表', slug: 'mermaid', desc: 'Mermaid 流程图绘制' },
      { label: 'UML 编辑器', slug: 'uml', desc: 'UML 类图编辑器' },
      { label: '2048 游戏', slug: '2048', desc: '经典 2048 益智游戏' },
    ];

    tools.filter(tool =>
      tool.label.toLowerCase().includes(query) ||
      tool.desc.toLowerCase().includes(query)
    ).forEach(tool => {
      results.push({
        id: tool.slug,
        title: tool.label,
        type: 'tool',
        excerpt: tool.desc,
        onClick: () => {
          window.location.href = `/tools/${tool.slug}`;
          closeSearch();
        }
      });
    });

    setSearchResults(results.slice(0, 20)); // Limit to 20 results
    setIsSearching(false);
  }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, posts, onNavigate, closeSearch]);

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
    { label: '工具箱', id: 'tools' },
    { label: '关于', id: 'about' },
    { label: '联系', id: 'contact' },
  ];

  // Get icon for result type
  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case 'post': return FileText;
      case 'page': return Home;
      case 'tool': return Wrench;
      case 'tag': return Hash;
      case 'category': return Folder;
      default: return Search;
    }
  };

  // Get type label
  const getTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'post': return '文章';
      case 'page': return '页面';
      case 'tool': return '工具';
      case 'tag': return '标签';
      case 'category': return '分类';
      default: return '';
    }
  };

  // Get type color
  const getTypeColor = (type: SearchResultType) => {
    switch (type) {
      case 'post': return 'text-cyan-400';
      case 'page': return 'text-blue-400';
      case 'tool': return 'text-green-400';
      case 'tag': return 'text-purple-400';
      case 'category': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

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

            {/* --- STATE 1: HERO SEARCH BUTTON (Initial - Home Only) --- */}
            <motion.div
                className="absolute inset-0 flex items-center px-6"
                style={{ opacity: heroInputOpacity, pointerEvents: heroInputPointerEvents }}
            >
                <div className="w-full h-full flex items-center relative group">
                    {/* Search Button - preserves original input styling */}
                    <div
                        ref={searchButtonRef}
                        onClick={openSearch}
                        className="flex-1 h-full flex items-center relative group cursor-pointer"
                    >
                        <Search className="absolute left-0 text-[var(--text-tertiary)] group-hover:text-[var(--accent-color)] transition-colors" size={20} />
                        <span className="flex-1 min-w-0 bg-transparent text-[var(--text-tertiary)] text-lg font-light pl-8 pr-4 truncate">
                            搜索...
                        </span>

                        {/* Keyboard shortcut hint - subtle */}
                        <div className="hidden sm:flex items-center gap-1 text-[var(--text-tertiary)] opacity-40 text-xs">
                            <span>⌘</span>
                            <span>F</span>
                        </div>
                    </div>

                    {/* Visual Separator */}
                    <div className="h-6 w-[1px] bg-[var(--text-tertiary)] opacity-20 mx-2 flex-shrink-0" />

                    {/* More Button (Initial State) */}
                    <button
                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                        className={`p-2 rounded-full transition-all active:scale-95 flex-shrink-0 ${isMoreMenuOpen ? 'bg-[var(--glass-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)]'}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>
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
                        src="/images/avatar.png"
                        alt="Jimmy Ki's Avatar"
                        className="w-8 h-8 rounded-full border-2 border-[var(--glass-border)] shadow-lg group-hover:scale-110 transition-transform duration-300 object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://github.com/myki-jim.png";
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
                        onClick={openSearch}
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
                        className="absolute top-[calc(100%+12px)] right-6 w-56 rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl z-[70]"
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
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[var(--glass-surface-hover)] text-left text-sm font-medium text-[var(--text-primary)] transition-colors"
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
                                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-[var(--glass-surface-hover)] text-left text-sm font-medium text-[var(--text-primary)] transition-colors"
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

      {/* --- GLOBAL SEARCH OVERLAY (iOS Style) --- */}
      <AnimatePresence>
        {isSearchOpen && (
            <>
                {/* Backdrop with blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={closeSearch}
                    className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-xl"
                    style={{ WebkitBackdropFilter: 'blur(20px)' }}
                />

                {/* Search Modal */}
                <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        className="relative w-full max-w-3xl pointer-events-auto rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden"
                        style={{
                            background: 'var(--glass-surface)',
                            backdropFilter: 'blur(100px) saturate(200%)',
                            WebkitBackdropFilter: 'blur(100px) saturate(200%)',
                        }}
                    >
                        <div className="overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-4 p-6 border-b border-[var(--glass-border)]">
                                <Search className="text-[var(--accent-color)] flex-shrink-0" size={24} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="搜索文章、页面、工具、标签..."
                                    className="flex-1 bg-transparent text-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none font-light"
                                />
                                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                                  <kbd className="text-xs font-medium text-[var(--text-tertiary)]">ESC</kbd>
                                </div>
                                <button
                                    onClick={closeSearch}
                                    className="p-2 rounded-full hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search Results */}
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-4">
                                {!searchQuery && (
                                    <div className="py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--glass-surface-hover)] mb-4">
                                            <Search className="text-[var(--text-tertiary)]" size={32} />
                                        </div>
                                        <p className="text-[var(--text-secondary)] text-lg mb-2">开始搜索</p>
                                        <p className="text-[var(--text-tertiary)] text-sm">输入关键词搜索文章、页面、工具、标签等</p>
                                    </div>
                                )}

                                {/* Loading Skeleton */}
                                {isSearching && searchQuery && (
                                    <div className="space-y-2">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <SearchResultSkeleton key={`skeleton-${index}`} />
                                        ))}
                                    </div>
                                )}

                                {!isSearching && searchQuery && searchResults.length === 0 && (
                                    <div className="py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--glass-surface-hover)] mb-4">
                                            <X className="text-[var(--text-tertiary)]" size={32} />
                                        </div>
                                        <p className="text-[var(--text-secondary)] text-lg mb-2">未找到结果</p>
                                        <p className="text-[var(--text-tertiary)] text-sm">试试其他关键词</p>
                                    </div>
                                )}

                                {searchQuery && searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        {searchResults.map((result, index) => {
                                            const Icon = getResultIcon(result.type);
                                            return (
                                                <motion.div
                                                    key={result.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    onClick={result.onClick}
                                                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[var(--glass-surface-hover)] transition-all duration-200 cursor-pointer group"
                                                >
                                                    <div className={`p-3 rounded-xl bg-[var(--glass-surface-hover)] ${getTypeColor(result.type)} flex-shrink-0`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-[var(--text-primary)] font-semibold text-sm group-hover:text-[var(--accent-color)] transition-colors truncate">
                                                                {result.title}
                                                            </h4>
                                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${getTypeColor(result.type)} bg-opacity-20 border border-[var(--glass-border)]`}>
                                                                {getTypeLabel(result.type)}
                                                            </span>
                                                            {/* Matched tags */}
                                                            {result.matchedTags && result.matchedTags.length > 0 && (
                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    {result.matchedTags.slice(0, 2).map(tag => (
                                                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] border border-[var(--accent-color)]/30 whitespace-nowrap">
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                    {result.matchedTags.length > 2 && (
                                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--glass-surface-hover)] text-[var(--text-tertiary)] border border-[var(--glass-border)] whitespace-nowrap">
                                                                            +{result.matchedTags.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Highlighted content - single line */}
                                                        <p className="text-[var(--text-secondary)] text-xs truncate" dangerouslySetInnerHTML={{ __html: result.highlightedContent || result.excerpt || '' }} />
                                                    </div>
                                                    <div className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
                                                        →
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer with keyboard hints */}
                            {searchQuery && searchResults.length > 0 && (
                                <div className="px-6 py-3 border-t border-[var(--glass-border)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                                    <span>找到 {searchResults.length} 个结果</span>
                                    <div className="flex items-center gap-3">
                                        <span>按 <kbd className="px-1.5 py-0.5 rounded bg-[var(--glass-surface-hover)]">ESC</kbd> 关闭</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MagicNavbar;
