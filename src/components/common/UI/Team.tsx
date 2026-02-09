// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { TEAM } from '../constants.ts';

const Team = () => {
  return (
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.4em] mb-4">Leadership</h2>
        <h3 className="text-4xl md:text-5xl font-black">Meticulous <span className="text-teal-500">Minds</span></h3>
        <p className="text-gray-500 mt-6 max-w-xl mx-auto">
          Our team combines decades of global expertise to steer Thrikaal Verse towards a legacy of innovation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {TEAM.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="relative mb-6">
              <div className="absolute -inset-2 border border-white/5 rounded-full group-hover:border-orange-500/50 transition-colors duration-500"></div>
              <div className="absolute -inset-4 border border-white/0 rounded-full group-hover:border-teal-500/30 transition-all duration-700 group-hover:rotate-180"></div>
              
              <div className={`relative w-full aspect-square overflow-hidden rounded-full ${index === 0 ? 'grayscale-0' : 'grayscale'} group-hover:grayscale-0 transition-all duration-500`}>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold mb-1">{member.name}</h4>
              <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-4">{member.role}</p>
              
              <div className="overflow-hidden h-0 group-hover:h-20 transition-all duration-500">
                <p className="text-gray-500 text-sm italic">
                  "{member.bio}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Team;
