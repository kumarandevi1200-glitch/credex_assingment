'use client';

import { AuditFinding } from '@/lib/audit-engine';
import { ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function FindingCard({ finding }: { finding: AuditFinding }) {
  const isOptimal = finding.recommendation === 'optimal';
  const hasSavings = finding.monthlySavings > 0;

  return (
    <div className={`border rounded-lg p-5 ${hasSavings ? 'border-[#00E5A0]/50 bg-[#13131A]' : 'border-[#202028] bg-[#13131A]/50'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{finding.toolName}</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#202028] text-gray-300">
              {finding.currentPlan}
            </span>
          </div>
          <p className="text-sm text-gray-400">Current Spend: ${finding.currentMonthlySpend}/mo</p>
        </div>
        
        {hasSavings ? (
          <div className="bg-[#00E5A0]/10 text-[#00E5A0] px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Save ${finding.monthlySavings}/mo
          </div>
        ) : (
          <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Optimal
          </div>
        )}
      </div>

      {!isOptimal && (
        <div className="bg-[#0A0A0F] rounded p-3 mb-4 flex items-center gap-3 border border-[#202028]">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{finding.recommendedAction}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-sm font-mono text-[#00E5A0]">${finding.projectedMonthlySpend}/mo</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-start text-sm text-gray-400">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{finding.reasoning}</p>
      </div>
    </div>
  );
}
