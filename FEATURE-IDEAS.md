# StartupLens — Feature Ideas

## Quick Wins (~30 min each)

### 1. AI Pitch Coach
Let founders paste their pitch and get AI feedback on clarity, persuasiveness, and suggested rewrites. Uses the existing Groq API route.

### 2. Startup Comparison
Select 2-3 startups and see them side-by-side — industry, stage, AI scores, funding status.

### 3. Dashboard Charts
Add bar/pie charts to the dashboard showing startups by industry or funding by stage using `recharts`.

### 4. Investor Portfolio View
On each investor's detail modal, show which funding rounds they're leading from the fundraising data.

## Medium Effort (~1-2 hrs)

### 5. Activity Feed / Timeline
A log showing recent actions: "NeuraTech AI added", "Series A round closed", "New investor matched" — pull from Firestore `createdAt` timestamps across collections.

### 6. AI SWOT Analysis
A dedicated page where you pick a startup and Groq generates a full SWOT (Strengths, Weaknesses, Opportunities, Threats) with a visual quadrant layout.

### 7. Notifications / Alerts
Toast notifications when a new match is found or a funding round hits its target.

### 8. Search & Filter Bar
A global search across startups, investors, and events from the top nav.

## Impressive for Demo

### 9. AI Market Report
Pick an industry (e.g. FinTech) and generate a mini market report using Groq: trends, competitor landscape, investment climate.

### 10. PDF Export
"Download Report" button on the AI Evaluator results that exports the scores/verdict as a styled PDF.
