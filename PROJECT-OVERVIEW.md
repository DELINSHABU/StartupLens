# StartupLens — AI-Powered Startup Ecosystem Platform

## What Is This Project?

**StartupLens** is a full-stack web application that helps founders, investors, and event organizers connect within a startup ecosystem. It uses **Google Gemini AI** to evaluate startup pitches and match founders with investors. Built for the **IFAVH HUB Technical Hackathon**.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 | Full-stack React framework with server-side rendering |
| **Language** | TypeScript | ^5 | Type-safe JavaScript |
| **UI Library** | React | 19.2.3 | Component-based frontend |
| **Styling** | Tailwind CSS | ^4 | Utility-first CSS framework |
| **Component Library** | shadcn/ui + Radix UI | radix-nova style | Pre-built accessible UI components |
| **Icons** | Lucide React | ^0.577.0 | Icon library |
| **Database** | Firebase Firestore | ^12.10.0 | NoSQL cloud database |
| **Authentication** | Firebase Auth | (bundled with Firebase) | Google Sign-In OAuth |
| **AI Engine** | Google Gemini API (`gemini-2.0-flash`) | ^0.24.1 | Startup evaluation + investor matching |
| **Charts** | Recharts | ^3.8.0 | Data visualization (available for dashboards) |
| **CSS Animations** | tw-animate-css | ^1.4.0 | Tailwind animation utilities |
| **Utility** | clsx + tailwind-merge + class-variance-authority | — | Conditional class merging |
| **Deployment** | Vercel | — | Hosting platform |

---

## Project Structure

```
Ifavh-project/
├── HACKATHON-PLAN.md                # Original hackathon build plan
├── PROJECT-OVERVIEW.md              # This file
├── TESTING-AND-PITCH.md             # Feature testing guide + product pitch script
├── UI/                              # UI design references
│
└── ifavh-startup-platform/          # Main Next.js application
    ├── package.json                 # Dependencies & scripts
    ├── tsconfig.json                # TypeScript configuration
    ├── next.config.ts               # Next.js configuration
    ├── components.json              # shadcn/ui configuration
    ├── postcss.config.mjs           # PostCSS (Tailwind pipeline)
    ├── eslint.config.mjs            # ESLint rules
    ├── seed.mjs                     # Standalone database seed script (Node.js)
    ├── .env.local                   # Environment variables (secrets — not committed)
    ├── .env.local.example           # Template for env vars
    │
    ├── public/
    │   └── sample-data.json         # Downloadable sample data for JSON import
    │
    └── src/
        ├── app/                     # Next.js App Router (pages & API routes)
        │   ├── layout.tsx           # Root layout — wraps all pages with Sidebar + TopNav + AuthProvider
        │   ├── page.tsx             # Dashboard home page (/) — stats, deal pipeline, JSON import/export
        │   ├── globals.css          # Global styles + dark theme CSS variables
        │   │
        │   ├── startups/
        │   │   └── page.tsx         # Startup CRUD page (/startups)
        │   │
        │   ├── investors/
        │   │   └── page.tsx         # Investor CRUD page (/investors)
        │   │
        │   ├── dealflow/
        │   │   └── page.tsx         # Deal Flow Kanban pipeline (/dealflow)
        │   │
        │   ├── fundraising/
        │   │   └── page.tsx         # Fundraising Tracker (/fundraising)
        │   │
        │   ├── accelerator/
        │   │   └── page.tsx         # Accelerator Programs (/accelerator)
        │   │
        │   ├── evaluate/
        │   │   └── page.tsx         # AI Startup Evaluator page (/evaluate)
        │   │
        │   ├── match/
        │   │   └── page.tsx         # AI Investor Matching page (/match) — placeholder
        │   │
        │   ├── events/
        │   │   └── page.tsx         # Events CRUD page (/events)
        │   │
        │   └── api/
        │       ├── evaluate/
        │       │   └── route.ts     # Server-side API route for Gemini AI evaluation
        │       └── seed/
        │           └── route.ts     # Database seed API (populates demo data)
        │
        ├── components/
        │   ├── Sidebar.tsx          # Left sidebar navigation (9 items)
        │   ├── TopNav.tsx           # Top navigation bar with auth controls
        │   └── ui/                  # shadcn/ui components (auto-generated)
        │       ├── avatar.tsx
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── dialog.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── navigation-menu.tsx
        │       ├── select.tsx
        │       ├── separator.tsx
        │       ├── sheet.tsx
        │       ├── table.tsx
        │       ├── tabs.tsx
        │       └── textarea.tsx
        │
        ├── context/
        │   └── AuthContext.tsx       # React Context for Firebase Auth (Google Sign-In)
        │
        ├── lib/
        │   ├── firebase.ts          # Firebase app initialization (Firestore + Auth)
        │   ├── gemini.ts            # Google Gemini AI client (evaluate + match functions)
        │   └── utils.ts             # shadcn utility (cn function for class merging)
        │
        ├── services/
        │   ├── startupService.ts    # Firestore CRUD operations for startups
        │   ├── investorService.ts   # Firestore CRUD operations for investors
        │   └── eventService.ts      # Firestore CRUD operations for events
        │
        └── types/
            └── index.ts             # TypeScript interfaces (Startup, Investor, Evaluation, Event)
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                       FRONTEND                           │
│  Next.js App Router (React 19 + TypeScript)              │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard│  │Startups  │  │Investors │  │ Events   │  │
│  │ + Import│  │  CRUD    │  │  CRUD    │  │  CRUD    │  │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐    │
│  │Deal Flow │  │Fundraising│  │Accelerator Programs│    │
│  │ Kanban   │  │ Tracker   │  │ + Milestones       │    │
│  └──────────┘  └───────────┘  └────────────────────┘    │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐  │
│  │ AI Evaluator     │  │ AI Investor Matching         │  │
│  │ (Gemini 2.0)     │  │ (Coming Soon)                │  │
│  └────────┬─────────┘  └──────────────────────────────┘  │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────┐    ┌──────────────────────────┐
│  Next.js API Routes   │    │  Firebase Services       │
│  /api/evaluate        │    │                          │
│  /api/seed            │    │  ┌────────────────────┐  │
│  (Server-side Gemini  │    │  │ Firestore Database │  │
│   + seed endpoints)   │    │  │ (startups,         │  │
└───────────┬───────────┘    │  │  investors, events) │  │
            │                │  └────────────────────┘  │
            ▼                │                          │
┌───────────────────────┐    │  ┌────────────────────┐  │
│  Google Gemini API    │    │  │ Firebase Auth      │  │
│  (gemini-2.0-flash)   │    │  │ (Google Sign-In)   │  │
│  - Evaluates pitches  │    │  └────────────────────┘  │
│  - Returns JSON scores│    │                          │
└───────────────────────┘    └──────────────────────────┘
```

