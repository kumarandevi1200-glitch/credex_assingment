'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { X, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function EmailGate({ auditId, isOptimal }: { auditId: string, isOptimal: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Auto-trigger after 30 seconds
    const timer = setTimeout(() => {
      if (!submitted) setIsOpen(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!z.string().email().safeParse(email).success) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, email, companyName: company })
      });
      
      if (res.ok) {
        setSubmitted(true);
        setIsOpen(false);
        toast.success("Saved! Check your inbox. We'll reach out if we found significant savings.");
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to submit. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    if (submitted) return null;
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border border-[#202028] bg-[#13131A] hover:bg-[#1A1A24] rounded-lg flex flex-col items-center justify-center gap-2 transition-colors mt-8"
      >
        <Mail className="w-5 h-5 text-gray-400" />
        <span className="font-medium">
          {isOptimal ? 'Notify me when optimizations apply to my stack' : 'Save this report & discuss savings'}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#13131A] border border-[#202028] rounded-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold font-serif mb-2">Save Your Audit</h2>
          <p className="text-gray-400 text-sm">
            {isOptimal 
              ? "Drop your email to get notified if pricing changes or better alternatives emerge for your stack."
              : "We'll email you a copy of this report. If your savings are substantial, we can help you capture them."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Work Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@startup.com"
              className="w-full bg-[#0A0A0F] border border-[#202028] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#00E5A0]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company Name <span className="text-gray-500 font-normal">(Optional)</span></label>
            <input 
              type="text" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
              className="w-full bg-[#0A0A0F] border border-[#202028] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#00E5A0]"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00E5A0] hover:bg-[#00D090] text-[#0A0A0F] font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Send My Report'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            We'll never share your data. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}
