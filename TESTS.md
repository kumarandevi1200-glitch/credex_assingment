# SpendLens Test Coverage

## 1. Copilot Correct Tier Validation
- **Filename**: `src/tests/audit-engine.test.ts`
- **What it covers**: Verifies that a 3-person team using GitHub Copilot Business is NOT flagged as overpaying because the tier fits their needs.
- **How to run**: `npm run test`

## 2. ChatGPT Downgrade Recommendation
- **Filename**: `src/tests/audit-engine.test.ts`
- **What it covers**: Verifies that a 1-person team paying for ChatGPT Team plan is recommended to downgrade to the Plus plan, saving $10/month.
- **How to run**: `npm run test`

## 3. Redundancy Detection
- **Filename**: `src/tests/audit-engine.test.ts`
- **What it covers**: Checks if a team is using both Cursor Pro AND GitHub Copilot concurrently and flags it as redundant tooling.
- **How to run**: `npm run test`

## 4. Optimal Spend Validation
- **Filename**: `src/tests/audit-engine.test.ts`
- **What it covers**: Verifies that a solo dev on Cursor Pro for coding is marked as 'optimal' with no necessary changes.
- **How to run**: `npm run test`

## 5. High Spend Categorization
- **Filename**: `src/tests/audit-engine.test.ts`
- **What it covers**: Validates that users with a total monthly spend over $500 are categorized accurately as 'high' spenders in the findings.
- **How to run**: `npm run test`
