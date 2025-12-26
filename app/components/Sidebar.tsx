import React from 'react';
import { motion } from 'framer-motion';
import { Github, Send, Mail, Code2 } from 'lucide-react';
import { BlogData } from './types';

interface SidebarProps {
  blogData?: BlogData;
}

const Sidebar: React.FC<SidebarProps> = ({ blogData }) => {
  const postsCount = blogData?.site.postsCount || 0;
  const categoriesCount = blogData?.site.categoriesCount || 0;
  const tagsCount = blogData?.site.tagsCount || 0;

  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-32 w-full max-w-[320px]">

      {/* Minimal Author Card */}
      <div
        className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] flex flex-col items-center text-center"
        style={{ backdropFilter: "blur(var(--glass-blur))" }}
      >
        <img
          src="/images/avatar.png"
          alt="Jimmy Ki"
          className="w-20 h-20 rounded-full border-2 border-[var(--glass-border)] mb-4 shadow-xl object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://github.com/myki-jim.png";
          }}
        />
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[var(--glass-border)] mb-4 shadow-xl hidden"
          style={{ display: 'none' }}
        />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Jimmy Ki</h3>
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mb-4">安全研究员 & 开发者</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          专注于网络安全、漏洞分析与全栈开发
        </p>
      </div>

      {/* Blog Stats */}
      <div>
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-2">统计信息</h4>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="文章" count={postsCount} delay={0} />
          <StatTile label="分类" count={categoriesCount} delay={0.1} />
          <StatTile label="标签" count={tagsCount} delay={0.2} />
        </div>
      </div>

      {/* Social Matrix */}
      <div>
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-2">联系方式</h4>
        <div className="grid grid-cols-3 gap-3">
          <SocialTile icon={<Github size={20} />} label="GitHub" href="https://github.com/myki-jim" delay={0} />
          <SocialTile icon={<Mail size={20} />} label="邮箱" href="mailto:myki.jim@gmail.com" delay={0.1} />
          <SocialTile icon={<Code2 size={20} />} label="源码" href="https://github.com/myki-jim/myki-jim.github.io" delay={0.2} />
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)]"
        style={{ backdropFilter: "blur(var(--glass-blur))" }}
      >
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-2">最新动态</h4>
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)]">•</span> 添加了图片优化和骨架屏加载
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)]">•</span> 发布了"{blogData?.posts[0]?.title || '最新文章'}"
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">
            更新于 {blogData?.lastUpdated ? new Date(blogData.lastUpdated).toLocaleDateString() : '今天'}
          </div>
        </div>
      </div>

    </aside>
  );
};

const StatTile = ({ label, count, delay }: { label: string, count: number, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-4"
    style={{ backdropFilter: "blur(var(--glass-blur))" }}
  >
    <span className="text-2xl font-bold text-[var(--accent-color)]">{count}</span>
    <span className="text-[10px] font-medium opacity-50">{label}</span>
  </motion.div>
);

const SocialTile = ({ icon, label, href, delay }: { icon: React.ReactNode, label: string, href: string, delay: number }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, backgroundColor: "var(--glass-surface-hover)" }}
    whileTap={{ scale: 0.95 }}
    className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    style={{ backdropFilter: "blur(var(--glass-blur))" }}
  >
    {icon}
    <span className="text-[10px] font-medium opacity-50">{label}</span>
  </motion.a>
);

export default Sidebar;