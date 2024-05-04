import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase';
import { CountUp } from '@/components/count-up';
import { FindingCard } from '@/components/finding-card';
import { ShareButton } from '@/components/share-button';
import { EmailGate } from '@/components/email-gate';
import { AuditFinding } from '@/lib/audit-engine';

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const supabase = getSupabaseServer();
  const { shareId } = await params;
  const { data } = await supabase
    .from('audits')
    .select('total_annual_savings, ai_summary')
    .eq('share_id', shareId)
    .single();

  if (!data) return { title: 'Audit Not Found' };

  const summary = data.ai_summary || '';
  const desc = summary.length > 150 ? summary.slice(0, 150) + '...' : summary;

  return {
    title: `AI Spend Audit — $${data.total_annual_savings}/year in savings found`,
    description: desc,
    openGraph: {
      title: `AI Spend Audit — $${data.total_annual_savings}/year in savings found`,
      description: desc,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI Spend Audit — $${data.total_annual_savings}/year in savings found`,
      description: desc,
    }
  };
}

export default async function AuditResultPage({ params }: { params: Promise<{ shareId: string }> }) {
  const supabase = getSupabaseServer();
  const { shareId } = await params;
  const { data, error } = await supabase
    .from('audits')
    .select('id, share_id, tools, team_size, use_case, total_monthly_savings, total_annual_savings, ai_summary, created_at')
    .eq('share_id', shareId)
    .single();

  if (error || !data) {
    notFound();
  }

  // Next 14 allows passing data easily. But wait, how do I recreate findings? 
  // Ah, the findings were NOT stored in the DB, only `tools` were!
  // I must run the audit engine here again! OR store findings.
  // Assignment: "Return full audit data for public sharing" and in POST `/api/audit` we only stored `tools`.
  // Let's import the engine.
  const { runAudit } = await import('@/lib/audit-engine');
  const result = runAudit(data.tools, data.team_size, data.use_case);
  const isOptimal = result.totalMonthlySavings < 100;

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      
      {/* Header & Share */}
      <div className="flex justify-between items-center mb-12">
        <div className="font-serif text-xl font-bold">SpendLens <span className="text-gray-500 font-sans font-normal text-sm ml-2">by Credex</span></div>
        <ShareButton shareId={shareId} />
      </div>

      {/* Hero Numbers */}
      <section className="text-center mb-16 space-y-4">
        <h1 className="text-gray-400 font-medium tracking-wide uppercase text-sm">Monthly Savings Found</h1>
        <div className="text-6xl md:text-8xl font-bold font-mono text-[#00E5A0]">
          <CountUp end={result.totalMonthlySavings} prefix="$" suffix="/mo" />
        </div>
        <p className="text-xl text-gray-500">
          Annual Opportunity: <CountUp end={result.totalAnnualSavings} prefix="$" suffix="/yr" />
        </p>
      </section>

      {/* AI Summary Blockquote */}
      {data.ai_summary && (
        <section className="mb-16">
          <div className="bg-[#13131A] border-l-4 border-[#00E5A0] p-6 rounded-r-lg">
            <p className="text-lg text-gray-200 leading-relaxed font-serif italic">
              "{data.ai_summary.replace(/<[^>]*>?/gm, '')}"
            </p>
          </div>
        </section>
      )}

      {/* Credex CTA for High Savings */}
      {result.totalMonthlySavings > 500 && (
        <section className="mb-16 bg-[#0A1A14] border border-[#00E5A0] rounded-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5A0] to-transparent"></div>
          <h2 className="text-2xl font-bold mb-3">You're leaving ${result.totalMonthlySavings}/mo on the table.</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Credex sources discounted AI credits from companies that overforecast. 
            We can help you instantly cut these costs without changing tools.
          </p>
          <button className="bg-[#00E5A0] text-[#0A0A0F] font-bold py-3 px-8 rounded-lg hover:bg-[#00D090] transition-colors">
            Book a Free 20-min Consultation
          </button>
        </section>
      )}

      {/* Already Optimal */}
      {isOptimal && (
        <section className="mb-16 text-center border border-[#202028] bg-[#13131A] p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">You're spending well. Seriously.</h2>
          <p className="text-gray-400">Your AI stack is lean and appropriate for your team size.</p>
        </section>
      )}

      {/* Breakdown */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Per-Tool Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.findings.map((finding: AuditFinding, idx: number) => (
            <FindingCard key={idx} finding={finding} />
          ))}
        </div>
      </section>

      {/* Email Gate */}
      <EmailGate auditId={data.id} isOptimal={isOptimal} />
      
    </main>
  );
}
