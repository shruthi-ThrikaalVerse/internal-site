// @ts-nocheck
/*import React from 'react';
import { motion } from 'framer-motion';
import { TEAM } from '../constants.js';

const Team = () => {
  return (
    <>
      <style>{`
        .team-leadership {
          color: var(--current-accent);
        }
        .team-title {
          color: var(--text-primary);
        }
        .team-accent {
          color: var(--current-accent);
        }
        .team-description {
          color: var(--text-secondary);
        }
        .border-circle {
          border-color: var(--border-color);
        }
        .border-circle-hover {
          border-color: var(--border-color);
        }
        .border-circle-rotate {
          border-color: var(--border-color);
          opacity: 0.3;
        }
        .member-name {
          color: var(--text-primary);
        }
        .member-role {
          color: var(--current-accent);
        }
        .member-bio {
          color: var(--text-secondary);
        }
      `}</style>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.4em] mb-4 team-leadership">Leadership</h2>
          <h3 className="text-4xl md:text-5xl font-black team-title">Meticulous <span className="team-accent">Minds</span></h3>
          <p className="mt-6 max-w-xl mx-auto team-description">
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
                <div
                  className="absolute -inset-2 border rounded-full group-hover:transition-colors duration-500 border-circle"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--current-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                ></div>
                <div className="absolute -inset-4 border rounded-full group-hover:rotate-180 transition-all duration-700 border-circle-rotate"></div>

                <div className={`relative w-full aspect-square overflow-hidden rounded-full ${index === 0 ? 'grayscale-0' : 'grayscale'} group-hover:grayscale-0 transition-all duration-500`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-xl font-bold mb-1 member-name">{member.name}</h4>
                <p className="text-xs font-black uppercase tracking-widest mb-4 member-role">{member.role}</p>

                <div className="overflow-hidden h-0 group-hover:h-20 transition-all duration-500">
                  <p className="text-sm italic member-bio">
                    "{member.bio}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Team;*/