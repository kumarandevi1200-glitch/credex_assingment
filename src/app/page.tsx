'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_DATA } from '@/lib/pricing-data';
import { ToolCard } from '@/components/tool-card';
import { UserToolInput } from '@/lib/audit-engine';
import { toast } from 'sonner';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Ticker Component for the Hero
const TICKER_DATA = [
  { tool: 'Cursor Pro', details: '12 seats · $240/mo', action: 'Switch to Hobby + 4 seats', save: 160 },
  { tool: 'GitHub Copilot', details: 'Business · $228/mo', action: 'Redundant with Cursor', save: 228 },
  { tool: 'Claude Max', details: '3 seats · $300/mo', action: 'Downgrade to Pro', save: 240 },
  { tool: 'ChatGPT Plus', details: '5 seats · $100/mo', action: 'Consolidate to Team', save: -50 }, // Example of optimal/increase
  { tool: 'Midjourney', details: 'Pro · $60/mo', action: 'Downgrade to Basic', save: 50 },
];

function HeroTicker() {
  const [items, setItems] = useState(TICKER_DATA.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev.slice(1)];
        next.push(TICKER_DATA[currentIndex % TICKER_DATA.length]);
        return next;
      });
      setCurrentIndex(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const totalSaved = items.reduce((acc, item) => item.save > 0 ? acc + item.save : acc, 0);

  return (
    <div className="flex flex-col gap-3 relative h-full justify-center">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={`${item.tool}-${currentIndex - items.length + i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 rounded-2xl shadow-soft"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-sans font-medium text-[var(--color-ink)]">{item.tool}</div>
                <div className="font-mono text-xs text-[var(--color-muted)]">{item.details}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="text-[var(--color-muted)]">
                <span className="text-[var(--color-rule)] mr-2">↘</span>
                {item.action}
              </div>
              {item.save > 0 && (
                <div className="font-mono font-medium text-[var(--color-savings)] uppercase text-[11px] tracking-wide">
                  Save ${item.save}/mo
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="mt-4 border-t border-[var(--color-rule)] pt-4 flex justify-between items-end">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Total Identified</div>
        <div className="text-right">
          <div className="font-mono text-2xl text-[var(--color-savings)]">${totalSaved}/mo</div>
          <div className="font-mono text-xs text-[var(--color-muted)]">(${totalSaved * 12}/yr)</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const navBg = useTransform(scrollY, [0, 100], ['rgba(245, 240, 232, 0)', 'rgba(245, 240, 232, 0.9)']);
  const navBorder = useTransform(scrollY, [0, 100], ['rgba(212, 207, 195, 0)', 'rgba(212, 207, 195, 1)']);
  
  // Form State via React Hook Form & Zod
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FormSchema = z.object({
    teamSize: z.number().min(1),
    useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
    website: z.string().optional(),
    toolsState: z.record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        planId: z.string(),
        seats: z.number().min(1),
        monthlySpend: z.number().min(0)
      })
    )
  });

  const { watch, setValue, handleSubmit: rhfSubmit, reset, register } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { teamSize: 1, useCase: 'mixed', toolsState: {} }
  });

  const teamSize = watch('teamSize');
  const useCase = watch('useCase');
  const toolsState = watch('toolsState');

  type ToolStateObj = { enabled: boolean; planId: string; seats: number; monthlySpend: number };

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('spendlens_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teamSize || parsed.toolsState) {
          reset({ 
            teamSize: parsed.teamSize || 1, 
            useCase: (parsed.useCase || 'mixed') as "coding" | "writing" | "data" | "research" | "mixed", 
            toolsState: parsed.toolsState || {} 
          });
          return;
        }
      } catch { }
    }
    
    const initial: Record<string, ToolStateObj> = {};
    Object.keys(PRICING_DATA).forEach(id => {
      const tool = PRICING_DATA[id];
      const defaultPlanId = Object.keys(tool.plans)[0];
      initial[id] = { enabled: false, planId: defaultPlanId, seats: 1, monthlySpend: tool.plans[defaultPlanId]?.pricePerSeat || 0 };
    });
    setValue('toolsState', initial);
  }, [reset, setValue]);

  useEffect(() => {
    if (isClient && toolsState && Object.keys(toolsState).length > 0) {
      localStorage.setItem('spendlens_form', JSON.stringify({ teamSize, useCase, toolsState }));
    }
  }, [teamSize, useCase, toolsState, isClient]);

  const handleToolUpdate = (toolId: string, field: string, value: string | number | boolean) => {
    const stateRecord = toolsState as Record<string, ToolStateObj> | undefined;
    const current = stateRecord?.[toolId];
    if (!current) return;
    
    let newSpend = current.monthlySpend;
    if (field === 'planId' || field === 'seats') {
      const pId = (field === 'planId' ? value : current.planId) as string;
      const s = (field === 'seats' ? value : current.seats) as number;
      const price = PRICING_DATA[toolId].plans[pId]?.pricePerSeat || 0;
      newSpend = price * s;
    }
    
    const updatedValue = { 
      ...current, 
      [field]: value, 
      ...(field === 'planId' || field === 'seats' ? { monthlySpend: newSpend } : {}) 
    } as ToolStateObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(`toolsState.${toolId}` as any, updatedValue as any);
  };

  const onSubmitForm = async (data: z.infer<typeof FormSchema>) => {
    const stateRecord = data.toolsState as Record<string, ToolStateObj>;
    const activeTools = Object.keys(stateRecord).filter(id => stateRecord[id].enabled);
    if (activeTools.length === 0) {
      toast.error("Please select at least one tool to audit.");
      return;
    }
    setIsSubmitting(true);
    const payloadTools: UserToolInput[] = activeTools.map(id => ({
      toolId: id,
      planId: stateRecord[id].planId,
      seats: stateRecord[id].seats,
      monthlySpend: stateRecord[id].monthlySpend,
      useCase: data.useCase as "coding" | "writing" | "data" | "research" | "mixed"
    }));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: payloadTools, teamSize: data.teamSize, useCase: data.useCase, website: data.website })
      });
      if (!res.ok) throw new Error('Failed to audit');
      const apiData = await res.json();
      if (apiData.fake) {
        toast.success("Audit complete!");
        setIsSubmitting(false);
        return;
      }
      router.push(`/audit/${apiData.shareId}`);
    } catch {
      toast.error("Something went wrong processing your audit.");
      setIsSubmitting(false);
    }
  };

  const typedToolsState = toolsState as Record<string, ToolStateObj> | undefined;
  const totalMonthlyCalculated = typedToolsState ? Object.keys(typedToolsState)
    .filter(id => typedToolsState[id].enabled)
    .reduce((sum, id) => sum + typedToolsState[id].monthlySpend, 0) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  if (!isClient) return null;

  return (
    <>
      <motion.nav 
        style={{ backgroundColor: navBg, borderBottomColor: navBorder, borderBottomWidth: '1px' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-colors"
      >
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-mono font-bold text-[14px] flex items-center gap-2">
            <span className="text-[var(--color-savings)]">◉</span> SpendLens
          </div>
          <div className="flex items-center gap-6">
            <span className="font-sans text-xs text-[var(--color-muted)]">Built by Credex</span>
            <a 
              href="#audit-form" 
              className="font-sans text-sm relative group cursor-pointer text-[var(--color-ink)]"
            >
              Audit My Stack →
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[var(--color-ink)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          </div>
        </div>
      </motion.nav>

      <main className="bg-gradient-to-b from-[var(--color-paper)] to-[var(--color-paper-dim)] relative overflow-hidden min-h-screen">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-savings)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="min-h-[100vh] flex items-center pt-16">
          <div className="max-w-[1280px] mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-[58%_42%] gap-16 relative z-10">
            <motion.div 
              style={{ y: heroY }}
              className="flex flex-col justify-center py-24"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="w-[4px] h-[1em] bg-[var(--color-savings)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)]">FREE SPEND AUDIT</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="font-serif italic text-5xl lg:text-[72px] leading-[1.05] text-[var(--color-ink)] tracking-tight">
                Your AI tools<br />
                are <span className="text-[var(--color-warn)]">billing</span> you<br />
                for things you<br />
                don&apos;t use.
              </motion.h1>
              
              <motion.p variants={itemVariants} className="mt-8 font-sans text-[18px] text-[var(--color-muted)] max-w-[420px] leading-relaxed">
                Most teams pay for three AI tools and use one and a half. SpendLens shows you exactly which half.
              </motion.p>
              
              <motion.div variants={itemVariants} className="mt-10">
                <a 
                  href="#audit-form"
                  className="inline-block bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-medium text-[15px] px-8 py-4 rounded-xl hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
                >
                  Audit My Stack — It&apos;s Free
                </a>
                <p className="mt-4 font-mono text-[11px] text-[var(--color-muted)]">No account. No credit card. 2 minutes.</p>
              </motion.div>
            </motion.div>
            
            <div className="hidden lg:block relative py-24 pl-8">
              <HeroTicker />
            </div>
          </div>
        </section>

        {/* HORIZONTAL RULE */}
        <div className="w-full relative flex justify-center py-12">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-rule)] to-transparent -translate-y-1/2" />
          <div className="relative z-10 bg-[var(--color-paper-dim)] px-6 py-2 rounded-full font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)] shadow-sm border border-[var(--color-rule)]/50">
            HOW IT WORKS
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="max-w-[960px] mx-auto px-8 py-24">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-y-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {[
              { num: '01', title: 'Tell us what you pay', text: "List your AI tools, plans, and team size. Takes about 90 seconds. No sign-in required — we don't ask for your name." },
              { num: '02', title: 'Get an honest audit', text: "Our engine compares your stack against current pricing and usage patterns. Every recommendation cites a reason." },
              { num: '03', title: 'See where the money goes', text: "A shareable report showing per-tool savings, a plain-English summary, and an intro to Credex credits if you're overspending." }
            ].map((step, i) => (
              <motion.div key={step.num} variants={itemVariants} className={`flex flex-col relative md:px-8 ${i !== 2 ? 'md:border-r border-[var(--color-rule)]' : ''} ${i === 0 ? 'md:pl-0' : ''} ${i === 2 ? 'md:pr-0' : ''}`}>
                <div className="font-serif italic text-[96px] leading-none text-[var(--color-rule)] select-none">{step.num}</div>
                <h3 className="font-sans font-medium text-[22px] text-[var(--color-ink)] mt-4 mb-3">{step.title}</h3>
                <p className="font-sans text-[16px] text-[var(--color-muted)] leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* THE FORM SECTION */}
        <section id="audit-form" className="bg-[var(--color-ink)] text-[var(--color-paper)] w-full relative z-20 pb-32">
          <div className="max-w-[960px] mx-auto px-8 py-24">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-savings)] mb-6">YOUR STACK</div>
              <h2 className="font-serif italic text-4xl md:text-[48px] text-[var(--color-paper)] leading-tight mb-4">
                What are you actually paying for?
              </h2>
              <p className="font-sans text-[18px] text-[#A09A90] max-w-[500px]">
                Toggle the tools your team uses. Adjust seats and spend.
              </p>
            </motion.div>

            <form onSubmit={rhfSubmit(onSubmitForm)}>
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="flex flex-col gap-2 w-full md:w-64">
                  <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Team Size</label>
                  <Select.Root value={teamSize?.toString() || '1'} onValueChange={(v) => setValue('teamSize', parseInt(v))}>
                    <Select.Trigger className="flex items-center justify-between w-full font-sans text-base text-[var(--color-paper)] bg-transparent border-b border-[var(--color-muted)]/40 pb-2 focus:outline-none focus:border-[var(--color-savings)] rounded-none">
                      <Select.Value />
                      <Select.Icon className="font-mono text-[var(--color-muted)]">▾</Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-[var(--color-ink)] border border-[var(--color-muted)]/40 rounded-[2px] z-50">
                        <Select.Viewport className="p-1">
                          {['1', '5', '15', '50', '100'].map(v => (
                            <Select.Item key={v} value={v} className="font-sans text-[14px] text-[var(--color-paper)] px-6 py-2 outline-none cursor-pointer hover:bg-[var(--color-muted)]/20">
                              <Select.ItemText>{v === '1' ? '1' : v === '100' ? '100+' : `Up to ${v}`}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-64">
                  <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Primary Use Case</label>
                  <Select.Root value={useCase || 'mixed'} onValueChange={(v: "coding" | "writing" | "data" | "research" | "mixed") => setValue('useCase', v)}>
                    <Select.Trigger className="flex items-center justify-between w-full font-sans text-base text-[var(--color-paper)] bg-transparent border-b border-[var(--color-muted)]/40 pb-2 focus:outline-none focus:border-[var(--color-savings)] rounded-none">
                      <Select.Value />
                      <Select.Icon className="font-mono text-[var(--color-muted)]">▾</Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-[var(--color-ink)] border border-[var(--color-muted)]/40 rounded-[2px] z-50">
                        <Select.Viewport className="p-1">
                          {[
                            { id: 'coding', label: 'Coding' },
                            { id: 'writing', label: 'Writing' },
                            { id: 'data', label: 'Data & Research' },
                            { id: 'mixed', label: 'Mixed' }
                          ].map(v => (
                            <Select.Item key={v.id} value={v.id} className="font-sans text-[14px] text-[var(--color-paper)] px-6 py-2 outline-none cursor-pointer hover:bg-[var(--color-muted)]/20">
                              <Select.ItemText>{v.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>

              {/* STEP 2 - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {Object.keys(PRICING_DATA).map(toolId => (
                  <ToolCard 
                    key={toolId}
                    toolId={toolId}
                    enabled={typedToolsState?.[toolId]?.enabled || false}
                    onToggle={(enabled) => handleToolUpdate(toolId, 'enabled', enabled)}
                    planId={typedToolsState?.[toolId]?.planId || ''}
                    onPlanChange={(planId) => handleToolUpdate(toolId, 'planId', planId)}
                    seats={typedToolsState?.[toolId]?.seats || 1}
                    onSeatsChange={(seats) => handleToolUpdate(toolId, 'seats', seats)}
                    monthlySpend={typedToolsState?.[toolId]?.monthlySpend || 0}
                    onSpendChange={(spend) => handleToolUpdate(toolId, 'monthlySpend', spend)}
                  />
                ))}
              </div>

              {/* STEP 3 - Submit */}
              <div className="pt-8 border-t border-[var(--color-muted)]/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="font-mono text-[13px] text-[var(--color-paper)]">
                  {typedToolsState ? Object.keys(typedToolsState).filter(id => typedToolsState[id].enabled).length : 0} tools selected · {
                    typedToolsState ? Object.keys(typedToolsState).filter(id => typedToolsState[id].enabled).reduce((sum, id) => sum + typedToolsState[id].seats, 0) : 0
                  } seats · est. ${totalMonthlyCalculated}/mo
                </div>
                
                <input {...register('website')} type="text" tabIndex={-1} aria-hidden="true" className="absolute left-[-9999px] opacity-0" />

                <div className="w-full md:w-auto">
                  {isSubmitting ? (
                    <div className="w-full md:w-64">
                      <div className="h-[2px] bg-[var(--color-muted)]/20 w-full overflow-hidden mb-2">
                        <motion.div 
                          className="h-full bg-[var(--color-savings)]"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      </div>
                      <div className="font-mono text-[13px] text-[var(--color-muted)] text-center">Analyzing your stack...</div>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      className="w-full md:w-auto bg-[var(--color-savings)] text-[var(--color-ink)] font-sans font-medium text-[16px] px-8 py-4 rounded-xl hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      Run Audit →
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="bg-[var(--color-paper-dim)]">
          <div className="max-w-[1280px] mx-auto px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-[var(--color-rule)] pb-16 mb-16">
              {[
                { stat: '$2.4M', label: 'identified' },
                { stat: '847', label: 'audits run' },
                { stat: '4.2 min', label: 'avg time to insight' }
              ].map(s => (
                <div key={s.label}>
                  <div className="font-mono text-4xl text-[var(--color-ink)] mb-2">{s.stat}</div>
                  <div className="font-sans text-[14px] text-[var(--color-muted)]">{s.label}<span className="text-[10px] ml-1">*</span></div>
                </div>
              ))}
            </div>
            
            <div className="max-w-[720px]">
              <div className="font-serif italic text-3xl md:text-[32px] text-[var(--color-ink)] mb-4">
                &ldquo;Finally something that just tells you the truth.&rdquo;
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                — CTO, Series A fintech (name withheld)
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[var(--color-ink)] border-t border-[var(--color-rule)]/20">
          <div className="max-w-[1280px] mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-sans text-[13px] text-[var(--color-muted)]">SpendLens by Credex</div>
            <a href="https://credex.rocks" className="font-sans text-[13px] text-[var(--color-muted)] hover:text-[var(--color-paper)] hover:underline transition-colors">
              credex.rocks →
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