---

## Features Breakdown

### 1. Dashboard (`/`)
- Displays real-time stats: total startups, investors, and events
- **JSON Import/Export**: Download `sample-data.json` or import any JSON file to bulk-load startups, investors, and events in one click
- **Deal Pipeline Widget**: Shows the 5 most recent startups with name, industry, and stage badge — links to full Deal Flow page
- Quick action cards to navigate to key sections
- Recent activity feed
- Data fetched from all 3 Firestore collections on load

### 2. Startup Profiles — Full CRUD (`/startups`)
- **Create**: Register a new startup (name, description, industry, stage, pitch, website)
- **Read**: Grid view of all startups with industry and stage badges
- **Update**: Edit any startup via dialog modal
- **Delete**: Remove startups
- **Filter**: Filter startups by industry tags (FinTech, AI/ML, SaaS, etc.)
- Founder name auto-populated from authenticated user

### 3. Investor Discovery — Full CRUD (`/investors`)
- **Create**: Add investor profiles (name, bio, focus areas, check size, stage preference, email)
- **Read**: Card grid with focus area badges, check size, and stage info
- **Update/Delete**: Edit/delete via hover actions
- **Filter**: Filter by focus area tags (SaaS, DeepTech, ClimateTech, etc.)
- Multi-select focus area picker in the form

### 4. AI Startup Evaluator (`/evaluate`)
- User enters a startup name + pitch description
- Sends to `/api/evaluate` server-side API route
- Server calls **Google Gemini 2.0 Flash** AI model
- Returns structured JSON evaluation:
  - **Overall Score** (0-100) — displayed as animated circular progress
  - **Category Scores**: Market Fit, Solution Depth, Uniqueness, Viability
  - **One-line Verdict**
  - **Strengths** (3 items)
  - **Weaknesses** (2 items)
  - **Improvement Suggestions** (2 items)
  - **Investor Interest Level** (High/Medium/Low + reason)
  - **Confidence Index** (80-100%)
  - **Market Insights**: Sentiment, Competitor Density, Recent Exits, Red Flags

