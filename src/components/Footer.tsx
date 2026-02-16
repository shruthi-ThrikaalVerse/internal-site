// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const socialLinks = [
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/thrikaalverse',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.5h5V24H0V8.5zM8.5 8.5h4.8v2.1h.1c.7-1.2 2.4-2.5 4.9-2.5 5.2 0 6.2 3.4 6.2 7.8V24h-5v-7.9c0-1.9 0-4.4-2.7-4.4-2.7 0-3.1 2.1-3.1 4.3V24h-5V8.5z" />
            </svg>
        ),
    },
    {
        name: 'Twitter',
        href: 'https://x.com/ThrikaalVerse',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M24 4.6c-.9.4-1.8.6-2.8.8 1-.6 1.7-1.6 2-2.7-.9.6-2 .9-3.1 1.2C19.3 2 18.1 1.5 16.8 1.5c-2.5 0-4.5 2.2-3.9 4.6-3.7-.2-7-2-9.2-4.7C1.6 4.2 2 6.1 3.6 7.1c-.8 0-1.6-.2-2.3-.6 0 2.8 2 5.2 4.6 5.6-.5.2-1.1.2-1.6.1.5 1.6 2 2.8 3.7 2.8C6 18 3.6 18.7 1.2 18.1c2 1.3 4.4 2 6.9 2 8.2 0 12.8-6.8 12.8-12.8v-.6C22.7 6.5 23.5 5.6 24 4.6z" />
            </svg>
        ),
    },
    {
        name: 'GitHub',
        href: 'https://github.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 .5C5.7.5.7 5.6.7 11.9c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2c-3.1.7-3.7-1.4-3.7-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 2 .1.1-.8.4-1.3.7-1.6-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.6.1-3.4 0 0 .9-.3 3 .1.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.1-.4 3-.1 3-.1.6 1.8.2 3.1.1 3.4.7.8 1.1 1.8 1.1 3 0 4.1-2.5 5-4.9 5.3.4.4.7 1 .7 2v3c0 .4.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.3 5.6 18.3.5 12 .5z" />
            </svg>
        ),
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/thrikaalverse?igsh=M2V1bGx4c2xudTNt',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/profile.php?id=61587556846437', // Replace with your actual Facebook URL
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    }
];

const Footer: React.FC = () => {
    return (
        <footer className="py-8 md:py-12 bg-[var(--bg-primary)] border-t border-[var(--border-color)] text-center text-[var(--text-secondary)]">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter">THRIKAAL VERSE</span>
                        <span className="text-2xl font-bold text-[var(--current-accent)] tracking-tighter">Pvt.Ltd</span>
                    </div>
                    <p className="max-w-md text-base" style={{ color: 'var(--text-secondary)' }}>Leading the future of interconnected technology with precision, vision, and sustainability.</p>
                </div>

                <div className="flex items-center justify-center gap-8 mb-8">
                    {socialLinks.map((social, index) => (
                        <motion.a
                            key={social.name}
                            href={social.href}
                            whileHover={{
                                scale: 1.2,
                                rotate: 10,
                                boxShadow: '0 0 20px var(--current-accent)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-12 h-12 flex items-center justify-center rounded-full border-2 p-2 transition-all duration-300"
                            style={{
                                borderColor: 'var(--current-accent)',
                                color: 'var(--text-primary)',
                                backgroundColor: 'var(--bg-secondary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--current-accent)';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            aria-label={social.name}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {social.icon}
                        </motion.a>
                    ))}
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>© {new Date().getFullYear()} Thrikaal Verse Pvt. Ltd. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;