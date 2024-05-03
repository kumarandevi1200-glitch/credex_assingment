import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: { shareId: string } }
) {
  try {
    const supabase = getSupabaseServer();
    
    // audits table has public read by share_id RLS policy
    const { data, error } = await supabase
      .from('audits')
      .select('share_id, tools, team_size, use_case, total_monthly_savings, total_annual_savings, ai_summary, created_at')
      .eq('share_id', params.shareId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
      }
      console.error('DB Fetch Error', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[/api/audit/[shareId]]', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