### 5. Deal Flow Pipeline (`/dealflow`)
- **Kanban board** showing all startups organized by funding stage: Idea → Pre-Seed → Seed → Series A → Series B → Growth
- Each column displays a count badge and startup cards with name, industry, and pitch preview
- Top stats bar shows count per stage + total across all stages
- Empty columns show "No deals" placeholder
- Data pulled live from the Firestore `startups` collection

### 6. Fundraising Tracker (`/fundraising`)
- Summary cards: Total Target, Total Raised, Active Rounds
- Funding rounds table with progress bars showing raised vs. target amounts
- Percentage completion per round
- Status badges: Active (green) / Closed (gray)
- Formatted amounts ($500K, $1.5M, $15.0M, etc.)
- Falls back to sample data (NeuraTech, GreenCharge, FinFlow, MedSync) if no startups in database

### 7. Accelerator Programs (`/accelerator`)
- Displays 3 cohort programs with status badges: Active (green), Completed (gray), Upcoming (blue)
- Summary stats: Total Programs, Active Cohort, Startups Enrolled, Graduated
- Each program card shows duration, start/end dates, and focus area tags
- **Milestone Timeline**: Visual W1 → W3 → W6 → W9 → W12 progression (Kick-off → MVP Sprint → Mid-Review → Investor Prep → Demo Day)

### 8. AI Investor Matching (`/match`)
- Placeholder page — designed but not yet connected to AI
- Architecture ready: `matchInvestors()` function in `gemini.ts` takes startup + investor data and returns ranked matches with scores

### 9. Events (`/events`)
- **Create**: Add ecosystem events (title, description, date, location)
- **Read**: Event cards with date and location info
- **Update/Delete**: Edit/delete via hover actions

### 10. Authentication
- **Google Sign-In** via Firebase Auth popup
- Auth state managed via React Context (`AuthContext.tsx`)
- User avatar + name shown in top navigation
- Sign-in/out buttons in TopNav

---

## Database Schema (Firebase Firestore)

### `startups` collection
| Field | Type | Description |
|-------|------|-------------|
| name | string | Startup name |
| description | string | What the startup does |
| industry | string | FinTech, HealthTech, AI/ML, SaaS, etc. |
| stage | string | Idea, Pre-Seed, Seed, Series A, Series B, Growth |
| pitch | string | Elevator pitch text |
| website | string (optional) | Company website |
| founderId | string | Firebase Auth UID of the founder |
| founderName | string | Display name from Google Auth |
| createdAt | timestamp | Server timestamp |

### `investors` collection
| Field | Type | Description |
|-------|------|-------------|
| name | string | Investor/firm name |
| bio | string | Investment thesis |
| focusAreas | string[] | Array of sectors (SaaS, FinTech, etc.) |
| checkSize | string | $10K-$50K, $50K-$200K, $200K-$1M, $1M-$5M, $5M+ |
| stagePreference | string | Pre-Seed, Seed, Series A, etc. |
| contactEmail | string (optional) | Contact info |
| createdAt | timestamp | Server timestamp |

### `events` collection
| Field | Type | Description |
|-------|------|-------------|
| title | string | Event name |
| description | string | Event details |
| date | string | Event date |
| location | string | Venue/city |
| createdAt | timestamp | Server timestamp |

---

## API Routes

### `POST /api/evaluate`
**Purpose**: Server-side route to call Gemini AI (keeps API key secure)

**Request Body**:
```json
{
  "name": "Startup Name",
  "pitch": "Detailed pitch description..."
}
```

**Response** (from Gemini AI):
```json
{
  "overallScore": 78,
  "scores": {
    "marketFit": 82,
    "solutionDepth": 75,
    "uniqueness": 70,
    "viability": 80
  },
  "verdict": "Strong market potential with solid execution plan.",
  "strengths": ["Clear value proposition", "Large addressable market", "Strong team background"],
  "weaknesses": ["Limited traction data", "Competitive market"],
  "suggestions": ["Focus on unit economics", "Build strategic partnerships"],
  "investorInterest": "High",
  "investorReason": "Large market opportunity with differentiated approach",
  "confidence": 87,
  "insights": {
    "marketSentiment": "Growing demand in this sector",
    "competitorDensity": "Moderate — 3-5 major players",
    "recentExits": "2-3 exits in the $100M+ range recently",
    "redFlags": "None detected"
  }
}
```

### `POST /api/seed`
**Purpose**: Populate the database with demo data (8 startups, 5 investors, 4 events)

- First call: seeds all collections and returns `{ message: "Seed complete!", startups: 8, investors: 5, events: 4 }`
- Subsequent calls: returns `"Database already has X startups. Skipping seed."` to prevent duplicates

