# SpendLens Metrics

## North Star Metric: "High-Savings Leads Captured"
**Why it's right for this stage:** DAU/MAU is a vanity metric for a tool that a company runs once a quarter at most. Total audits completed is good for tracking top-of-funnel reach, but it doesn't predict revenue for Credex. The only metric that predicts Credex's ARR growth is the number of captured emails belonging to teams that *actually have a financial reason* to talk to Credex. A "High-Savings Lead" is defined as an email captured from an audit where `total_monthly_savings > $500`. 

## 3 Input Metrics That Drive It
1. **Audit Completion Rate**: The percentage of visitors who land on the page, fill out the form, and successfully hit the `/audit/[shareId]` page. (Measures friction in the core UI).
2. **"Share" Button Clicks**: The number of times the public URL is copied or shared to Twitter per completed audit. (Measures the viral coefficient of the tool).
3. **Email Gate Conversion on High-Savings Results**: The percentage of users who see a >$500 savings result and choose to input their email. (Measures the strength of the Credex CTA and the perceived value of the audit).

## Day 1 Instrumentation
We will use PostHog (or a similar product analytics tool) on Day 1 to track:
- `form_started`: Triggered when the first tool is toggled "enabled".
- `audit_completed`: Triggered on successful redirect to `/audit/[shareId]`. Properties: `team_size`, `use_case`, `total_monthly_savings`, `tools_count`.
- `share_clicked`: Triggered when the "Copy Link" or "Twitter" button is clicked. Properties: `share_method`, `total_monthly_savings`.
- `lead_captured`: Triggered when the email gate form is submitted successfully. Properties: `has_company_name`, `total_monthly_savings`.

## The Pivot Trigger
If, after 30 days and 1,000 unique visitors, the **Email Gate Conversion on High-Savings Results is < 5%**, we pivot. 
A <5% conversion rate on teams that have *just been shown* they are wasting $6,000/year means the audit lacks credibility, the CTA feels like a scam, or the target demographic does not actually care about saving $6,000. If this happens, we must pivot from a purely financial ROI angle to a "productivity/tool-sprawl" angle, redesigning the audit to focus on feature overlap rather than raw dollar waste.
