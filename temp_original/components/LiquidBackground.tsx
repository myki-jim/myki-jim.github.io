import React from 'react';

const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
      {/* Deep atmospheric glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-900/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] mix-blend-screen animate-bounce" style={{ animationDuration: '15s' }} />
      
      {/* Grain overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default LiquidBackground;