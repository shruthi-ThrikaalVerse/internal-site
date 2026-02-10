// @ts-nocheck
import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { useTheme } from './ThemeContext.js';

const ScrollToTop = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const { mode, accentHex } = useTheme();

  const rotateProgress = useTransform(scrollYProgress, [0, 1], [0, 360]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() || 0;

    if (latest > prev && latest > 50) {
      setScrollDirection('down');
    } else if (latest < prev) {
      setScrollDirection('up');
    }

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentPercent = Math.round((latest / totalHeight) * 100);
    setPercent(Math.min(Math.max(currentPercent, 0), 100));

    if (latest > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  const handleScrollAction = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleScrollAction}
          className="fixed bottom-8 right-8 z-50 group outline-none"
          aria-label={`Scroll indicator. Currently at ${percent} percent, scrolling ${scrollDirection}`}
        >
          <motion.div
            style={{
              backgroundColor: accentHex,
              boxShadow: `0 0 40px 10px ${accentHex}44`
            }}
            className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          />

          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-full border border-[var(--border-color)] flex items-center justify-center shadow-2xl overflow-hidden">
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2" style={{ rotate: rotateProgress }}>
              <path d="M 50,10 A 40,40 0 0 1 90,50" fill="none" stroke="var(--accent-green)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 85,50 L 90,57 L 95,50" fill="none" stroke="var(--accent-green)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 50,90 A 40,40 0 0 1 10,50" fill="none" stroke="var(--accent-orange)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 5,50 L 10,43 L 15,50" fill="none" stroke="var(--accent-orange)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.span className="text-lg md:text-xl font-black tracking-tighter" style={{ color: accentHex }}>{percent}%</motion.span>

              <motion.div initial={false} animate={{ opacity: percent > 2 ? 0.7 : 0, y: 0, rotate: scrollDirection === 'down' ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
              </motion.div>
            </div>

            <motion.div style={{ borderColor: accentHex }} className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
