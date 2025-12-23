'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LiquidBackground from '../components/LiquidBackground';
import MagicNavbar from '../components/MagicNavbar';
import { ContactView } from '../components/PageViews';
import { Post } from '../components/types';

export default function ContactPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

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
    }
  };

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'post' && id) {
      router.push(`/${id}`);
    } else if (page === 'tags') {
      router.push('/tags');
    } else if (page === 'categories') {
      router.push('/categories');
    } else if (page === 'tools') {
      router.push('/tools');
    } else if (page === 'about') {
      router.push('/about');
    } else if (page === 'contact') {
      router.push('/contact');
    }
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
      <LiquidBackground />

      <MagicNavbar
        onNavigate={handleNavigate}
        activePage="contact"
        posts={posts}
      />

      <main className="relative z-10 w-full min-h-screen">
        <motion.div
          key="contact"
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <ContactView />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[var(--text-tertiary)] text-xs tracking-wider">
            © 2025 Jimmy Ki's Blog. 由 Next.js 和 iOSlike 主题驱动。
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