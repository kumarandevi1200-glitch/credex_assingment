'use client';

import { CountUp } from '@/components/count-up';
import { FindingCard } from '@/components/finding-card';
import { EmailGate } from '@/components/email-gate';
import { AuditFinding, AuditResult } from '@/lib/audit-engine';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface AuditData {
  id: string;
  ai_summary: string;
}

interface ResultsClientContentProps {
  shareId: string;
  data: AuditData;
  result: AuditResult;
  isOptimal: boolean;
}

export function ResultsClientContent({ shareId, data, result, isOptimal }: ResultsClientContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerEmail = () => {
    window.dispatchEvent(new Event('spendlens-trigger-email'));
  };

  return (
    <>
      {/* HERO BLOCK - DARK */}
      <section className="relative min-h-[70vh] bg-[var(--color-ink)] flex flex-col overflow-hidden">
        {/* Animated Background Gradients */}
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-40"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
          style={{ 
            backgroundSize: '200% 200%',
            backgroundImage: 'radial-gradient(circle at top left, var(--color-savings) 0%, transparent 20%), radial-gradient(circle at bottom right, var(--color-accent) 0%, transparent 15%)' 
          }}
        />

        {/* Top Nav */}
        <div className="relative z-10 flex justify-between items-center px-8 py-6 max-w-[1280px] w-full mx-auto">
          <Link href="/" className="font-mono text-[12px] text-[var(--color-paper)]/70 hover:text-[var(--color-paper)] transition-colors">
            ← New Audit
          </Link>
          <button onClick={handleCopy} className="font-mono text-[12px] text-[var(--color-paper)]/70 hover:text-[var(--color-paper)] transition-colors">
            Share This Report
          </button>
        </div>

        {/* Hero Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 max-w-[800px] w-full mx-auto text-center py-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-savings)] mb-4">
            AUDIT COMPLETE
          </div>
          
          <div className="mb-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-paper)]/60 mb-2">
              MONTHLY SAVINGS IDENTIFIED
            </div>
            <div className="font-serif italic text-[80px] md:text-[112px] leading-none text-[var(--color-paper)]">
              <CountUp end={result.totalMonthlySavings} prefix="$" />
            </div>
            <div className="font-mono text-[16px] text-[var(--color-savings)] mt-4">
              · that&apos;s ${result.totalAnnualSavings.toLocaleString()} every year ·
            </div>
          </div>

          <p className="font-sans text-[18px] text-[var(--color-paper)]/80 max-w-[560px] leading-[1.7] mb-10">
            {data.ai_summary.replace(/<[^>]*>?/gm, '')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={triggerEmail}
              className="border border-[var(--color-paper)]/40 text-[var(--color-paper)] font-sans text-[14px] px-8 py-3 hover:bg-[var(--color-paper)]/10 transition-colors w-full sm:w-auto"
            >
              ↓ Save This Report
            </button>
            <button 
              onClick={handleCopy}
              className="bg-[var(--color-savings)] text-[var(--color-ink)] font-sans font-medium text-[14px] px-8 py-3 hover:brightness-105 transition-all w-full sm:w-auto"
            >
              ↗ {copied ? 'Copied ✓' : 'Share'}
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="relative z-10 font-mono text-[12px] text-[var(--color-paper)]/40 text-center pb-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.div>
      </section>

      {/* FINDINGS SECTION - LIGHT */}
      <section className="bg-[var(--color-paper)] w-full py-24">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-8">
            TOOL-BY-TOOL BREAKDOWN
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
          >
            {result.findings.map((finding: AuditFinding, idx: number) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
                }}
              >
                <FindingCard finding={finding} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TOTALS BAR - DARK */}
      <section className="bg-[var(--color-ink)] w-full">
        <div className="max-w-[1280px] mx-auto px-8 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div className="pl-4 border-l-2 border-[var(--color-savings)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-2">Monthly savings</div>
              <div className="font-mono text-2xl text-[var(--color-paper)]">${result.totalMonthlySavings}/mo</div>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-2">Annual savings</div>
              <div className="font-mono text-2xl text-[var(--color-paper)]">${result.totalAnnualSavings}/yr</div>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)] mb-2">Tools reviewed</div>
              <div className="font-mono text-2xl text-[var(--color-paper)]">{result.findings.length}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONDITIONAL CTA / OPTIMAL */}
      {result.totalMonthlySavings > 500 ? (
        <section 
          className="w-full relative" 
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, var(--color-rule) 0, var(--color-rule) 1px, transparent 1px, transparent 8px)',
            opacity: 0.8
          }}
        >
          <div className="absolute inset-0 bg-[var(--color-paper)] opacity-90" />
          <div className="relative z-10 max-w-[1280px] mx-auto px-8 md:px-16 py-24 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
            
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-warn)] mb-4">SIGNIFICANT OVERSPEND DETECTED</div>
              <h2 className="font-serif italic text-4xl md:text-[42px] text-[var(--color-ink)] leading-[1.1] mb-6">
                You&apos;re leaving ${result.totalAnnualSavings.toLocaleString()}<br />
                on the table this year.
              </h2>
              <p className="font-sans text-[16px] text-[var(--color-muted)] max-w-[440px] leading-relaxed mb-8">
                Credex sources discounted AI credits from companies that overforecast or pivoted. 
                The savings you just identified — you could capture most of them without switching tools.
              </p>
              <button className="bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-medium text-[18px] px-10 py-4 hover:bg-[var(--color-accent)] transition-colors duration-150 rounded-none w-full sm:w-auto">
                Book a Free 20-min Call →
              </button>
              <p className="mt-3 font-mono text-[11px] text-[var(--color-muted)]">No obligation. We&apos;ll tell you honestly if we can help.</p>
            </div>

            <div className="bg-[var(--color-paper-dim)] border border-[var(--color-rule)] p-8">
              <table className="w-full font-mono text-[12px] text-left">
                <thead>
                  <tr className="text-[var(--color-muted)]">
                    <th className="pb-4 font-normal">TOOL</th>
                    <th className="pb-4 font-normal">RETAIL</th>
                    <th className="pb-4 font-normal">CREDEX</th>
                    <th className="pb-4 font-normal">SAVE</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-ink)]">
                  <tr className="border-t border-[var(--color-rule)]">
                    <td className="py-3">Cursor Pro</td><td className="py-3">$20/seat</td><td className="py-3">$14/seat</td><td className="py-3 text-[var(--color-savings)]">30%</td>
                  </tr>
                  <tr className="border-t border-[var(--color-rule)]">
                    <td className="py-3">Claude Team</td><td className="py-3">$30/seat</td><td className="py-3">$22/seat</td><td className="py-3 text-[var(--color-savings)]">27%</td>
                  </tr>
                  <tr className="border-t border-[var(--color-rule)]">
                    <td className="py-3">ChatGPT Team</td><td className="py-3">$30/seat</td><td className="py-3">$21/seat</td><td className="py-3 text-[var(--color-savings)]">30%</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 font-mono text-[10px] text-[var(--color-muted)]">
                Representative pricing. Actual discounts vary by volume.
              </div>
            </div>

          </div>
        </section>
      ) : isOptimal && (
        <section className="bg-[var(--color-paper-dim)] py-20 px-8">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="font-serif italic text-3xl md:text-[36px] text-[var(--color-ink)] mb-4">You&apos;re spending well. Seriously.</h2>
            <p className="font-sans text-[16px] text-[var(--color-muted)] mb-10 leading-relaxed">
              Your stack is lean and well-matched to your team size. 
              We found no significant savings this round. That&apos;s actually good news.
            </p>
            
            <form className="flex flex-col items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)] block mb-2">
                GET NOTIFIED WHEN PRICING CHANGES AFFECT YOUR STACK
              </label>
              <div className="flex flex-col sm:flex-row w-full max-w-[400px] gap-4">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 bg-transparent border-b border-[var(--color-muted)]/40 font-sans text-sm pb-2 focus:outline-none focus:border-[var(--color-accent)]" 
                />
                <button type="button" className="border border-[var(--color-ink)] text-[var(--color-ink)] text-sm px-6 py-2 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] transition-colors">
                  Notify Me
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* SHARE ROW */}
      <section className="bg-[var(--color-paper)] border-t border-[var(--color-rule)]">
        <div className="max-w-[1280px] mx-auto px-8 md:px-16 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[13px] text-[var(--color-muted)] uppercase tracking-wide">SHARE THIS AUDIT</div>
          
          <div className="flex items-center gap-4 md:gap-8 font-sans text-[14px] text-[var(--color-ink)]">
            <button onClick={handleCopy} className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              {copied ? 'Copied ✓' : 'Copy Link'}
            </button>
            <span className="text-[var(--color-muted)]">·</span>
            <a href={`https://twitter.com/intent/tweet?text=I just ran a free AI spend audit with SpendLens.&url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              Share on X
            </a>
            <span className="text-[var(--color-muted)]">·</span>
            <button className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed" title="Coming soon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download PDF
            </button>
          </div>

          <div className="font-mono text-[11px] text-[var(--color-muted)]">
            Audit ID: {shareId}
          </div>
        </div>
      </section>

      {/* EMAIL GATE SHEET */}
      <EmailGate auditId={data.id} isOptimal={isOptimal} />
    </>
  );
}
