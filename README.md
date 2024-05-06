# SpendLens — AI Spend Audit Tool

> Find out where your AI budget is going. Free, no login required.

SpendLens is a free web app for startup founders and engineering managers to audit their AI tool subscriptions, identify overspend, and get a personalized savings report in 30 seconds.

**Built for:** CTOs and EMs at 5–30 person startups paying for 3+ AI tools without a clear benchmark.

## Screenshots / Demo
[INSERT: 3 screenshots of form, results page, and share URL OR 30-second Loom/YouTube link]

## Live Demo
🔗 [INSERT deployed URL]

## Quick Start

```bash
git clone https://github.com/[YOUR_HANDLE]/spendlens
cd spendlens
npm install
cp .env.example .env.local
# Fill in env vars (see Environment Variables section)
npm run dev
```

### Environment Variables
| Variable | Description |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server only) |
| ANTHROPIC_API_KEY | Anthropic API key |
| RESEND_API_KEY | Resend API key |
| NEXT_PUBLIC_BASE_URL | Your deployed URL |

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
Set all env vars in Vercel dashboard. Connect Supabase via Vercel integration.

## Decisions

Five real trade-offs made during this build:

1. **Next.js App Router over Pages Router** — [FILL IN REAL REASONING ~2 sentences]
2. **Supabase over Firebase** — [FILL IN REAL REASONING ~2 sentences]  
3. **Deterministic audit rules over AI-generated recommendations** — The audit logic uses hardcoded rules rather than asking an LLM what to recommend. AI is only used for the final summary paragraph. This makes the audit auditable, predictable, and defensible to a finance person. An LLM recommending tools it was trained on promotional data about is not trustworthy for financial advice.
4. **Email-after-value, not before** — [FILL IN REAL REASONING ~2 sentences]
5. **[FILL IN YOUR 5TH REAL DECISION]** — [FILL IN REAL REASONING]

## Running Tests
```bash
npm run test        # run all tests
npm run test:ui     # vitest UI
```

## License
MIT — use it, fork it, put it in your portfolio.
