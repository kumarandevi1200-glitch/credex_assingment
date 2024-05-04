'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_DATA } from '@/lib/pricing-data';
import { ToolCard } from '@/components/tool-card';
import { UserToolInput } from '@/lib/audit-engine';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  
  // Form State
  const [teamSize, setTeamSize] = useState<number>(1);
  const [useCase, setUseCase] = useState<'coding' | 'writing' | 'data' | 'research' | 'mixed'>('mixed');
  
  // Tool state maps toolId -> { enabled, planId, seats, monthlySpend }
  const [toolsState, setToolsState] = useState<Record<string, any>>({});
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize tool state
  useEffect(() => {
    setIsClient(true);
    
    // Load from local storage
    const saved = localStorage.getItem('spendlens_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.toolsState) {
          setToolsState(parsed.toolsState);
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    
    // Default setup
    const initial: Record<string, any> = {};
    Object.keys(PRICING_DATA).forEach(id => {
      const tool = PRICING_DATA[id];
      const defaultPlanId = Object.keys(tool.plans)[0];
      initial[id] = {
        enabled: false,
        planId: defaultPlanId,
        seats: 1,
        monthlySpend: tool.plans[defaultPlanId]?.pricePerSeat || 0
      };
    });
    setToolsState(initial);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isClient && Object.keys(toolsState).length > 0) {
      localStorage.setItem('spendlens_form', JSON.stringify({
        teamSize,
        useCase,
        toolsState
      }));
    }
  }, [teamSize, useCase, toolsState, isClient]);

  const handleToolUpdate = (toolId: string, field: string, value: any) => {
    setToolsState(prev => {
      const next = { ...prev };
      const current = next[toolId];
      
      let newSpend = current.monthlySpend;
      
      // Auto-calculate spend if plan or seats change
      if (field === 'planId' || field === 'seats') {
        const pId = field === 'planId' ? value : current.planId;
        const s = field === 'seats' ? value : current.seats;
        const price = PRICING_DATA[toolId].plans[pId]?.pricePerSeat || 0;
        newSpend = price * s;
      }
      
      next[toolId] = {
        ...current,
        [field]: value,
        ...(field === 'planId' || field === 'seats' ? { monthlySpend: newSpend } : {})
      };
      
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const activeTools = Object.keys(toolsState).filter(id => toolsState[id].enabled);
    if (activeTools.length === 0) {
      toast.error("Please select at least one tool to audit.");
      return;
    }

    setIsSubmitting(true);

    const payloadTools: UserToolInput[] = activeTools.map(id => ({
      toolId: id,
      planId: toolsState[id].planId,
      seats: toolsState[id].seats,
      monthlySpend: toolsState[id].monthlySpend,
      useCase: useCase
    }));

    // Honeypot grab
    const form = e.target as HTMLFormElement;
    const website = (form.elements.namedItem('website') as HTMLInputElement)?.value;

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: payloadTools,
          teamSize,
          useCase,
          website
        })
      });

      if (!res.ok) {
        throw new Error('Failed to audit');
      }

      const data = await res.json();
      if (data.fake) {
        // Honeypot triggered
        toast.success("Audit complete!");
        setIsSubmitting(false);
        return;
      }

      router.push(`/audit/${data.shareId}`);
    } catch (err) {
      toast.error("Something went wrong processing your audit.");
      setIsSubmitting(false);
    }
  };

  if (!isClient) return null;

  const totalMonthlyCalculated = Object.keys(toolsState)
    .filter(id => toolsState[id].enabled)
    .reduce((sum, id) => sum + toolsState[id].monthlySpend, 0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Find Out Where Your <span className="text-[#00E5A0]">AI Budget</span> Is Going</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Paste in your tools. Get an honest audit in 30 seconds. Free, no login required.
        </p>
        <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Used by 200+ startup engineering teams
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0A0A0F]">
        
        {/* Step 1 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-[#202028] pb-4">
            <div className="w-8 h-8 rounded-full bg-[#202028] text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-2xl font-semibold">Team Context</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
              <input 
                type="number" 
                min="1"
                required
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                className="w-full bg-[#13131A] border border-[#202028] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Use Case</label>
              <select 
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as any)}
                className="w-full bg-[#13131A] border border-[#202028] rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0]"
              >
                <option value="coding">Coding / Engineering</option>
                <option value="writing">Writing / Content</option>
                <option value="data">Data / Analysis</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed / General</option>
              </select>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-[#202028] pb-4">
            <div className="w-8 h-8 rounded-full bg-[#202028] text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-2xl font-semibold">Your AI Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(PRICING_DATA).map(toolId => (
              <ToolCard 
                key={toolId}
                toolId={toolId}
                enabled={toolsState[toolId]?.enabled || false}
                onToggle={(enabled) => handleToolUpdate(toolId, 'enabled', enabled)}
                planId={toolsState[toolId]?.planId || ''}
                onPlanChange={(planId) => handleToolUpdate(toolId, 'planId', planId)}
                seats={toolsState[toolId]?.seats || 1}
                onSeatsChange={(seats) => handleToolUpdate(toolId, 'seats', seats)}
                monthlySpend={toolsState[toolId]?.monthlySpend || 0}
                onSpendChange={(spend) => handleToolUpdate(toolId, 'monthlySpend', spend)}
              />
            ))}
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-6 pt-6">
          <div className="bg-[#13131A] border border-[#00E5A0]/30 rounded-xl p-6 text-center">
            <h3 className="text-xl font-medium mb-2">Ready to audit?</h3>
            <p className="text-gray-400 mb-6">You've selected {Object.keys(toolsState).filter(id => toolsState[id].enabled).length} tools totaling ${totalMonthlyCalculated}/mo.</p>
            
            {/* Honeypot */}
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            />

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00E5A0] hover:bg-[#00D090] text-[#0A0A0F] font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing your stack...
                </>
              ) : (
                <>
                  Run Audit <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
