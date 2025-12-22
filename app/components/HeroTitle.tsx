import React, { useEffect, useState } from 'react';

const BLOG_TITLE = "Jimmy Ki's Blog";
const BLOG_SUBTITLE = "技术笔记、编程体验和生活思考";

const HeroTitle: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Parallax and Fade effects - same as original
      const newOpacity = Math.max(0, 1 - currentScrollY / 150);
      const newY = Math.max(0, -currentScrollY * 0.33);
      const newScale = Math.max(0.9, 1 - currentScrollY * 0.00066);

      setOpacity(newOpacity);
      setY(newY);
      setScale(newScale);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial call
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed top-24 left-0 w-full z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        transition: 'none'
      }}
    >
       <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-liquid-gradient py-4 drop-shadow-2xl">
         {BLOG_TITLE}
       </h1>
       <p className="text-[var(--text-secondary)] text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed transition-colors duration-500">
         {BLOG_SUBTITLE}
       </p>
    </div>
  );
};

export default HeroTitle;