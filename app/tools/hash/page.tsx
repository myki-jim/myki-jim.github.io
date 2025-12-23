'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LiquidBackground from '../../components/LiquidBackground';
import MagicNavbar from '../../components/MagicNavbar';
import HashGenerator from '../../components/HashGenerator';

export default function HashToolPage() {
  const router = useRouter();

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'tools') {
      router.push('/tools');
    }
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
      <LiquidBackground />

      <MagicNavbar
        onNavigate={handleNavigate}
        activePage="tools"
        posts={[]}
      />

      <main className="relative z-10 w-full min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-[140px]"
        >
          <button
            onClick={() => router.push('/tools')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            返回工具箱
          </button>

          <HashGenerator />
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-[var(--text-tertiary)] text-xs text-center">
            © 2025 Jimmy Ki's Blog. 哈希生成器
          </div>
        </div>
      </footer>
    </div>
  );
}
