// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';

const Projects = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
        <div>
          <h2 className="text-sm font-bold text-teal-500 uppercase tracking-[0.4em] mb-4">Portfolio</h2>
          <h3 className="text-4xl md:text-5xl font-black">Strategic <span className="text-orange-500">Ventures</span></h3>
        </div>
        <p className="text-gray-500 max-w-sm text-right">
          A curated selection of our most impactful technological advancements across various industries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
              rotateX: 2,
              rotateY: 2,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            className="group relative sm:h-64 md:h-[400px] overflow-hidden rounded-2xl bg-[#1a1a1a] cursor-pointer"
          >
            <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:-translate-y-2 transition-transform duration-500">
              <span className="inline-block px-3 py-1 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-4">{project.category}</span>
              <h4 className="text-3xl font-bold mb-2">{project.title}</h4>
              <p className="text-gray-400 text-sm line-clamp-2 max-w-xs mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{project.description}</p>
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700">View Case Study<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>
            </div>

            <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/30 rounded-2xl transition-all duration-500" />
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <button className="px-10 py-4 border border-white/10 hover:border-teal-500 text-white rounded-full transition-all bg-white/5 hover:bg-teal-500/10">View All Projects</button>
      </div>
    </div>
  );
};

export default Projects;
