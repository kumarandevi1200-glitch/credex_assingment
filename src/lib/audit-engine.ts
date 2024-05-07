import { PRICING_DATA } from './pricing-data';

export type UserToolInput = {
  toolId: string;
  planId: string;
  monthlySpend: number;
  seats: number;
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
};

export type AuditFinding = {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendation: 'downgrade' | 'switch' | 'optimal' | 'consider-credits';
  recommendedAction: string;
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  confidenceLevel: 'high' | 'medium' | 'low';
};

export type AuditResult = {
  findings: AuditFinding[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsCategory: 'high' | 'medium' | 'low' | 'optimal';
  teamSize: number;
  useCase: string;
  spendPerDeveloper: number;
};

export function runAudit(inputs: UserToolInput[], teamSize: number, useCase: string): AuditResult {
  const findings: AuditFinding[] = [];
  let totalMonthlySavings = 0;
  
  // Safe defaults and bounds
  const safeTeamSize = Math.max(1, Math.min(100000, teamSize));
  let validSpendTotal = 0;

  const toolIdsPresent = new Set(inputs.map(i => i.toolId));

  for (const input of inputs) {
    if (!PRICING_DATA[input.toolId] || !PRICING_DATA[input.toolId].plans[input.planId]) {
      continue; // Skip invalid tool/plan combinations silently
    }
    
    const tool = PRICING_DATA[input.toolId];
    const plan = tool.plans[input.planId];
    const safeSeats = Math.max(1, Math.min(10000, input.seats));
    const safeSpend = Math.max(0, Math.min(99999, input.monthlySpend));
    validSpendTotal += safeSpend;

    let finding: AuditFinding = {
      toolId: input.toolId,
      toolName: tool.name,
      currentPlan: plan.name,
      currentMonthlySpend: safeSpend,
      recommendation: 'optimal',
      recommendedAction: 'Keep current setup',
      projectedMonthlySpend: safeSpend,
      monthlySavings: 0,
      annualSavings: 0,
      reasoning: 'Your current plan is optimal for your reported use case and team size.',
      confidenceLevel: 'high',
    };

    // Rule 1: Seat vs team size check
    let optimalSeats = safeSeats;
    if (safeSeats > safeTeamSize) {
      optimalSeats = safeTeamSize;
      const idealSpend = optimalSeats * plan.pricePerSeat;
      const savings = safeSpend - idealSpend;
      if (savings > 0) {
        finding = {
          ...finding,
          recommendation: 'downgrade',
          recommendedAction: `Reduce seats from ${safeSeats} to ${safeTeamSize}`,
          projectedMonthlySpend: idealSpend,
          monthlySavings: savings,
          reasoning: `You are paying for more seats than your reported team size. Reducing unused licenses will save money immediately.`,
          confidenceLevel: 'high',
        };
      }
    }
    
    if (safeTeamSize < 3 && (input.planId === 'team' || input.planId === 'business' || input.planId === 'enterprise')) {
      // Suggesting individual tiers for small teams
      let cheaperPlanId = 'pro';
      if (input.toolId === 'copilot') cheaperPlanId = 'individual';
      else if (input.toolId === 'chatgpt') cheaperPlanId = 'plus';
      
      const cheaperPlan = tool.plans[cheaperPlanId];
      if (cheaperPlan) {
        const idealSpend = optimalSeats * cheaperPlan.pricePerSeat;
        const savings = safeSpend - idealSpend;
        if (savings > 0 && finding.monthlySavings <= savings) {
          finding = {
            ...finding,
            recommendation: 'downgrade',
            recommendedAction: `Downgrade to ${cheaperPlan.name} plan`,
            recommendedPlan: cheaperPlan.name,
            projectedMonthlySpend: idealSpend,
            monthlySavings: savings,
            reasoning: `For a team of 1-2, individual plans usually offer the same core features without the enterprise markup.`,
            confidenceLevel: 'high',
          };
        }
      }
    }

    // Rule 2: Plan fit check
    if (input.toolId === 'cursor' && input.planId === 'pro' && safeTeamSize === 1 && input.useCase !== 'coding' && input.useCase !== 'mixed') {
       if (finding.monthlySavings === 0) {
          finding = {
            ...finding,
            recommendation: 'switch',
            recommendedAction: 'Switch to a general-purpose AI chat tool',
            recommendedTool: 'ChatGPT Plus or Claude Pro',
            projectedMonthlySpend: 20, // Same price, better fit
            monthlySavings: 0,
            reasoning: `Cursor is a specialized coding IDE. Since your primary use case is not coding, a general-purpose AI chat tool will provide better value.`,
            confidenceLevel: 'medium',
          };
       }
    }

    if (input.toolId === 'claude' && input.planId === 'max' && input.useCase !== 'writing') {
       const proPlan = tool.plans['pro'];
       const idealSpend = optimalSeats * proPlan.pricePerSeat;
       const savings = safeSpend - idealSpend;
       if (savings > 0 && finding.monthlySavings < savings) {
          finding = {
            ...finding,
            recommendation: 'downgrade',
            recommendedAction: 'Downgrade to Claude Pro',
            recommendedPlan: 'Pro',
            projectedMonthlySpend: idealSpend,
            monthlySavings: savings,
            reasoning: `The Max plan is extremely expensive and only necessary for heavy daily AI writing with massive context. The Pro plan should suffice.`,
            confidenceLevel: 'high',
          };
       }
    }

    if (input.toolId === 'copilot' && input.planId === 'enterprise' && safeTeamSize < 50) {
       const bizPlan = tool.plans['business'];
       const idealSpend = optimalSeats * bizPlan.pricePerSeat;
       const savings = safeSpend - idealSpend;
       if (savings > 0 && finding.monthlySavings < savings) {
          finding = {
            ...finding,
            recommendation: 'downgrade',
            recommendedAction: 'Downgrade to Copilot Business',
            recommendedPlan: 'Business',
            projectedMonthlySpend: idealSpend,
            monthlySavings: savings,
            reasoning: `Copilot Enterprise features are typically overkill for teams under 50. The Business tier provides the core organizational features you need.`,
            confidenceLevel: 'high',
          };
       }
    }

    // Rule 3: Redundancy detection
    if (input.toolId === 'cursor' && toolIdsPresent.has('copilot')) {
      const savings = safeSpend;
      if (finding.monthlySavings < savings) {
        finding = {
          ...finding,
          recommendation: 'switch',
          recommendedAction: 'Consolidate coding AI tools',
          projectedMonthlySpend: 0,
          monthlySavings: savings,
          reasoning: `Paying for both Cursor and GitHub Copilot is redundant for most teams. Pick one standard to save on licensing.`,
          confidenceLevel: 'high',
        };
      }
    }

    if (input.toolId === 'claude' && input.planId === 'pro' && toolIdsPresent.has('chatgpt')) {
      // Just flag it as a potential switch/cut
      if (finding.monthlySavings === 0) {
        finding = {
          ...finding,
          recommendation: 'downgrade',
          recommendedAction: 'Evaluate cutting redundant chat subscriptions',
          projectedMonthlySpend: 0,
          monthlySavings: safeSpend,
          reasoning: `You are paying for both Claude Pro and another premium chat subscription. Many users find one is sufficient.`,
          confidenceLevel: 'medium',
        };
      }
    }

    // Set annual savings based on finalized monthly savings
    finding.annualSavings = finding.monthlySavings * 12;
    totalMonthlySavings += finding.monthlySavings;

    findings.push(finding);
  }

  // Rule 5: Credex credits opportunity (post-processing across all inputs)
  if (validSpendTotal > 200) {
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      if (f.recommendation === 'optimal' && (f.currentPlan === 'Pro' || f.currentPlan === 'Business' || f.currentPlan === 'Team')) {
         findings[i] = {
           ...f,
           recommendation: 'consider-credits',
           recommendedAction: 'Purchase discounted credits',
           reasoning: `Your plan choice is optimal, but given your high spend, you could save 15-30% by purchasing discounted invoice credits for this tool.`,
           confidenceLevel: 'high',
         };
         // Note: we don't calculate hard numerical savings for credits in the primary engine, but we surface the action.
      }
    }
  }

  let savingsCategory: 'high' | 'medium' | 'low' | 'optimal' = 'optimal';
  if (totalMonthlySavings > 500) savingsCategory = 'high';
  else if (totalMonthlySavings >= 100) savingsCategory = 'medium';
  else if (totalMonthlySavings > 0) savingsCategory = 'low';

  return {
    findings,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    savingsCategory,
    teamSize: safeTeamSize,
    useCase,
    spendPerDeveloper: safeTeamSize > 0 ? validSpendTotal / safeTeamSize : 0
  };
}
