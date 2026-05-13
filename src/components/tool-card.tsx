'use client';

import { PRICING_DATA } from '@/lib/pricing-data';
import { motion, AnimatePresence } from 'framer-motion';
import * as Select from '@radix-ui/react-select';

export function ToolCard({
  toolId,
  enabled,
  onToggle,
  planId,
  seats,
  monthlySpend,
  onPlanChange,
  onSeatsChange,
  onSpendChange,
}: {
  toolId: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  planId: string;
  seats: number;
  monthlySpend: number;
  onPlanChange: (planId: string) => void;
  onSeatsChange: (seats: number) => void;
  onSpendChange: (spend: number) => void;
}) {
  const tool = PRICING_DATA[toolId];
  if (!tool) return null;

  const currentPlan = tool.plans[planId] || tool.plans[Object.keys(tool.plans)[0]];

  return (
    <div 
      className={`border transition-all duration-300 overflow-hidden bg-[var(--color-paper)] rounded-2xl ${
        enabled ? 'border-[var(--color-savings)]/60 shadow-glow' : 'border-[var(--color-muted)]/10 shadow-soft hover:shadow-elevated hover:-translate-y-0.5'
      }`}
    >
      <div 
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${tool.name} tool`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(!enabled);
          }
        }}
        className="flex items-center justify-between p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-savings)]"
        onClick={() => onToggle(!enabled)}
      >
        <div className="flex items-center gap-4">
          <div className="text-[var(--color-muted)] text-sm">
            {enabled ? '●' : '◯'}
          </div>
          <h3 className="font-sans font-medium text-[15px] text-[var(--color-ink)]">
            {tool.name}
          </h3>
        </div>
        
        {/* Pill Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`w-8 h-4 rounded-full transition-colors duration-200 ${
            enabled ? 'bg-[var(--color-savings)]' : 'bg-[var(--color-muted)]/30'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!enabled);
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
          >
            <div className="px-4 pb-4">
              <div className="border-t border-[var(--color-rule)] mb-4" />
              
              <div className="grid grid-cols-3 gap-6">
                {/* PLAN */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Plan</label>
                  <Select.Root value={planId} onValueChange={onPlanChange}>
                    <Select.Trigger className="flex items-center justify-between w-full font-sans text-sm text-[var(--color-ink)] bg-[var(--color-paper)] border-b border-[var(--color-muted)]/60 pb-1 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 rounded-none transition-colors">
                      <Select.Value />
                      <Select.Icon className="font-mono text-[var(--color-muted)] text-[10px]">▾</Select.Icon>
                    </Select.Trigger>
                    
                    <Select.Portal>
                      <Select.Content className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] shadow-sm z-50 overflow-hidden">
                        <Select.Viewport className="p-1">
                          {Object.entries(tool.plans).map(([id, plan]) => (
                            <Select.Item 
                              key={id} 
                              value={id}
                              className="font-sans text-[13px] text-[var(--color-ink)] px-6 py-2 outline-none cursor-pointer hover:bg-[var(--color-paper-dim)] focus:bg-[var(--color-paper-dim)] data-[state=checked]:text-[var(--color-accent)]"
                            >
                              <Select.ItemText>{plan.name}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* SEATS */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Seats</label>
                  <input 
                    type="number" 
                    min="1"
                    value={seats}
                    onChange={(e) => onSeatsChange(parseInt(e.target.value) || 1)}
                    className="w-full font-mono text-sm text-[var(--color-ink)] bg-transparent border-b border-[var(--color-muted)]/60 pb-1 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 transition-colors rounded-none"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                </div>

                {/* SPEND */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">Monthly Spend</label>
                  <div className="relative">
                    <span className="absolute left-0 top-0 font-mono text-sm text-[var(--color-muted)]">$</span>
                    <input 
                      type="number" 
                      min="0"
                      value={monthlySpend}
                      onChange={(e) => onSpendChange(parseFloat(e.target.value) || 0)}
                      className="w-full font-mono text-sm text-[var(--color-ink)] bg-transparent border-b border-[var(--color-muted)]/60 pb-1 pl-3 focus:outline-none focus:border-[var(--color-accent)] focus:border-b-2 transition-colors rounded-none"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  {currentPlan.pricePerSeat > 0 && (
                    <div className="text-right mt-1">
                      <span className="font-mono text-[11px] text-[var(--color-muted)]">
                        ↳ ${currentPlan.pricePerSeat}/seat × {seats}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
