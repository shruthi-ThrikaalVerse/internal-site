// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const Media = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 mt-8 md:mt-12 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="md:w-1/3">
          <h2 className="text-sm font-bold text-teal-500 uppercase tracking-[0.4em] mb-4">Media Hub</h2>
          <h3 className="text-4xl font-black mb-6">Experience our <span className="text-orange-500">Presence</span></h3>
          <p className="text-gray-400">A visual documentation of our global footprint and technological integration ceremonies.</p>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="aspect-video bg-white/5 rounded-xl overflow-hidden relative group">
            <img src="RD_team.webp" className="w-full h-full object-cover" alt="Corporate image 1" />
            <div className="absolute bottom-4 left-4"><p className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Our RD Team</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="aspect-video bg-white/5 rounded-xl overflow-hidden relative group">
            <img src="FD_team.webp" className="w-full h-full object-cover" alt="Corporate image 2" />
            <div className="absolute bottom-4 left-4"><p className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Our FD Team</p></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Media;
