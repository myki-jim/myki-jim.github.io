'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LiquidBackground from '../components/LiquidBackground';
import MagicNavbar from '../components/MagicNavbar';
import { CategoriesView } from '../components/PageViews';
import { Post } from '../components/types';

export default function CategoriesPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      const response = await fetch('/data/index.json');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'post' && id) {
      router.push(`/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
      <LiquidBackground />

      <MagicNavbar
        onNavigate={handleNavigate}
        activePage="categories"
        posts={posts}
      />

      <main className="relative z-10 w-full min-h-screen">
        <motion.div
          key="categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CategoriesView
            onOpenPost={(id) => router.push(`/${id}`)}
            posts={posts}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[var(--text-tertiary)] text-xs tracking-wider">
            © 2025 Jimmy Ki's Blog. 由 Next.js 和 Liquid Glass 主题驱动。
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