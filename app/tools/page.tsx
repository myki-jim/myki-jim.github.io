'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LiquidBackground from '../components/LiquidBackground';
import MagicNavbar from '../components/MagicNavbar';
import { ToolItem } from '../components/types';

const tools: ToolItem[] = [
  {
    id: 'regex',
    name: '正则表达式测试器',
    description: '实时测试和调试正则表达式，内置常用模式库',
    icon: '⚡',
    category: '开发工具',
    path: '/tools/regex'
  },
  // 后续会添加更多工具
];

export default function ToolsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const categories = ['全部', '开发工具', '文本处理', '加密解密', '转换工具', '其他'];

  const filteredTools = activeCategory === '全部'
    ? tools
    : tools.filter(tool => tool.category === activeCategory);

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
        >
          {/* Header */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[180px] pb-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] mb-6">
                开发工具箱
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                精心打造的实用工具集合，提升你的开发效率
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex gap-2 p-1 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)]">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === category
                        ? 'bg-[var(--accent-color)] text-black'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-hover)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(tool.path)}
                  className="group relative p-6 rounded-3xl bg-[var(--glass-surface)] hover:bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02]"
                  style={{ backdropFilter: 'blur(var(--glass-blur))' }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[var(--accent-glow)] to-transparent pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{tool.icon}</div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-color)] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                        {tool.category}
                      </span>
                      <span className="text-sm font-semibold text-[var(--accent-color)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        打开 →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔧</div>
                <p className="text-[var(--text-tertiary)]">此分类下暂无工具</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[var(--text-tertiary)] text-xs tracking-wider">
            © 2025 Jimmy Ki's Blog. 由 Next.js 和 Liquid Glass 主题驱动。
          </div>
        </div>
      </footer>
    </div>
  );
}
