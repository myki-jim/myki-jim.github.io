'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LiquidBackground from './components/LiquidBackground';
import MagicNavbar from './components/MagicNavbar';
import HeroTitle from './components/HeroTitle';
import HomeView from './components/HomeView';
import PostView from './components/PostView';
import { TagsView, CategoriesView, AboutView, ContactView } from './components/PageViews';
import { Post, BlogData, PageType } from './components/types';

type PageType = 'home' | 'post' | 'tags' | 'categories' | 'about' | 'contact' | 'tools';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Load blog data on mount
  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      const response = await fetch('/data/index.json');
      if (response.ok) {
        const data = await response.json();
        setBlogData(data);
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: PageType, id?: string) => {
    if (page === 'post' && id) {
      // Navigate to dynamic route
      window.location.href = `/${id}`;
    } else if (page === 'tags') {
      window.location.href = '/tags';
    } else if (page === 'categories') {
      window.location.href = '/categories';
    } else if (page === 'tools') {
      window.location.href = '/tools';
    } else if (page === 'about') {
      window.location.href = '/about';
    } else {
      // Handle in-page navigation for home
      if (id) {
        setActivePostId(id);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentPage(page);
    }
  };

  const getPostById = (id: string | null): Post | undefined => {
    if (!id || !blogData) return undefined;
    return blogData.posts.find(p => p.id === id);
  };

  const renderPage = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-main)]">
          <div className="text-2xl text-[var(--text-primary)]">加载中...</div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomeView onOpenPost={(id) => handleNavigate('post', id)} posts={posts} blogData={blogData || undefined} />;
      case 'post':
        return <PostView post={getPostById(activePostId)} onBack={() => handleNavigate('home')} blogData={blogData || undefined} />;
      case 'tags':
        return <TagsView onOpenPost={(id) => handleNavigate('post', id)} posts={posts} />;
      case 'categories':
        return <CategoriesView onOpenPost={(id) => handleNavigate('post', id)} posts={posts} />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      default:
        return <HomeView onOpenPost={(id) => handleNavigate('post', id)} posts={posts} blogData={blogData || undefined} />;
    }
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
      <LiquidBackground />

      {/* Hero Title only on Home */}
      <AnimatePresence>
        {currentPage === 'home' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <HeroTitle />
          </motion.div>
        )}
      </AnimatePresence>

      <MagicNavbar
        onNavigate={handleNavigate}
        activePage={currentPage}
        posts={posts}
      />

      <main className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (activePostId || '')}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[var(--text-tertiary)] text-xs tracking-wider">
            © 2025 Jimmy Ki's Blog. 由 Next.js 和 <a href="https://github.com/myki-jim/myki-jim.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-color)] transition-colors">iOSlike</a> 主题驱动。
          </div>
          <div className="flex gap-8 text-xs font-medium text-[var(--text-secondary)]">
            <a href="https://github.com/myki-jim/myki-jim.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-color)] transition-colors">
              源码
            </a>
            <a href="https://github.com/myki-jim" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-color)] transition-colors">
              GitHub
            </a>
            <a href="mailto:myki.jim@gmail.com" className="hover:text-[var(--accent-color)] transition-colors">
              联系我
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
