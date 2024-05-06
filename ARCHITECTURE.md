# SpendLens Architecture

## System Diagram
```mermaid
graph TD
  A[User Browser] -->|Form submit| B[Next.js App Router]
  B -->|POST /api/audit| C[Audit Engine]
  C -->|Deterministic rules| D[Savings Calculator]
  D -->|Audit result| E[POST /api/summary]
  E -->|Prompt| F[Anthropic API]
  F -->|~100 word summary| G[Save to Supabase]
  G -->|share_id| H[Result Page /audit/share_id]
  H -->|Email gate| I[POST /api/lead]
  I -->|Transactional email| J[Resend API]
  I --> G
```

## Data Flow
1. User enters tools/plans in a Next.js client component form (state stored in `localStorage`).
2. Data is POSTed to `/api/audit` where Zod validation guarantees structure.
3. The server runs the deterministic audit engine (zero API/DB dependencies) to calculate savings.
4. The server hits the Anthropic API with the audit results to generate a personalized summary.
5. The combined result is written to Supabase using the service role key and a secure `nanoid` is returned.
6. The client redirects to `/audit/[shareId]`.
7. Users can opt-in to lead capture, hitting `/api/lead` which records their email in Supabase and triggers a Resend confirmation.

## Stack Rationale
- **Next.js 14 App Router**: Allows seamless server/client boundaries, ensuring API keys and LLM interactions remain securely on the server. App Router + API routes mean we only need one deployment artifact (Vercel) rather than maintaining a separate Express server and React frontend.
- **Tailwind CSS + shadcn/ui**: Fast styling and accessible components suitable for a modern SaaS aesthetic.
- **Supabase**: Chosen over Firebase/Mongo because the audit data is relational (Leads -> Audits). Supabase's generous free tier handles our needs, and Postgres Row Level Security (RLS) provides a robust way to allow public read for shared results but secure, service-role-only inserts.
- **Anthropic Claude**: Sonnet 4 model offers excellent cost-to-performance for summarizing data blocks safely.

## Scaling to 10k Audits/Day
Currently:
- The deterministic rules run locally in Vercel functions (near-zero latency).
- Supabase easily handles 10k inserts/day on its free tier.
- Anthropic API calls are the main bottleneck. We use a 5-second timeout and a deterministic fallback summary to ensure 100% uptime for the user even if Anthropic rate-limits or times out.

**What I'd change for 10k audits/day:**
1. **Background the LLM generation**: Instead of waiting for the Anthropic API in the request cycle, I'd return the deterministic result instantly and use a background job (e.g., Inngest or a Vercel background function) to generate the summary asynchronously.
2. **Connection Pooling**: At 10k audits/day, we'd need to ensure our Supabase connections don't max out during spikes, likely using Supabase's built-in PgBouncer/Supavisor pooling.
3. **Caching**: We could cache the Anthropic API responses for identical tooling stacks (e.g., if 1,000 teams of 5 using Cursor Pro and Copilot do an audit, they don't need 1,000 unique LLM generations).
