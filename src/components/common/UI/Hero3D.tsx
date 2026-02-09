// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext.tsx';

const Hero3D = () => {
  const { accentHex } = useTheme();

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative w-full max-w-[1800px] h-[690px]">
          <img src="/company_logo.png" alt="Thrikaal Verse Logo" className="w-full h-full object-cover mt-10 opacity-100" />
        </div>
      </div>
      
      <div className="relative z-10 text-center container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
          <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--current-accent)]/30 bg-[var(--current-accent)]/10 text-[var(--current-accent)] text-xs font-bold tracking-widest uppercase mb-6">Innovation Redefined</span>
          <h1 className="text-5xl md:text-8xl font-black text-[var(--text-primary)] leading-tight mb-8">THRIKAAL <span style={{ color: 'var(--current-accent)' }}>VERSE</span></h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">Architecting the future of global connectivity through sustainable, high-precision technological solutions.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToProjects} className="px-10 py-4 text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-xl" style={{ backgroundColor: 'var(--current-accent)' }}>Explore Projects</button>
            <button onClick={scrollToAbout} className="px-10 py-4 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-lg backdrop-blur-sm transition-all hover:scale-105">Our Vision</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero3D;
