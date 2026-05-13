'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function EmailGate({ auditId, isOptimal: _isOptimal }: { auditId: string; isOptimal: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Listen for custom event from the "Save This Report" button
    const handleTrigger = () => {
      if (!isDismissed) setIsOpen(true);
    };
    window.addEventListener('spendlens-trigger-email', handleTrigger);
    
    // Timer trigger
    const timer = setTimeout(() => {
      if (!isDismissed && status === 'idle') setIsOpen(true);
    }, 45000);

    return () => {
      window.removeEventListener('spendlens-trigger-email', handleTrigger);
      clearTimeout(timer);
    };
  }, [isDismissed, status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const company = fd.get('company') as string;
    const role = fd.get('role') as string;
    
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role, auditId })
      });
      
      if (!res.ok) throw new Error();
      setStatus('success');
      
      setTimeout(() => {
        setIsOpen(false);
        setIsDismissed(true);
      }, 2500);
      
    } catch {
      setStatus('error');
      // Briefly show error then revert
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.4, ease: "easeOut" as const }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-paper)] border-t border-[var(--color-rule)] shadow-2xl"
          style={{ maxHeight: '320px' }}
        >
          <div className="max-w-[560px] mx-auto px-6 py-8 relative">
            <button 
              onClick={() => { setIsOpen(false); setIsDismissed(true); }}
              className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-ink)] p-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 1L1 13M1 1L13 13" />
              </svg>
            </button>

            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <div className="font-serif italic text-2xl md:text-[28px] text-[var(--color-savings)] mb-2">
                  ↗ Check your inbox.
                </div>
                <div className="font-sans text-[15px] text-[var(--color-muted)]">
                  Your report is on its way.
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-sans font-medium text-[20px] text-[var(--color-ink)] mb-1">
                  Save your audit report
                </h3>
                <p className="font-sans text-[14px] text-[var(--color-muted)] mb-8 max-w-[480px]">
                  We&apos;ll email you the full breakdown plus flag any new savings as pricing changes.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Work email *</label>
                      <input 
                        name="email" type="email" required 
                        className="w-full font-sans text-sm text-[var(--color-ink)] bg-transparent border-b border-[var(--color-muted)]/40 pb-1 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 rounded-none transition-colors"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Company (optional)</label>
                      <input 
                        name="company" type="text" 
                        className="w-full font-sans text-sm text-[var(--color-ink)] bg-transparent border-b border-[var(--color-muted)]/40 pb-1 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 rounded-none transition-colors"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Role (optional)</label>
                      <input 
                        name="role" type="text" 
                        className="w-full font-sans text-sm text-[var(--color-ink)] bg-transparent border-b border-[var(--color-muted)]/40 pb-1 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 rounded-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="font-mono text-[11px] text-[var(--color-muted)] max-w-[320px]">
                      Credex may follow up for audits showing &gt;$500/mo in savings. Unsubscribe anytime.
                    </div>
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full md:w-auto bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-medium text-[15px] px-8 py-3 rounded-none hover:bg-[var(--color-accent)] transition-colors duration-150 disabled:opacity-70"
                    >
                      {status === 'loading' ? 'Sending...' : status === 'error' ? 'Error. Try again.' : 'Send My Report →'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
