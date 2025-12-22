'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LiquidBackground from '../components/LiquidBackground';
import MagicNavbar from '../components/MagicNavbar';
import PostView from '../components/PostView';
import { Post } from '../components/types';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (params.slug) {
      loadPostAndData();
    }
  }, [params.slug]);

  const loadPostAndData = async () => {
    try {
      // 加载文章索引数据
      const indexResponse = await fetch('/data/index.json');
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        setAllPosts(indexData.posts);
      }

      // 加载当前文章的完整数据
      const postResponse = await fetch(`/data/posts/${params.slug}.json`);
      if (postResponse.ok) {
        const postData = await postResponse.json();
        setPost(postData);
      } else {
        setPost(null);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      setPost(null);
    } finally {
      setLoading(false);
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
    } else if (page === 'about') {
      router.push('/about');
    } else if (page === 'contact') {
      router.push('/contact');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">文章未找到</h1>
          <button
            onClick={() => router.push('/')}
            className="text-[var(--accent-color)] hover:underline"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
      <LiquidBackground />

      <MagicNavbar
        onNavigate={handleNavigate}
        activePage="post"
        posts={allPosts}
      />

      <main className="relative z-10 w-full min-h-screen">
        <motion.div
          key={post.slug}
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <PostView
            post={post}
            onBack={() => router.push('/')}
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