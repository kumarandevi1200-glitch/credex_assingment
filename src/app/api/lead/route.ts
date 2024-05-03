import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServer } from '@/lib/supabase';
import { Resend } from 'resend';

const LeadSchema = z.object({
  auditId: z.string().uuid(),
  email: z.string().email().max(254),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Zod Validation
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    const { auditId, email, companyName, role, teamSize } = parsed.data;

    const supabase = getSupabaseServer();
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 2. Rate limit (max 3 leads per IP per hour)
    const { data: rlData, error: rlError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', `lead_${ip}`)
      .single();
      
    if (rlError && rlError.code !== 'PGRST116') {
      console.error('Rate limit error', rlError);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
    
    if (rlData) {
      const windowStart = new Date(rlData.window_start).getTime();
      const now = new Date().getTime();
      if (now - windowStart < 3600000) {
        if (rlData.count >= 3) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        await supabase.from('rate_limits').update({ count: rlData.count + 1 }).eq('ip', `lead_${ip}`);
      } else {
        await supabase.from('rate_limits').update({ count: 1, window_start: new Date().toISOString() }).eq('ip', `lead_${ip}`);
      }
    } else {
      await supabase.from('rate_limits').insert({ ip: `lead_${ip}`, count: 1 });
    }

    // 3. Verify auditId exists
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id')
      .eq('id', auditId)
      .single();
      
    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // 4. Check for existing email for this audit
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('audit_id', auditId)
      .eq('email', email)
      .single();
      
    if (existingLead) {
      // Don't leak existing state, just return success
      return NextResponse.json({ success: true });
    }

    // 5. Save to leads table
    const { error: insertError } = await supabase.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize
    });

    if (insertError) {
      console.error('Lead Insert Error', insertError);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }

    // 6. Send transactional email
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'mock-key') {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: 'SpendLens <audits@spendlens.app>',
          to: email,
          subject: 'Your SpendLens AI Audit Report',
          html: `<p>Hi there,</p><p>Thanks for using SpendLens to audit your AI tooling spend.</p><p>We will be reviewing your results and will reach out if there are significant savings opportunities through Credex.</p><p>- The SpendLens Team</p>`
        });
      } catch (emailError) {
        console.error('Resend Error', emailError);
        // Do not fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[/api/lead]', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
