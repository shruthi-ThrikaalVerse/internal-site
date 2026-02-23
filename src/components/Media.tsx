// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const Media = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 mt-8 md:mt-12 max-w-6xl">
      <div className="flex flex-col items-center gap-12 mb-16">
        <div className="w-full text-center">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--current-accent)' }}>Media Hub</h2>
          <h3 className="text-5xl md:text-6xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Experience our <span style={{ color: 'var(--current-accent)' }}>Presence</span></h3>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>A visual documentation of our global footprint and technological integration ceremonies.</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="aspect-video bg-white/5 rounded-xl overflow-hidden relative group hover:shadow-xl transition-shadow duration-500">
            <img src={`${import.meta.env.BASE_URL}RD_team.webp`} className="w-full h-full object-cover" alt="Corporate image 1" />
            <div className="absolute bottom-4 left-4"><p className="text-xs font-bold text-white uppercase tracking-widest bg-black/50 px-3 py-2 rounded">Our RD Team</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="aspect-video bg-white/5 rounded-xl overflow-hidden relative group hover:shadow-xl transition-shadow duration-500">
            <img src={`${import.meta.env.BASE_URL}FD_team.webp`} className="w-full h-full object-cover" alt="Corporate image 2" />
            <div className="absolute bottom-4 left-4"><p className="text-xs font-bold text-white uppercase tracking-widest bg-black/50 px-3 py-2 rounded">Our FD Team</p></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Media;
