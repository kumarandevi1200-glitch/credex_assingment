'use client';

import { PRICING_DATA } from '@/lib/pricing-data';

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

  return (
    <div className={`border border-[#202028] bg-[#13131A] rounded-lg p-4 transition-all ${enabled ? 'ring-1 ring-[#00E5A0]' : 'opacity-70'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#202028] rounded flex items-center justify-center font-bold text-sm text-[#00E5A0]">
            {tool.name.substring(0, 2)}
          </div>
          <h3 className="font-semibold text-lg">{tool.name}</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-[#202028] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E5A0]"></div>
        </label>
      </div>

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#202028]">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Plan</label>
            <select 
              value={planId}
              onChange={(e) => onPlanChange(e.target.value)}
              className="w-full bg-[#0A0A0F] border border-[#202028] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00E5A0]"
            >
              {Object.entries(tool.plans).map(([id, plan]) => (
                <option key={id} value={id}>{plan.name} (${plan.pricePerSeat}/seat)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Seats</label>
            <input 
              type="number" 
              min="1"
              value={seats}
              onChange={(e) => onSeatsChange(parseInt(e.target.value) || 1)}
              className="w-full bg-[#0A0A0F] border border-[#202028] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00E5A0]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Monthly Spend ($)</label>
            <input 
              type="number" 
              min="0"
              value={monthlySpend}
              onChange={(e) => onSpendChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0A0A0F] border border-[#202028] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00E5A0]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