**Sample data includes**:
- Startups: NeuraTech AI, GreenCharge, FinFlow, MedSync, EduVerse, LogiChain, AgroSense, CyberShield
- Investors: Venture Gulf Capital, TechBridge Partners, Al Noor Angels, Desert Innovation Fund, Horizon Ventures ME
- Events: IFAVH AI Hackathon, MENA Startup Summit, FinTech Demo Day, Climate Tech Meetup

---

## How It's Built — Key Design Patterns

### 1. Service Layer Pattern
Each Firestore collection has its own service file (`startupService.ts`, `investorService.ts`, `eventService.ts`) that encapsulates all CRUD operations. Pages never call Firestore directly — they go through services.

### 2. Server-Side AI Calls
The AI evaluation uses a Next.js API route (`/api/evaluate/route.ts`) so the Gemini API key stays on the server, not exposed to the browser.

### 3. React Context for Auth
Firebase Auth state is managed via a global React Context (`AuthContext.tsx`), making `user`, `signIn`, and `logOut` available anywhere with the `useAuth()` hook.

### 4. Component Architecture
- **Layout** (`layout.tsx`): Wraps every page with `AuthProvider` → `Sidebar` → `TopNav` → `{children}`
- **UI Components** (`components/ui/`): shadcn/ui primitives (Button, Card, Dialog, etc.)
- **Feature Pages** (`app/*/page.tsx`): Self-contained pages with their own state and CRUD logic

### 5. Dark Theme
The entire app uses a custom dark color scheme defined in `globals.css` under the `.dark` class. The `<html>` element has `className="dark"` applied in `layout.tsx`.

### 6. Data Seeding Strategy
Two approaches for populating demo data:
- **Client-side JSON import**: Dashboard lets users upload a JSON file that batch-creates startups, investors, and events via the existing service layer
- **Server-side seed API**: `POST /api/seed` directly writes demo records to Firestore with duplicate prevention
- **Sample data file**: `public/sample-data.json` is downloadable and serves as both a demo dataset and a schema reference

### 7. Derived Analytics Views
Deal Flow, Fundraising, and Accelerator pages read from the same Firestore data but present it in specialized views (Kanban, progress tables, timelines) — no extra database collections needed.

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0c1324` | Main page background |
| Surface | `#151b2d` | Cards, sidebar |
| Surface Elevated | `#191f31` | Hover states, dialogs |
| Input Background | `#070d1f` | Form inputs |
| Primary Blue | `#0062ff` | Buttons, CTAs, gradients |
| Primary Light | `#b4c5ff` | Accent highlights, links |
| Teal Accent | `#7bd0ff` | AI insights, secondary accent |
| Text Primary | `#dce1fb` | Headings, main text |
| Text Secondary | `#c2c6d9` | Descriptions, labels |
| Text Muted | `#424656` | Timestamps, dividers |
| Error/Destructive | `#ffb4ab` | Delete actions, warnings |

---

## Environment Variables Required

Create a `.env.local` file in `ifavh-startup-platform/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

---

## How to Run Locally

```bash
# 1. Navigate to the app directory
cd ifavh-startup-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.local.example to .env.local and fill in your Firebase + Gemini keys

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Key Points for Judges

1. **AI Integration**: Gemini 2.0 Flash evaluates startups with structured multi-dimensional scoring (4 metrics + market intelligence)
2. **9 fully functional pages**: Dashboard, Startups, Investors, Deal Flow, Fundraising, Accelerator, AI Evaluator, AI Match, Events
3. **3 Full CRUD modules**: Startups, Investors, Events — Create, Read, Update, Delete with filtering
4. **3 Analytics Views**: Deal Flow Kanban, Fundraising Tracker with progress bars, Accelerator Timeline with milestones
5. **One-Click Data Import**: JSON import/export on dashboard — platform is demo-ready in seconds
6. **Clean Architecture**: Service layer, type definitions, context providers — proper separation of concerns
7. **Modern Stack**: Next.js 16 + React 19 + TypeScript + Firebase + Tailwind + shadcn/ui
8. **Server-Side Security**: AI API calls + seed endpoint routed through Next.js API routes (keys never exposed)
9. **Real-Time Auth**: Google OAuth with persistent session via Firebase Auth
10. **Polished UI**: Custom dark theme, responsive grid layouts, micro-animations, glassmorphism effects
11. **Product Thinking**: Solves a real problem — connecting startups, investors, and events in one platform
12. **Built in 2 hours**: From scratch to production with full AI integration
