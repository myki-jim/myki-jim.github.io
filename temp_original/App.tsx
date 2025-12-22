import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LiquidBackground from './components/LiquidBackground';
import MagicNavbar from './components/MagicNavbar';
import HeroTitle from './components/HeroTitle';
import HomeView from './components/views/HomeView';
import PostView from './components/views/PostView';
import { TagsView, CategoriesView, AboutView, ContactView } from './components/views/PageViews';
import { ThemeProvider } from './components/ThemeContext';
import { PageType, Post } from './types';
import { MOCK_POSTS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const handleNavigate = (page: PageType, id?: string) => {
    if (id) {
        setActivePostId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const getPostById = (id: string | null): Post | undefined => {
      return MOCK_POSTS.find(p => p.id === id);
  };

  const renderPage = () => {
    switch (currentPage) {
        case 'home':
            return <HomeView onOpenPost={(id) => handleNavigate('post', id)} />;
        case 'post':
            return <PostView post={getPostById(activePostId)} onBack={() => handleNavigate('home')} />;
        case 'tags':
            return <TagsView onOpenPost={(id) => handleNavigate('post', id)} />;
        case 'categories':
            return <CategoriesView onOpenPost={(id) => handleNavigate('post', id)} />;
        case 'about':
            return <AboutView />;
        case 'contact':
            return <ContactView />;
        default:
            return <HomeView onOpenPost={(id) => handleNavigate('post', id)} />;
    }
  };

  return (
    <ThemeProvider>
        <div className="min-h-screen text-[var(--text-primary)] selection:bg-[var(--accent-color)] selection:text-black transition-colors duration-500">
          <LiquidBackground />
          
          {/* Hero Title only on Home */}
          <AnimatePresence>
            {currentPage === 'home' && (
                <motion.div
                    key="hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <HeroTitle />
                </motion.div>
            )}
          </AnimatePresence>
          
          <MagicNavbar onNavigate={handleNavigate} activePage={currentPage} />

          <main className="relative z-10 w-full min-h-screen">
             <AnimatePresence mode="wait">
                <motion.div 
                    key={currentPage + (activePostId || '')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderPage()}
                </motion.div>
             </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl mt-0">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[var(--text-tertiary)] text-xs tracking-wider">
                    © 2026 Liquid Theme. Crafted with Physics.
                </div>
                <div className="flex gap-8 text-xs font-medium text-[var(--text-secondary)]">
                    <button className="hover:text-[var(--accent-color)] transition-colors">RSS</button>
                    <button className="hover:text-[var(--accent-color)] transition-colors">PRIVACY</button>
                    <button className="hover:text-[var(--accent-color)] transition-colors">SOURCE</button>
                </div>
            </div>
          </footer>
        </div>
    </ThemeProvider>
  );
};

export default App;