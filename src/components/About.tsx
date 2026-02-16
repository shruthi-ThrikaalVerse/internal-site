// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const founder = {
    name: "VAGYA NAIK BHUKYA",
    role: "Founder & Chairperson",
    image: "/ceo_img.png",};

  return (
    <div className="about-container mb-4">
      <div className="about-grid">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="about-image-section">
          <div className="about-image-wrapper">
            <div className="about-border-outer"></div>
            <div className="about-border-mid"></div>
            <div className="about-border-inner"></div>

            <div className="about-image-center">
              <div className="about-glow"></div>

              <div className="about-founder-image">
                <img
                  src={founder.image}
                  alt={`${founder.name} - ${founder.role}`}
                  className="about-img"
                  loading="eager"
                  decoding="auto"
                />
                <div className="about-overlay">
                  <div className="about-overlay-text">
                    <p className="about-founder-name">{founder.name}</p>
                    <p className="about-founder-role">{founder.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-rotate-1"><div className="about-dot about-dot-orange"></div></div>
            <div className="about-rotate-2"><div className="about-dot about-dot-teal"></div></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="about-content-section">
          <h2 className="about-label">The Organization</h2>
          <h3 className="about-title">Pioneering Continuity in a <span className="about-title-accent">Changing World</span></h3>

          <p className="about-description">Founded by {founder.name}, Thrikaal Verse Pvt. Ltd. was built on the principles of sustainability and technological integration. Our name signifies the three phases of time—past, present, and future—representing our commitment to learning from history, excelling in the now, and building for the generations to come.</p>

          <div className="about-features">
            <div>
              <h4 className="about-feature-title"><span className="about-feature-dot about-dot-accent"></span>Global Vision</h4>
              <p className="about-feature-text">Connecting industries across borders with unified digital ecosystems.</p>
            </div>
            <div>
              <h4 className="about-feature-title"><span className="about-feature-dot about-dot-accent"></span>Local Impact</h4>
              <p className="about-feature-text">Empowering communities through accessible green technology solutions.</p>
            </div>
          </div>

          <button className="about-button">Discover Our Timeline<span className="about-button-line"></span></button>
        </motion.div>
      </div>

      <style jsx>{`
        .about-container {
          max-width: 100%;
          margin-top: 2rem;
          padding: 0 1rem;
        }

        @media (min-width: 640px) {
          .about-container {
            margin-top: 3rem;
            padding: 0 1.5rem;
          }
        }

        .about-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        @media (min-width: 640px) {
          .about-grid {
            gap: 3rem;
          }
        }

        @media (min-width: 1024px) {
          .about-grid {
            flex-direction: row;
            gap: 4rem;
          }
        }

        .about-image-section {
          flex: 1;
          position: relative;
          width: 100%;
          min-width: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem 0;
        }

        @media (min-width: 1024px) {
          .about-image-section {
            width: 50%;
            padding: 0;
          }
        }

        .about-image-wrapper {
          position: relative;
          width: 90%;
          max-width: 500px;
          aspect-ratio: 1;
          margin: 0 auto;
          min-height: 280px;
        }

        @media (min-width: 640px) {
          .about-image-wrapper {
            width: 100%;
            min-height: 350px;
          }
        }

        @media (min-width: 1024px) {
          .about-image-wrapper {
            min-height: 500px;
          }
        }

        .about-border-outer {
          position: absolute;
          inset: 0;
          border: 1px solid;
          border-color: var(--border-color);
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .about-border-mid {
          position: absolute;
          inset: 8%;
          border: 1px solid;
          border-color: var(--accent-teal);
          border-radius: 50%;
          opacity: 0.3;
        }

        .about-border-inner {
          position: absolute;
          inset: 15%;
          border: 1px solid;
          border-color: var(--accent-orange);
          border-radius: 50%;
          opacity: 0.3;
        }

        .about-image-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-glow {
          width: 66.666%;
          height: 66.666%;
          background: linear-gradient(to bottom right, var(--accent-green), var(--accent-teal));
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.1;
        }

        .about-founder-image {
          position: relative;
          width: 80%;
          height: 80%;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid;
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
          background-color: var(--bg-secondary);
          group: group;
        }

        .about-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1000ms ease-out;
        }

        .about-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
          opacity: 0;
          transition: opacity 500ms;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 3rem;
        }

        .about-founder-image:hover .about-overlay {
          opacity: 1;
        }

        .about-overlay-text {
          text-align: center;
        }

        .about-founder-name {
          color: white;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.875rem;
        }

        .about-founder-role {
          color: var(--current-accent);
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .about-rotate-1 {
          position: absolute;
          inset: 0;
          animation: spin-slow 10s linear infinite;
        }

        .about-rotate-2 {
          position: absolute;
          inset: 0;
          animation: spin-reverse-slow 7s linear infinite;
        }

        .about-dot {
          position: absolute;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
        }

        .about-dot-orange {
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--accent-orange);
          box-shadow: 0 0 20px var(--accent-orange);
        }

        .about-dot-teal {
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--accent-teal);
          box-shadow: 0 0 20px var(--accent-teal);
        }

        .about-content-section {
          flex: 1;
        }

        @media (min-width: 1024px) {
          .about-content-section {
            width: 50%;
          }
        }

        .about-label {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          color: var(--current-accent);
        }

        .about-title {
          font-size: 2.25rem;
          line-height: 2.5rem;
          font-weight: 900;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        @media (min-width: 768px) {
          .about-title {
            font-size: 3rem;
            line-height: 3.5rem;
          }
        }

        .about-title-accent {
          color: var(--current-accent);
        }

        .about-description {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          line-height: 1.75;
          color: var(--text-secondary);
        }

        .about-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        @media (min-width: 640px) {
          .about-features {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .about-feature-title {
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .about-feature-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }

        .about-dot-accent {
          background-color: var(--current-accent);
        }

        .about-feature-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .about-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.875rem;
          color: var(--text-primary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .about-button-line {
          width: 2.5rem;
          height: 1px;
          transition: width 300ms;
          background-color: var(--current-accent);
        }

        .about-button:hover .about-button-line {
          width: 4rem;
        }

        @keyframes spin-slow { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        } 

        @keyframes spin-reverse-slow { 
          from { transform: rotate(360deg); } 
          to { transform: rotate(0deg); } 
        } 

        .animate-spin-slow { 
          animation: spin-slow 10s linear infinite; 
        } 

        .animate-spin-reverse-slow { 
          animation: spin-reverse-slow 7s linear infinite; 
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
