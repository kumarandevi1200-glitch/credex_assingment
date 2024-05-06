# REFLECTION.md

## 1. Hardest Bug

[FILL IN: Describe a real bug you hit. Format: what you observed → hypotheses you formed → what you tried → what actually worked. Be specific about file names, error messages, what the wrong mental model was. Example structure below:]

> "On Day 3, the audit results page was showing NaN for all savings values. My first hypothesis was that the API response wasn't serializing correctly — I added console.log to /api/audit/route.ts and confirmed the data looked fine there. Second hypothesis: the count-up animation component was receiving strings instead of numbers. I checked finding-card.tsx and found I was passing `finding.monthlySavings` directly from the JSON response, which Next.js had typed as `any`. The fix was adding explicit number conversion: `Number(finding.monthlySavings)`. Lesson: type assertions at API boundaries, not assumptions."

[WRITE YOUR REAL VERSION HERE — 150-400 words]

## 2. A Decision You Reversed

[FILL IN: Something you decided to do, built, then changed. Must be real. Example structure:]

> "On Day 1 I decided to use a multi-page form wizard with separate routes for each step (/audit/step1, /audit/step2). By Day 2 I reversed this and made it a single-page multi-step form. What made me change: the URL-based approach required preserving state in the URL or session storage across navigations, and I realized I was engineering around a problem I created. A single component with step state in React is simpler, easier to test, and means localStorage persistence is one useEffect."

[WRITE YOUR REAL VERSION HERE — 150-400 words]

## 3. What I'd Build in Week 2

[FILL IN: This should be visionary AND practical. Think: what would make this tool go viral, what would make Credex money, what did you not have time for.]

Minimum week 2 priorities:
- [INSERT YOUR ACTUAL VISION]

## 4. How I Used AI Tools

[FILL IN: Be honest and specific. Which tool (Claude, Cursor, ChatGPT), for what exact tasks, what you didn't trust it with, and ONE specific time the AI was wrong and you caught it.]

Template:
> "Used Cursor (Claude claude-sonnet-4-20250514 backend) for... Used Claude.ai for... Did NOT use AI for the audit engine logic, because... One time it was wrong: [specific example — file, what it suggested, why it was wrong, what you did instead]."

[WRITE YOUR REAL VERSION HERE — 150-400 words]

## 5. Self-Rating

| Dimension | Rating | Reason |
|---|---|---|
| Discipline | X/10 | [1-sentence honest reason] |
| Code Quality | X/10 | [1-sentence honest reason] |
| Design Sense | X/10 | [1-sentence honest reason] |
| Problem Solving | X/10 | [1-sentence honest reason] |
| Entrepreneurial Thinking | X/10 | [1-sentence honest reason] |

[FILL IN WITH HONEST NUMBERS — under-rating with good reasoning scores better than 10s with no reasoning]
