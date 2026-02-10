// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const socialLinks = [
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.5h5V24H0V8.5zM8.5 8.5h4.8v2.1h.1c.7-1.2 2.4-2.5 4.9-2.5 5.2 0 6.2 3.4 6.2 7.8V24h-5v-7.9c0-1.9 0-4.4-2.7-4.4-2.7 0-3.1 2.1-3.1 4.3V24h-5V8.5z" />
            </svg>
        ),
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com',
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
    }
];

const Footer: React.FC = () => {
    return (
        <footer className="py-8 md:py-12 bg-[var(--bg-primary)] border-t border-[var(--border-color)] text-center text-[var(--text-secondary)] text-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[var(--text-primary)] tracking-tighter">THRIKAAL VERSE</span>
                        <span className="text-xl font-bold text-[var(--current-accent)] tracking-tighter">Pvt.Ltd</span>
                    </div>
                    <p className="max-w-md">Leading the future of interconnected technology with precision, vision, and sustainability.</p>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                    {socialLinks.map((social) => (
                        <motion.a
                            key={social.name}
                            href={social.href}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="transition-colors duration-300 p-2 rounded-full border border-[var(--border-color)] hover:border-[var(--current-accent)]/50 text-[var(--text-primary)]"
                            aria-label={social.name}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {social.icon}
                        </motion.a>
                    ))}
                </div>

                <p>© {new Date().getFullYear()} Thrikaal Verse Pvt. Ltd. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
