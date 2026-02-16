// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import { PROJECTS } from "../constants";

const Projects = () => {
  return (
    <>
      <style>{`
        .projects-section {
          background-color: var(--bg-primary, #0f0f0f);
        }
        .portfolio-title {
          color: var(--current-accent, #2d6b7e);
        }
        .strategic-title {
          color: var(--text-primary, #ffffff);
        }
        .strategic-span {
          color: var(--current-accent, #f37321);
        }
        .description-text {
          color: var(--text-secondary, #9ca3af);
        }
        .project-card {
          background-color: var(--bg-secondary, #1a1a1a);
        }
        .category-badge {
          background-color: var(--current-accent, #f37321);
          color: black;
        }
        .project-title {
          color: var(--text-primary, #ffffff);
        }
        .project-description {
          color: var(--text-secondary, #d1d5db);
        }
        .case-study-link {
          color: var(--current-accent, #2d6b7e);
        }
        .border-glow {
          border-color: var(--current-accent, #f37321);
        }
        .view-all-btn {
          color: var(--text-primary);
          border: 2px solid var(--current-accent);
          background-color: transparent;
        }
        .view-all-btn:hover {
          background-color: var(--current-accent);
          color: #ffffff;
        }
        .gradient-overlay {
          background-image: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4), transparent);
        }
      `}</style>

      <section className="py-24 projects-section">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16 gap-4">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.4em] mb-2 portfolio-title">
              Portfolio
            </h2>

            <h3 className="text-4xl md:text-5xl font-black leading-tight strategic-title">
              Strategic <span className="strategic-span">Ventures</span>
            </h3>

            <p className="max-w-2xl mt-4 description-text">
              A curated selection of impactful technological advancements across fintech, entertainment, AI, and enterprise solutions.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {PROJECTS.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  rotateX: 3,
                  rotateY: 3,
                }}
                className="group relative h-[380px] overflow-hidden rounded-3xl cursor-pointer shadow-xl project-card"
              >
                {/* Background Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 transition-all duration-700 gradient-overlay" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:-translate-y-3 transition-all duration-500">
                  <span className="inline-block px-4 py-1 text-black text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 category-badge">
                    {project.category}
                  </span>

                  <h4 className="text-3xl font-bold mb-3 project-title">
                    {project.title}
                  </h4>

                  <p className="text-sm line-clamp-2 max-w-xs mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 project-description">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 case-study-link">
                    View Case Study
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 border rounded-3xl transition-all duration-500 border-glow" />
              </motion.div>
            ))}
          </div>

          {/* Button */}
          <div className="mt-20 text-center">
            <button className="px-12 py-4 rounded-full font-bold transition-all duration-300 shadow-lg view-all-btn">
              View All Projects
            </button>
          </div>

        </div>
      </section>
    </>
  );
};

export default Projects;