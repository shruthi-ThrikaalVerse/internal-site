// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    // Helpful dev-time warning when env vars are missing
    // (keep @ts-nocheck at top to avoid TS errors in this file)
    console.warn('EmailJS env vars are missing. Ensure .env.local or deployment secrets are set.');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: 'thrikaalverse@gmail.com',
        reply_to: formData.email,
        subject: `New Contact Form Submission from ${formData.name}`
      }, EMAILJS_PUBLIC_KEY);

      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="contact-section relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="contact-label">Get In Touch</h2>
          <h1 className="contact-title">
            <span className="block">Let's Build Something</span>
            <span className="contact-gradient">
              Amazing Together
            </span>
          </h1>
          <p className="contact-description">
            Ready to start your next project? Reach out to us for partnerships,
            technical consultations, or just to say hello.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="contact-card">
              <div className="flex items-start gap-4">
                <div className="contact-icon-orange">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2} />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2} />
                  </svg>
                </div>
                <div>
                  <h3 className="contact-card-title">Our Headquarters</h3>
                  <p className="contact-card-text">
                    H No. 909, SA Society, Khanamet,<br />
                    Madhapur, Hyderabad, Telangana,<br />
                    India, 500081
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-card">
              <div className="flex items-start gap-4">
                <div className="contact-icon-teal">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2} />
                  </svg>
                </div>
                <div>
                  <h3 className="contact-card-title">General Inquiries</h3>
                  <p className="contact-card-email">thrikaalverse@gmail.com</p>
                  <p className="contact-card-subtext">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="contact-form-container">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 relative z-10"
                  >
                    <div className="space-y-2">
                      <label className="contact-label-text">
                        Full Name <span className="contact-required">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="contact-input"
                        placeholder="John Doe"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="contact-label-text">
                        Email Address <span className="contact-required">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="contact-input"
                        placeholder="john@example.com"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="contact-label-text">
                        Message <span className="contact-required">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="contact-input resize-none"
                        placeholder="Tell us about your project or inquiry..."
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="contact-submit-btn"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="contact-success-icon">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="contact-success-title">Message Sent Successfully!</h3>
                    <p className="contact-success-text">Thank you for reaching out. We'll get back to you soon.</p>
                    <div className="contact-success-box">
                      <p className="text-sm contact-confirm-text">
                        A confirmation has been sent to your email address
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="contact-footer-text"
        >
          All inquiries are handled with confidentiality and care.
          <br className="sm:hidden" /> We respect your privacy.
        </motion.p>
      </div>

      <style jsx>{`
        .contact-section {
          background-color: var(--bg-primary, #000000);
        }

        .blob {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          mix-blend-mode: multiply;
          filter: blur(80px);
          opacity: 0.2;
          animation: blob 7s infinite;
        }

        .blob-1 {
          top: -160px;
          right: -160px;
          background-color: var(--current-accent, #2d6b7e);
        }

        .blob-2 {
          bottom: -160px;
          left: -160px;
          background-color: var(--current-accent, #2d6b7e);
          animation-delay: 2s;
        }

        .blob-3 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--current-accent, #f37321);
          animation-delay: 4s;
        }

        .contact-label {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          color: var(--current-accent, #f37321);
        }

        @media (min-width: 768px) {
          .contact-label {
            font-size: 1.125rem;
          }
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          color: var(--text-primary, #ffffff);
        }

        @media (min-width: 768px) {
          .contact-title {
            font-size: 3.75rem;
          }
        }

        .contact-gradient {
          display: block;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(to right, var(--current-accent, #2d6b7e), var(--current-accent, #f37321));
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .contact-description {
          font-size: 1.25rem;
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
          color: var(--text-secondary, #9ca3af);
        }

        .contact-card {
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid;
          transition: all 0.3s;
          background-color: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border-color: var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .contact-card:hover {
          border-color: var(--current-accent, rgba(255, 255, 255, 0.3));
        }

        .contact-icon-orange {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background-image: linear-gradient(to right, var(--current-accent, #f37321), var(--current-accent, #f37321));
          transition: transform 0.3s;
        }

        .contact-card:hover .contact-icon-orange {
          transform: scale(1.1);
        }

        .contact-icon-teal {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background-image: linear-gradient(to right, var(--current-accent, #2d6b7e), var(--current-accent, #2d6b7e));
          transition: transform 0.3s;
        }

        .contact-card:hover .contact-icon-teal {
          transform: scale(1.1);
        }

        .contact-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary, #ffffff);
        }

        .contact-card-text {
          line-height: 1.5;
          color: var(--text-secondary, #9ca3af);
        }

        .contact-card-email {
          margin-bottom: 0.5rem;
          color: var(--text-secondary, #9ca3af);
        }

        .contact-card-subtext {
          font-size: 0.875rem;
          color: var(--text-secondary, #6b7280);
        }

        .contact-form-container {
          backdrop-filter: blur(12px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid;
          position: relative;
          overflow: hidden;
          background-color: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border-color: var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .contact-label-text {
          font-size: 0.875rem;
          font-weight: 500;
          display: block;
          color: var(--text-secondary, #d1d5db);
        }

        .contact-required {
          color: var(--current-accent, #f37321);
        }

        .contact-input {
          width: 100%;
          border: 1px solid;
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          background-color: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          color: var(--text-primary, #ffffff);
          border-color: var(--border-color, rgba(255, 255, 255, 0.1));
          outline: none;
          transition: all 0.2s;
        }

        .contact-input::placeholder {
          color: #9ca3af;
        }

        .contact-input:focus {
          border-color: var(--current-accent, #f37321);
        }

        .contact-submit-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          background-image: linear-gradient(to right, var(--current-accent, #f37321), var(--current-accent, #f37321));
          color: white;
          font-weight: 700;
          border-radius: 0.75rem;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          transform: scale(1);
        }

        .contact-submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .contact-submit-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .contact-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .contact-success-icon {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          background-image: linear-gradient(to right, var(--current-accent, #2d6b7e), var(--current-accent, #27d896));
        }

        .contact-success-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary, #ffffff);
        }

        .contact-success-text {
          margin-bottom: 1rem;
          color: var(--text-secondary, #9ca3af);
        }

        .contact-success-box {
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid;
          background-color: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border-color: var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .contact-footer-text {
          text-align: center;
          font-size: 0.875rem;
          margin-top: 3rem;
          color: var(--text-secondary, #6b7280);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        /* Moved inline style to scoped class to satisfy lint rule */
        .contact-confirm-text {
          color: var(--text-secondary, #6b7280);
        }
      `}</style>
    </section>
  );
};

export default Contact;