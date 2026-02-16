// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { JOBS } from '../constants';

const Career = () => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl" id="career" >
      <div className="flex flex-col items-center text-center mb-20 pt-24">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="text-base md:text-lg font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--current-accent)' }}>Careers</motion.h2>
        <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black mb-8 max-w-3xl">Build the <span style={{ color: 'var(--current-accent)' }}>Future</span> with Continuity</motion.h3>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[var(--text-secondary)] text-lg max-w-2xl">At Thrikaal Verse, we don't just hire employees; we recruit visionaries ready to tackle the greatest challenges of the 21st century.</motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {JOBS.map((job, index) => (
          <motion.div key={job.id} initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="group relative p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl overflow-hidden hover:border-[var(--current-accent)]/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--current-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--current-accent)] transition-colors">{job.title}</h4>
                  <p className="text-sm text-[var(--accent-teal)] font-bold uppercase tracking-wider">{job.department}</p>
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{job.type}</span>
              </div>

              <p className="text-[var(--text-secondary)] mb-8 flex-grow leading-relaxed">{job.description}</p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {job.location}
                </div>
                <button className="flex items-center gap-2 text-[var(--current-accent)] font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">Apply Now<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="pt-3 text-center"><button className="px-10 py-4 rounded-full transition-all font-bold" style={{ color: 'var(--text-primary)', borderColor: 'var(--current-accent)', backgroundColor: 'transparent', border: '2px solid var(--current-accent)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--current-accent)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.opacity = '1'; }}>View All Jobs</button></div>
    </div>
  );
};

export default Career;
