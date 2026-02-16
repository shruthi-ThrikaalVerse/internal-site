// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.tsx";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const navigate = useNavigate();

  const navRef = useRef(null);

  // update CSS variable for nav offset so scroll-margin-top works reliably
  const updateNavOffset = () => {
    const navHeight = navRef.current ? navRef.current.offsetHeight : 80;
    document.documentElement.style.setProperty('--nav-offset', `${navHeight}px`);
  };

  useEffect(() => {
    updateNavOffset();
    const onResize = () => updateNavOffset();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // keep shadow / compact state responsive
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // IntersectionObserver for active section detection
    const sections = [
      "home",
      "about",
      "projects",
      "team",
      "media",
      "career",
      "contact",
    ];

    let observer;

    // Get the current nav height inside the effect to ensure it's up to date
    const setupObserver = () => {
      const navHeight = navRef.current ? navRef.current.offsetHeight : 80;

      const observerOptions = {
        root: null,
        rootMargin: `-${navHeight}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      const elems = sections.map(id => document.getElementById(id)).filter(Boolean);

      if (elems.length) {
        // Disconnect previous observer if it exists
        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
          // Filter entries that are actually intersecting
          const intersectingEntries = entries.filter(e => e.isIntersecting);

          if (intersectingEntries.length > 0) {
            // Sort by intersection ratio to get the most visible section
            const mostVisible = intersectingEntries.sort(
              (a, b) => b.intersectionRatio - a.intersectionRatio
            )[0];

            if (mostVisible) {
              setActiveSection(mostVisible.target.id);
            }
          }
        }, observerOptions);

        elems.forEach(el => observer.observe(el));
      }
    };

    // Initial setup
    setupObserver();

    // Update observer on resize (when nav height might change)
    const handleResize = () => {
      setupObserver();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, []); // Empty dependency array is correct here

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // Use scrollIntoView so it works with any scroll container
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login-selection');
  };

  const navItems = [
    { label: "Home", id: "home", icon: "🏠" },
    { label: "About", id: "about", icon: "📖" },
    { label: "Projects", id: "projects", icon: "🚀" },
    { label: "Team", id: "team", icon: "👥" },
    { label: "Media", id: "media", icon: "🎥" },
    { label: "Career", id: "career", icon: "💼" },
    { label: "Contact", id: "contact", icon: "📞" },
  ];

  const accentColors = {
    orange: {
      light: "#f97316",
      dark: "#ea580c",
      glow: "rgba(249, 115, 22, 0.3)",
      text: "from-orange-400 to-orange-600"
    },
    teal: {
      light: "#14b8a6",
      dark: "#0d9488",
      glow: "rgba(20, 184, 166, 0.3)",
      text: "from-teal-400 to-teal-600"
    },
    green: {
      light: "#22c55e",
      dark: "#16a34a",
      glow: "rgba(34, 197, 94, 0.3)",
      text: "from-green-400 to-green-600"
    }
  };

  const currentAccent = accentColors[accent];

  // Animation variants
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  };

  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  const textGlowVariants = {
    initial: { textShadow: "0 0 0px currentColor" },
    glow: {
      textShadow: [
        "0 0 5px currentColor",
        "0 0 15px currentColor",
        "0 0 5px currentColor"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  // Determine if we should show full nav or compact nav based on screen width
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1366);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show compact nav for screens between 1280px and 1440px
  const showCompactNav = windowWidth >= 1280 && windowWidth <= 1440;

  return (
    <>
      <motion.nav
        ref={navRef}
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`
          fixed top-0 left-0 right-0 z-50 
          transition-all duration-500 px-4 sm:px-6 lg:px-8
          ${scrolled
            ? "py-2 sm:py-3 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] shadow-lg"
            : "py-4 sm:py-6 bg-transparent"
          }
        `}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            whileHover="hover"
            variants={logoVariants}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => scrollTo("home")}
          >
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full blur-md"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundColor: currentAccent.light }}
              />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-all duration-300"
                style={{ borderColor: currentAccent.light }}
              >
                <img
                  src="/thrikaal_logo.png"
                  alt="Thrikaal Verse"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="block">
              <motion.h1
                className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter uppercase leading-none whitespace-nowrap"
                style={{
                  color: currentAccent.light,
                  textShadow: `0 0 10px ${currentAccent.glow}`
                }}
                variants={textGlowVariants}
                initial="initial"
                animate="glow"
                whileHover={{ scale: 1.05, x: 2 }}
              >
                Thrikaal Verse
              </motion.h1>

              <motion.div
                className="flex justify-end"
                whileHover={{ scale: 1.1 }}
              >
                <motion.p
                  className="text-[10px] sm:text-xs font-bold tracking-[0.2em] leading-none mt-0 whitespace-nowrap"
                  style={{
                    color: mode === 'dark' ? currentAccent.light : currentAccent.dark,
                    opacity: 0.9
                  }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Pvt.Ltd
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop Navigation - Different layouts based on screen size */}
          <div className="hidden xl:flex items-center justify-end flex-1">
            {showCompactNav ? (
              /* Compact Navigation for 1280px to 1440px (includes 1366x768) */
              <>
                <div className="flex items-center gap-1">
                  {/* Show only first 4 items in compact mode */}
                  {navItems.slice(0, 4).map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      className={`
                        relative px-3 py-2 text-sm font-medium tracking-wide rounded-lg
                        transition-all duration-300 overflow-hidden group whitespace-nowrap
                        ${activeSection === item.id
                          ? "text-white"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          className="absolute inset-x-2 bottom-1 h-1 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${currentAccent.light}, ${currentAccent.dark})`
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}

                  {/* More dropdown for remaining items */}
                  <div className="relative group">
                    <motion.button
                      className="relative px-3 py-2 text-sm font-medium tracking-wide rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span>More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>

                      {/* Dropdown menu */}
                      <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        {navItems.slice(4).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => scrollTo(item.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--border-color)] flex items-center gap-2"
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--border-color)] flex-shrink-0">
                  {/* Theme Selector */}
                  <div className="flex gap-1.5">
                    {Object.entries(accentColors).map(([colorName, colorValue]) => (
                      <motion.button
                        key={colorName}
                        onClick={() => setAccent(colorName)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={`
                          relative w-5 h-5 rounded-full transition-all duration-300
                          ${accent === colorName ? "ring-2 ring-offset-2 ring-[var(--text-primary)]" : ""}
                        `}
                        style={{
                          backgroundColor: colorValue.light,
                          boxShadow: accent === colorName ? `0 0 15px ${colorValue.glow}` : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <motion.button
                    onClick={toggleMode}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors relative overflow-hidden group"
                  >
                    {mode === "dark" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </motion.button>

                  {/* Login Button */}
                  <motion.button
                    onClick={handleLoginClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-5 py-2 text-white text-sm font-bold rounded-full overflow-hidden group whitespace-nowrap"
                    style={{ boxShadow: `0 4px 15px ${currentAccent.glow}` }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${currentAccent.light}, ${currentAccent.dark})`
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      LOGIN
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </div>
              </>
            ) : (
              /* Full Navigation for larger screens */
              <>
                <div className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      className={`
                        relative px-4 py-2 text-sm font-medium tracking-wide rounded-lg
                        transition-all duration-300 overflow-hidden group whitespace-nowrap
                        ${activeSection === item.id
                          ? "text-white"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          className="absolute inset-x-2 bottom-1 h-1 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${currentAccent.light}, ${currentAccent.dark})`
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--border-color)] flex-shrink-0">
                  {/* Theme Selector */}
                  <div className="flex gap-2">
                    {Object.entries(accentColors).map(([colorName, colorValue]) => (
                      <motion.button
                        key={colorName}
                        onClick={() => setAccent(colorName)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={`
                          relative w-6 h-6 rounded-full transition-all duration-300
                          ${accent === colorName ? "ring-2 ring-offset-2 ring-[var(--text-primary)]" : ""}
                        `}
                        style={{
                          backgroundColor: colorValue.light,
                          boxShadow: accent === colorName ? `0 0 15px ${colorValue.glow}` : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <motion.button
                    onClick={toggleMode}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors relative overflow-hidden group"
                  >
                    {mode === "dark" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </motion.button>

                  {/* Login Button */}
                  <motion.button
                    onClick={handleLoginClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-6 py-2.5 text-white text-sm font-bold rounded-full overflow-hidden group whitespace-nowrap"
                    style={{ boxShadow: `0 4px 15px ${currentAccent.glow}` }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${currentAccent.light}, ${currentAccent.dark})`
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      LOGIN
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {/* Tablet Navigation */}
          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <motion.button
              onClick={handleLoginClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-white text-sm font-bold rounded-full whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${currentAccent.light}, ${currentAccent.dark})`,
                boxShadow: `0 4px 10px ${currentAccent.glow}`
              }}
            >
              LOGIN
            </motion.button>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
            >
              <motion.div
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <motion.button
              onClick={toggleMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
            >
              {mode === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>

            <motion.button
              onClick={handleLoginClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-white text-sm font-bold rounded-full whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${currentAccent.light}, ${currentAccent.dark})`,
                boxShadow: `0 4px 10px ${currentAccent.glow}`
              }}
            >
              LOGIN
            </motion.button>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
            >
              <motion.div
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-80 z-50 lg:hidden overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--bg-primary) 0%, ${currentAccent.dark}20 100%)`,
                backdropFilter: 'blur(10px)',
                borderLeft: `1px solid ${currentAccent.light}30`
              }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative w-12 h-12">
                      <motion.div
                        className="absolute inset-0 rounded-full blur-md"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{ backgroundColor: currentAccent.light }}
                      />
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2"
                        style={{ borderColor: currentAccent.light }}
                      >
                        <img src="/thrikaal_logo.png" alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <motion.h2
                        className="text-xl font-bold"
                        style={{ color: currentAccent.light }}
                        animate={{
                          textShadow: [
                            `0 0 5px ${currentAccent.glow}`,
                            `0 0 15px ${currentAccent.glow}`,
                            `0 0 5px ${currentAccent.glow}`
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Menu
                      </motion.h2>
                      <p className="text-xs text-[var(--text-secondary)]">Navigate to sections</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        w-full px-6 py-4 flex items-center gap-4 text-left
                        transition-all duration-300 relative overflow-hidden
                        ${activeSection === item.id
                          ? 'text-white'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }
                      `}
                      whileHover={{ x: 10 }}
                    >
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="mobileActive"
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: currentAccent.light }}
                        />
                      )}
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <p className="text-xs opacity-60">Click to navigate</p>
                      </div>
                      <motion.div
                        className="absolute right-6"
                        animate={{ x: activeSection === item.id ? 5 : 0 }}
                        style={{ color: currentAccent.light }}
                      >
                        →
                      </motion.div>
                    </motion.button>
                  ))}
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[var(--text-secondary)]">Theme Colors</span>
                    <div className="flex gap-2">
                      {Object.keys(accentColors).map((color) => (
                        <motion.button
                          key={color}
                          onClick={() => {
                            setAccent(color);
                          }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: accentColors[color].light }}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.p
                    className="text-xs text-center mb-3"
                    style={{ color: currentAccent.light }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✦ Thrikaal Verse Pvt.Ltd ✦
                  </motion.p>

                  <motion.button
                    onClick={handleLoginClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 text-white font-bold rounded-lg text-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${currentAccent.light}, ${currentAccent.dark})`,
                      boxShadow: `0 4px 15px ${currentAccent.glow}`
                    }}
                  >
                    Login to Account
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;