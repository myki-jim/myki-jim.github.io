import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const BLOG_TITLE = "Jimmy Ki's Blog";
const BLOG_SUBTITLE = "技术笔记、编程体验和生活思考";

const HeroTitle: React.FC = () => {
  const { scrollY } = useScroll();

  // Parallax and Fade effects
  const opacity = useTransform(scrollY, [0, 150], [1, 0]);
  const y = useTransform(scrollY, [0, 150], [0, -50]);
  const scale = useTransform(scrollY, [0, 150], [1, 0.9]);

  return (
    <motion.div
      style={{ opacity, y, scale, pointerEvents: useTransform(opacity, v => v > 0.1 ? 'auto' : 'none') }}
      className="fixed top-24 left-0 w-full z-30 flex flex-col items-center justify-center text-center px-4"
    >
       <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-liquid-gradient py-4 drop-shadow-2xl">
         {BLOG_TITLE}
       </h1>
       <p className="text-[var(--text-secondary)] text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed transition-colors duration-500">
         {BLOG_SUBTITLE}
       </p>
    </motion.div>
  );
};

export default HeroTitle;