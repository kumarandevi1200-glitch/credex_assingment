# PROMPTS.md

## AI Summary Prompt (used in /api/audit)

### Final Prompt:
```text
You are a no-nonsense CFO assistant analyzing a startup's AI tool spend.

Audit data:
- Team size: {teamSize}
- Primary use case: {useCase}
- Total monthly savings identified: ${totalMonthlySavings}
- Top saving: {topFinding.toolName} — {topFinding.recommendedAction} (saves ${topFinding.monthlySavings}/mo)
- Spend category: {savingsCategory}

Write exactly 1 paragraph, ~100 words, in second person ("you", "your team").
Be direct, specific, and slightly provocative. No fluff. No "great news!" opener.
If savings are minimal, say so honestly. If they're substantial, be concrete about the dollar amount.
End with one actionable next step.
```

### Why this prompt:
- Second person creates urgency and ownership
- "Slightly provocative" avoids sycophantic AI tone that reads as fake
- Explicit word count prevents wall-of-text
- Honest for low-savings cases — trust is the product

### What I tried that didn't work:
1. First attempt used "friendly financial advisor" persona — output was too soft, lacked specificity
2. Tried few-shot examples — made output too rigid, felt templated
3. Tried asking for bullet points — broke the "personalized paragraph" feel

### Fallback strategy:
If Anthropic API returns 429, 500, or times out after 5s, generate a templated summary using the deterministic audit data. Template lives in /api/audit/route.ts. Users see no difference in UI.
