// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const founder = {
    name: "VAGYA NAIK BHUKYA",
    role: "Founder & Chairperson",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&h=800&auto=format&fit=crop"
  };

  return (
    <div className="container mt-12 px-6">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="lg:w-1/2 relative">
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 border-[1px] border-[var(--border-color)] rounded-full animate-pulse"></div>
            <div className="absolute inset-[8%] border-[1px] border-[var(--accent-teal)]/30 rounded-full"></div>
            <div className="absolute inset-[15%] border-[1px] border-[var(--accent-orange)]/30 rounded-full"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-2/3 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-teal)] rounded-full blur-[80px] opacity-10"></div>
              
              <div className="relative w-4/5 h-4/5 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[var(--bg-secondary)] group">
                <img src={founder.image} alt={`${founder.name} - ${founder.role}`} className="w-full h-full object-cover grayscale-0 transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-12">
                   <div className="text-center">
                      <p className="text-white font-black uppercase tracking-[0.2em] text-sm">{founder.name}</p>
                      <p className="text-orange-500 font-bold text-[10px] tracking-widest uppercase">{founder.role}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 animate-spin-slow"><div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-[0_0_20px_var(--accent-orange)]" style={{ backgroundColor: 'var(--accent-orange)' }}></div></div>
            <div className="absolute inset-0 animate-spin-reverse-slow"><div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-[0_0_20px_var(--accent-teal)]" style={{ backgroundColor: 'var(--accent-teal)' }}></div></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="lg:w-1/2">
          <h2 className="text-sm font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'var(--current-accent)' }}>The Organization</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-8 text-[var(--text-primary)]">Pioneering Continuity in a <span className="text-[var(--accent-teal)]">Changing World</span></h3>
          
          <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed">Founded by {founder.name}, Thrikaal Verse Pvt. Ltd. was built on the principles of sustainability and technological integration. Our name signifies the three phases of time—past, present, and future—representing our commitment to learning from history, excelling in the now, and building for the generations to come.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h4 className="text-[var(--text-primary)] font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-orange)' }}></span>Global Vision</h4>
              <p className="text-sm text-[var(--text-secondary)]">Connecting industries across borders with unified digital ecosystems.</p>
            </div>
            <div>
              <h4 className="text-[var(--text-primary)] font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-teal)' }}></span>Local Impact</h4>
              <p className="text-sm text-[var(--text-secondary)]">Empowering communities through accessible green technology solutions.</p>
            </div>
          </div>

          <button className="group flex items-center gap-3 text-[var(--text-primary)] font-bold uppercase tracking-widest text-sm">Discover Our Timeline<span className="w-10 h-[1px] transition-all duration-300 group-hover:w-16" style={{ backgroundColor: 'var(--current-accent)' }}></span></button>
        </motion.div>
      </div>

      <style jsx>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes spin-reverse-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } } .animate-spin-slow { animation: spin-slow 10s linear infinite; } .animate-spin-reverse-slow { animation: spin-reverse-slow 7s linear infinite; }`}</style>
    </div>
  );
};

export default About;
