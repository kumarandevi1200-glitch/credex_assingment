import { AuditFinding } from '@/lib/audit-engine';

export function FindingCard({ finding }: { finding: AuditFinding }) {
  const isOptimal = finding.monthlySavings === 0;

  return (
    <div className="bg-[var(--color-paper-dim)] rounded-2xl p-6 md:p-8 mb-6 shadow-soft hover:shadow-elevated transition-shadow duration-300 border border-[var(--color-rule)]/50">
      <div className="grid grid-cols-1 md:grid-cols-[30%_30%_40%] gap-6 items-start">
        {/* Left Col: Tool Details */}
        <div>
          <h4 className="font-sans font-bold text-[17px] text-[var(--color-ink)] mb-1">{finding.toolName}</h4>
          <div className="font-mono text-[12px] text-[var(--color-muted)]">
            Plan: {finding.currentPlan} · ${finding.currentMonthlySpend}/mo
          </div>
        </div>

        {/* Center Col: Action */}
        <div className="flex gap-4">
          <div className="text-[var(--color-rule)] mt-0.5">→</div>
          <div>
            <div className="font-sans text-[15px] text-[var(--color-ink)] mb-1">
              {finding.recommendedAction}
            </div>
          </div>
        </div>

        {/* Right Col: Savings */}
        <div className="md:text-right">
          {isOptimal ? (
            <div className="font-mono text-[16px] font-bold text-[var(--color-muted)]">
              OPTIMAL ✓
            </div>
          ) : (
            <>
              <div className="font-mono text-[16px] font-bold text-[var(--color-savings)]">
                SAVE ${finding.monthlySavings}/mo
              </div>
              <div className="font-mono text-[11px] text-[var(--color-muted)] mt-1">
                (${finding.annualSavings}/yr)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reasoning Row */}
      <div className="mt-2 pt-4 border-t-[0.5px] border-[var(--color-rule)]/50 ml-0 md:ml-[30%]">
        <p className="font-sans italic text-[14px] text-[var(--color-muted)] leading-[1.6]">
          "{finding.reasoning}"
        </p>
        <div className="mt-3 text-right">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
            confidence: 
            <span className={`ml-2 ${finding.confidenceLevel === 'high' ? 'text-[var(--color-savings)]' : finding.confidenceLevel === 'medium' ? 'text-[#F5A623]' : 'text-[var(--color-warn)]'}`}>
              ● {finding.confidenceLevel.toUpperCase()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
