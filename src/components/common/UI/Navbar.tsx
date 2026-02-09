// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext.tsx";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = [
        "home",
        "about",
        "projects",
        "team",
        "media",
        "career",
        "contact",
      ];
      const scrollPos = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Projects", id: "projects" },
    { label: "Team", id: "team" },
    { label: "Media", id: "media" },
    { label: "Career", id: "career" },
    { label: "Contact Us", id: "contact" },
  ];

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${scrolled ? "bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] py-3" : "bg-transparent"}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo("home")}>
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src="/thrikaal_logo.png" alt="Logo" className="w-full h-full object-cover" style={{ transform: "scale(1.14) translateX(-1.6px) translateY(-0.7px)" }} />
            </div>
            <div className="pr-4">
              <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase leading-none">Thrikaal Verse</h1>
              <div className="flex justify-end">
                <p className="text-[10px] font-bold tracking-[0.2em] leading-none mt-0 -mr-[0.17rem]" style={{ color: "var(--current-accent)" }}>Pvt.Ltd</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className={`relative text-sm font-medium tracking-wide transition-colors ${activeSection === item.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                {item.label}
                {activeSection === item.id && (<motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-[2px]" style={{ backgroundColor: "var(--current-accent)" }} />)}
              </button>
            ))}

            <div className="flex items-center gap-4 pl-4 border-l border-[var(--border-color)]">
              <div className="flex gap-2">
                {['orange', 'teal', 'green'].map((c) => (
                  <button key={c} onClick={() => setAccent(c)} className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${accent === c ? "ring-2 ring-offset-2 ring-[var(--text-primary)] ring-offset-[var(--bg-primary)]" : ""}`} style={{ backgroundColor: `var(--accent-${c})` }} title={`${c.charAt(0).toUpperCase() + c.slice(1)} Theme`} />
                ))}
              </div>

              <button onClick={toggleMode} className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors" title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}>
                {mode === "dark" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <button onClick={() => setIsLoginOpen(true)} className="px-6 py-2 text-white text-xs font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: "var(--current-accent)" }}>LOGIN</button>
            </div>
          </div>
        </div>

        <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes spin-reverse-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } } .animate-spin-slow { animation: spin-slow 10s linear infinite; } .animate-spin-reverse-slow { animation: spin-reverse-slow 7s linear infinite; }`}</style>
      </motion.nav>

    </>
  );
};

export default Navbar;
