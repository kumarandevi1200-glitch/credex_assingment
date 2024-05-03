import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runAudit, AuditResult } from '@/lib/audit-engine';
import { getSupabaseServer } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';

const AuditRequestSchema = z.object({
  website: z.string().optional(), // Honeypot
  tools: z.array(z.object({
    toolId: z.string().max(50),
    planId: z.string().max(50),
    monthlySpend: z.number().min(0).max(99999),
    seats: z.number().int().min(1).max(10000),
    useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
  })).max(20),
  teamSize: z.number().int().min(1).max(100000),
  useCase: z.string().max(100),
});

function generateFallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings > 0) {
    const topFinding = [...result.findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    const recommendedAction = topFinding?.recommendedAction?.toLowerCase() ?? 'optimizing your subscriptions';
    const topTool = topFinding?.toolName ?? 'your current tooling';
    
    return `Your team is spending $${result.totalMonthlySavings} more than necessary on AI tools every month. Based on your current stack, you could save $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) by ${recommendedAction}. The biggest opportunity is ${topTool}. Stop burning cash and adjust your licensing today.`;
  }
  return `You are optimizing well. Your current AI tooling is well-matched to your team size and use case. Keep an eye on pricing as your team scales, but for now, your spend is highly efficient. Keep building.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Zod Validation
    const parsed = AuditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // 2. Honeypot check
    if (parsed.data.website) {
      return NextResponse.json({ success: true, fake: true }, { status: 200 }); // Silently drop
    }

    // 3. Rate limiting (IP-based)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const supabase = getSupabaseServer();
    
    // Simple rate limit implementation
    const { data: rateLimitData, error: rlError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .single();
      
    if (rlError && rlError.code !== 'PGRST116') {
      console.error('Rate limit DB error', rlError);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
    
    if (rateLimitData) {
      const windowStart = new Date(rateLimitData.window_start).getTime();
      const now = new Date().getTime();
      
      if (now - windowStart < 3600000) { // 1 hour window
        if (rateLimitData.count >= 10) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { 
            status: 429,
            headers: { 'Retry-After': '3600' }
          });
        }
        await supabase.from('rate_limits').update({ count: rateLimitData.count + 1 }).eq('ip', ip);
      } else {
        await supabase.from('rate_limits').update({ count: 1, window_start: new Date().toISOString() }).eq('ip', ip);
      }
    } else {
      await supabase.from('rate_limits').insert({ ip, count: 1 });
    }

    // 4. Run Audit Logic
    const auditResult = runAudit(parsed.data.tools, parsed.data.teamSize, parsed.data.useCase);
    
    // 5. AI Summary Generation
    let aiSummary = '';
    try {
      const topFinding = [...auditResult.findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
      const promptData = {
        teamSize: auditResult.teamSize,
        useCase: auditResult.useCase,
        totalMonthlySavings: auditResult.totalMonthlySavings,
        topFinding: topFinding ? {
          toolName: topFinding.toolName,
          recommendedAction: topFinding.recommendedAction,
          monthlySavings: topFinding.monthlySavings
        } : null,
        savingsCategory: auditResult.savingsCategory
      };

      const prompt = `You are a no-nonsense CFO assistant analyzing a startup's AI tool spend.
      
Audit data:
- Team size: ${promptData.teamSize}
- Primary use case: ${promptData.useCase}
- Total monthly savings identified: $${promptData.totalMonthlySavings}
${promptData.topFinding ? `- Top saving: ${promptData.topFinding.toolName} — ${promptData.topFinding.recommendedAction} (saves $${promptData.topFinding.monthlySavings}/mo)` : '- Top saving: None'}
- Spend category: ${promptData.savingsCategory}

Write exactly 1 paragraph, ~100 words, in second person ("you", "your team").
Be direct, specific, and slightly provocative. No fluff. No "great news!" opener.
If savings are minimal, say so honestly. If they're substantial, be concrete about the dollar amount.
End with one actionable next step.`;

      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Timeout for AI call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
      aiSummary = (message.content[0] as any).text;
    } catch (e) {
      console.error('Anthropic API error', e);
      aiSummary = generateFallbackSummary(auditResult);
    }
    
    // 6. Save to Supabase
    const shareId = nanoid(10);
    const { error: insertError } = await supabase.from('audits').insert({
      share_id: shareId,
      tools: parsed.data.tools,
      team_size: parsed.data.teamSize,
      use_case: parsed.data.useCase,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      ai_summary: aiSummary
    });

    if (insertError) {
      console.error('DB Insert Error', insertError);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }

    // 7. Return Result
    return NextResponse.json({
      shareId,
      auditResult,
      aiSummary
    });
    
  } catch (error) {
    console.error('[/api/audit]', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
