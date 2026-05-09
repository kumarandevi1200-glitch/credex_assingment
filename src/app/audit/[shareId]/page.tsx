import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase';
import { CountUp } from '@/components/count-up';
import { FindingCard } from '@/components/finding-card';
import { EmailGate } from '@/components/email-gate';
import { AuditFinding } from '@/lib/audit-engine';

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const supabase = getSupabaseServer();
  const { shareId } = await params;
  const { data } = await supabase.from('audits').select('total_annual_savings, ai_summary').eq('share_id', shareId).single();
  if (!data) return { title: 'Audit Not Found' };
  const summary = data.ai_summary || '';
  const desc = summary.length > 150 ? summary.slice(0, 150) + '...' : summary;
  return { title: `SpendLens Audit — $${data.total_annual_savings} savings`, description: desc };
}

// Client component for the Share buttons and Hero interactions
import { ResultsClientContent } from './client-content';

export default async function AuditResultPage({ params }: { params: Promise<{ shareId: string }> }) {
  const supabase = getSupabaseServer();
  const { shareId } = await params;
  
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('share_id', shareId)
    .single();

  if (error || !data) notFound();

  const { runAudit } = await import('@/lib/audit-engine');
  const result = runAudit(data.tools, data.team_size, data.use_case);
  const isOptimal = result.totalMonthlySavings < 100;

  return (
    <div className="bg-[var(--color-paper)] min-h-screen">
      <ResultsClientContent 
        shareId={shareId}
        data={data}
        result={result}
        isOptimal={isOptimal}
      />
    </div>
  );
}
