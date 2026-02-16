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
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="flex flex-col lg:flex-row gap-20">
        <div className="lg:w-1/3">
          <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.4em] mb-4">Contact</h2>
          <h3 className="text-4xl font-black mb-8">Secure an <span className="text-teal-500">Alliance</span></h3>
          <p className="text-gray-500 mb-12">Reach out to our global headquarters for partnership inquiries or technical consultation.</p>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 text-orange-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2} /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2} /></svg></div>
              <div>
                <h4 className="font-bold text-white">Headquarters</h4>
                <p className="text-sm text-gray-500">H No. 909, SA Society, Khanamet, Madhapur, Hyderabad, Telangana, India, 500081</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 text-teal-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2} /></svg></div>
              <div>
                <h4 className="font-bold text-white">General Inquiries</h4>
                <p className="text-sm text-gray-500">thrikaalverse@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" placeholder="John Doe" disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors" placeholder="john@example.com" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Inquiry Details</label>
                    <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors resize-none" placeholder="How can we help you?" disabled={isLoading} />
                  </div>
                  <button type="submit" disabled={isLoading} className={`w-full py-4 text-white font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'}`}>
                    {isLoading ? (<div className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</div>) : ('Send Transmission')}
                  </button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mb-6"><svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                  <h4 className="text-2xl font-bold mb-2">Transmission Received</h4>
                  <p className="text-gray-500">Our coordination team will respond shortly.</p>
                  <p className="text-sm text-gray-400 mt-4">An email has been sent to thrikaalverse@gmail.com</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
