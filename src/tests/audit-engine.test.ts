import { describe, it, expect } from 'vitest';
import { runAudit, UserToolInput } from '../lib/audit-engine';

describe('Audit Engine', () => {

  it('1. 3-person team on GitHub Copilot Business should NOT flag as overpaying', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'copilot', planId: 'business', monthlySpend: 57, seats: 3, useCase: 'coding' }
    ];
    const result = runAudit(inputs, 3, 'coding');
    const finding = result.findings[0];
    
    // Should be optimal (or consider-credits if >200 spend, but here it's 57)
    expect(finding.recommendation).toBe('optimal');
    expect(finding.monthlySavings).toBe(0);
  });

  it('2. 1-person team paying for ChatGPT Team plan should flag downgrade to Plus', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'chatgpt', planId: 'team', monthlySpend: 30, seats: 1, useCase: 'writing' }
    ];
    // ChatGPT Plus is $20
    const result = runAudit(inputs, 1, 'writing');
    const finding = result.findings[0];

    expect(finding.recommendation).toBe('downgrade');
    expect(finding.monthlySavings).toBe(10); // 30 - 20
    expect(finding.recommendedAction).toContain('Downgrade to Plus plan');
  });

  it('3. Team with both Cursor Pro AND GitHub Copilot for 5 devs should flag redundancy', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'cursor', planId: 'pro', monthlySpend: 100, seats: 5, useCase: 'coding' },
      { toolId: 'copilot', planId: 'business', monthlySpend: 95, seats: 5, useCase: 'coding' }
    ];
    const result = runAudit(inputs, 5, 'coding');
    
    // Cursor should flag redundancy because copilot is present
    const cursorFinding = result.findings.find(f => f.toolId === 'cursor');
    expect(cursorFinding?.recommendation).toBe('switch');
    expect(cursorFinding?.monthlySavings).toBe(100);
  });

  it('4. Solo dev on Cursor Pro for coding use case should return optimal finding', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'cursor', planId: 'pro', monthlySpend: 20, seats: 1, useCase: 'coding' }
    ];
    const result = runAudit(inputs, 1, 'coding');
    const finding = result.findings[0];

    expect(finding.recommendation).toBe('optimal');
    expect(finding.monthlySavings).toBe(0);
  });

  it('5. High spender (>$500/mo total) should get savingsCategory high', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'claude', planId: 'max', monthlySpend: 1000, seats: 10, useCase: 'coding' }, // Claude Max for coding triggers downgrade to Pro
    ];
    // Max is $100. Pro is $20. Savings = 1000 - 200 = 800
    const result = runAudit(inputs, 10, 'coding');
    
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.savingsCategory).toBe('high');
  });

  it('BONUS: totalMonthlySavings should equal sum of all individual finding.monthlySavings', () => {
    const inputs: UserToolInput[] = [
      { toolId: 'chatgpt', planId: 'team', monthlySpend: 60, seats: 2, useCase: 'writing' }, // solo dev, 1 seat needed, chatgpt team -> downgrade to plus ($20). Savings = 40
      { toolId: 'claude', planId: 'max', monthlySpend: 100, seats: 1, useCase: 'coding' }, // coding -> downgrade to Pro ($20). Savings = 80
    ];
    const result = runAudit(inputs, 1, 'mixed');
    
    const sum = result.findings.reduce((acc, curr) => acc + curr.monthlySavings, 0);
    expect(result.totalMonthlySavings).toBe(sum);
    expect(result.totalMonthlySavings).toBe(120); // 40 + 80
  });

});
