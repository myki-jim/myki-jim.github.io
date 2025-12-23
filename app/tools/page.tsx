'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Regex,
  Hash,
  FileCode,
  Key,
  Lock,
  QrCode,
  Palette,
  Calculator,
  Clock,
  Settings,
  Type,
  ArrowRight,
  FileText,
  Gamepad2,
  Box,
  Workflow
} from 'lucide-react';
import LiquidBackground from '../components/LiquidBackground';
import MagicNavbar from '../components/MagicNavbar';
import { ToolItem } from '../components/types';

const tools: ToolItem[] = [
  {
    id: 'regex',
    name: '正则表达式测试器',
    description: '实时测试和调试正则表达式，内置常用模式库',
    icon: 'regex',
    category: '开发工具',
    path: '/tools/regex'
  },
  {
    id: 'hash',
    name: '哈希生成器',
    description: '支持 MD5、SHA-1、SHA-256 等多种哈希算法',
    icon: 'hash',
    category: '开发工具',
    path: '/tools/hash'
  },
  {
    id: 'encoder',
    name: '编解码转换器',
    description: 'Base64、URL、HTML、十六进制等多种编码实时转换',
    icon: 'type',
    category: '开发工具',
    path: '/tools/encoder'
  },
  {
    id: 'json',
    name: 'JSON 格式化器',
    description: '格式化、压缩和验证 JSON 数据',
    icon: 'fileCode',
    category: '开发工具',
    path: '/tools/json'
  },
  {
    id: 'uuid',
    name: 'UUID 生成器',
    description: '批量生成 UUID v4，支持多种格式',
    icon: 'key',
    category: '开发工具',
    path: '/tools/uuid'
  },
  {
    id: 'keygen',
    name: 'RSA 密钥生成器',
    description: '生成 RSA 公钥私钥对，支持多种格式',
    icon: 'lock',
    category: '安全工具',
    path: '/tools/keygen'
  },
  {
    id: 'password',
    name: '密码生成器',
    description: '生成安全的随机密码，支持自定义强度',
    icon: 'lock',
    category: '安全工具',
    path: '/tools/password'
  },
  {
    id: 'markdown',
    name: 'Markdown 编辑器',
    description: '实时预览编辑器，支持 GitHub Flavored Markdown',
    icon: 'fileText',
    category: '文本处理',
    path: '/tools/markdown'
  },
  {
    id: '2048',
    name: '2048 游戏',
    description: '经典 2048 益智游戏，支持键盘和触摸操作',
    icon: 'gamepad2',
    category: '其他',
    path: '/tools/2048'
  },
  {
    id: 'qrcode',
    name: '二维码生成器',
    description: '支持文本、链接、WiFi、名片等多种格式',
    icon: 'qrCode',
    category: '开发工具',
    path: '/tools/qrcode'
  },
  {
    id: 'mermaid',
    name: 'Mermaid 图表编辑器',
    description: '实时预览，支持流程图、时序图、甘特图等',
    icon: 'workflow',
    category: '开发工具',
    path: '/tools/mermaid'
  },
  {
    id: 'uml',
    name: 'UML 图表设计器',
    description: '专业的 UML 建模工具，支持类图、用例图等',
    icon: 'box',
    category: '开发工具',
    path: '/tools/uml'
  },
];

const iconMap: Record<string, React.ElementType> = {
  regex: Regex,
  hash: Hash,
  fileCode: FileCode,
  fileText: FileText,
  key: Key,
  lock: Lock,
  qrCode: QrCode,
  palette: Palette,
  calculator: Calculator,
  clock: Clock,
  settings: Settings,
  type: Type,
  gamepad2: Gamepad2,
  box: Box,
  workflow: Workflow,
};

export default function ToolsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const categories = ['全部', '开发工具', '安全工具', '文本处理', '其他'];

  const filteredTools = activeCategory === '全部'
    ? tools
    : tools.filter(tool => tool.category === activeCategory);

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'tools') {
      router.push('/tools');
    } else if (page === 'tags') {
      router.push('/tags');
    } else if (page === 'categories') {
      router.push('/categories');
    } else if (page === 'about') {
      router.push('/about');
    } else if (page === 'contact') {
      router.push('/contact');
    } else if (page === 'post' && id) {
      router.push(`/${id}`);
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
                    <div className="mb-4 text-[var(--accent-color)]">
                      {(() => {
                        const IconComponent = iconMap[tool.icon] || Settings;
                        return <IconComponent size={40} />;
                      })()}
                    </div>
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
                      <span className="text-sm font-semibold text-[var(--accent-color)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                        打开 <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <div className="text-center py-20">
                <Settings size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
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
            © 2025 Jimmy Ki's Blog. 由 Next.js 和 iOSlike 主题驱动。
          </div>
        </div>
      </footer>
    </div>
  );
}
