import React from 'react';
import { motion } from 'framer-motion';
import { Github, Send, Mail, Coffee, Twitter, Code2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-32 w-full max-w-[320px]">
      
      {/* Minimal Author Card */}
      <div 
        className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] flex flex-col items-center text-center"
        style={{ backdropFilter: "blur(var(--glass-blur))" }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-[var(--glass-border)] mb-4 shadow-xl" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Alex Designer</h3>
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mb-4">UI Engineer @ Apple</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Exploring the intersection of fluid physics and digital interfaces.
        </p>
      </div>

      {/* Social Matrix */}
      <div>
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-2">Connect</h4>
        <div className="grid grid-cols-3 gap-3">
            <SocialTile icon={<Github size={20} />} label="GitHub" delay={0} />
            <SocialTile icon={<Send size={20} />} label="Telegram" delay={0.1} />
            <SocialTile icon={<Mail size={20} />} label="Email" delay={0.2} />
            <SocialTile icon={<Twitter size={20} />} label="Twitter" delay={0.3} />
            <SocialTile icon={<Code2 size={20} />} label="Source" delay={0.4} />
        </div>
      </div>

      {/* Custom Slot (Donation) */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative p-6 rounded-3xl overflow-hidden border border-amber-500/20 group cursor-pointer"
      >
        <div className="absolute inset-0 bg-amber-900/20 transition-colors group-hover:bg-amber-900/30" style={{ backdropFilter: "blur(var(--glass-blur))" }} />
        <div className="relative z-10 flex items-center justify-between">
            <div>
                 <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Coffee size={18} />
                    <span className="font-bold text-sm">Buy me a coffee</span>
                 </div>
                 <p className="text-xs text-[var(--text-secondary)]">Support my work</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                +
            </div>
        </div>
      </motion.div>

       {/* Custom Slot 2 (Configurable) */}
       <div 
         className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] min-h-[120px] flex flex-col justify-center items-center text-center gap-2 border-dashed border-[var(--glass-border)]"
         style={{ backdropFilter: "blur(var(--glass-blur))" }}
       >
          <span className="text-xs font-mono text-[var(--text-tertiary)]">[ Custom Slot Area ]</span>
          <p className="text-xs text-[var(--text-tertiary)] max-w-[150px]">
              Inject content via _config.yml (Ads, Badge, Status)
          </p>
      </div>

    </aside>
  );
};

const SocialTile = ({ icon, label, delay }: { icon: React.ReactNode, label: string, delay: number }) => (
    <motion.a
        href="#"
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