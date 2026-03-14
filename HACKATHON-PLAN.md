# StartupLens — AI-Powered Startup Ecosystem Platform

## Hackathon: IFAVH HUB Technical Challenge (2 Hours)

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (Google Sign-In)
- **AI**: Google Gemini API (free tier — `gemini-1.5-flash`)
- **Deploy**: Vercel (free)

---

## PHASE 1: Project Setup (0:00 - 0:10)

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest ifavh-startup-platform --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ifavh-startup-platform
```

### Step 2: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Choose these options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 3: Install shadcn Components

```bash
npx shadcn@latest add button card dialog form input label select textarea table tabs badge separator avatar sheet navigation-menu
```

### Step 4: Install Firebase & Other Dependencies

```bash
npm install firebase @google/generative-ai recharts lucide-react
```

### Step 5: Set Up Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create a project"** → Name it `ifavh-startup-platform`
3. Disable Google Analytics (saves time)
4. Go to **Build → Firestore Database** → Click **Create Database** → Start in **test mode**
5. Go to **Build → Authentication** → Click **Get Started** → Enable **Google** sign-in provider
6. Go to **Project Settings (gear icon)** → Scroll down → Click **Add app (web </>)**
7. Register app name → Copy the `firebaseConfig` object

### Step 6: Set Up Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Step 7: Get Gemini API Key (FREE)

1. Go to https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Copy it into `.env.local` as `NEXT_PUBLIC_GEMINI_API_KEY`

---

## PHASE 2: Firebase Configuration (0:10 - 0:15)

### Step 8: Create Firebase Config File

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### Step 9: Create Gemini AI Config File

Create `src/lib/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function evaluateStartup(pitch: string) {
  const prompt = `You are an expert startup evaluator. Analyze this startup pitch and return a JSON response with this exact structure (no markdown, just raw JSON):
{
  "overallScore": <number 0-100>,
  "scores": {
    "market": <number 0-100>,
    "team": <number 0-100>,
    "traction": <number 0-100>,
    "innovation": <number 0-100>,
    "scalability": <number 0-100>
  },
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "summary": "<2 sentence summary of the evaluation>"
}

Startup Pitch:
${pitch}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  // Clean the response — remove markdown code blocks if present
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function matchInvestors(startup: string, investors: string) {
  const prompt = `You are a startup-investor matching expert. Given a startup profile and a list of investors, rank the top investors that would be the best match. Return JSON only (no markdown):
{
  "matches": [
    {
      "investorName": "<name>",
      "matchScore": <number 0-100>,
      "reason": "<why this is a good match>"
    }
  ]
}

Startup: ${startup}
Investors: ${investors}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
```

---

## PHASE 3: Authentication (0:15 - 0:25)

### Step 10: Create Auth Context

Create `src/context/AuthContext.tsx`:

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Step 11: Wrap App with AuthProvider

Update `src/app/layout.tsx`:

```typescript
import { AuthProvider } from "@/context/AuthContext";

// ... existing code ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## PHASE 4: Startup Profiles CRUD (0:25 - 0:45)

### Step 12: Create Types

Create `src/types/index.ts`:

```typescript
export interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  pitch: string;
  website?: string;
  founderId: string;
  founderName: string;
  createdAt: Date;
}

export interface Investor {
  id: string;
  name: string;
  bio: string;
  focusAreas: string[];
  checkSize: string;
  stagePreference: string;
  contactEmail?: string;
  createdAt: Date;
}

export interface Evaluation {
  id: string;
  startupId: string;
  startupName: string;
  overallScore: number;
  scores: {
    market: number;
    team: number;
    traction: number;
    innovation: number;
    scalability: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdAt: Date;
}
```

### Step 13: Create Startup CRUD Service

Create `src/services/startupService.ts`:

```typescript
import { db } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { Startup } from "@/types";

const COLLECTION = "startups";

export async function createStartup(data: Omit<Startup, "id" | "createdAt">) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getStartups(): Promise<Startup[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Startup));
}

export async function updateStartup(id: string, data: Partial<Startup>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteStartup(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
```

### Step 14: Create Startup Page

Create `src/app/startups/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createStartup, getStartups, updateStartup, deleteStartup } from "@/services/startupService";
import { useAuth } from "@/context/AuthContext";
import { Startup } from "@/types";

const INDUSTRIES = ["FinTech", "HealthTech", "EdTech", "AI/ML", "SaaS", "E-Commerce", "CleanTech", "Other"];
const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

export default function StartupsPage() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Startup | null>(null);
  const [form, setForm] = useState({ name: "", description: "", industry: "", stage: "", pitch: "", website: "" });

  useEffect(() => {
    loadStartups();
  }, []);

  async function loadStartups() {
    const data = await getStartups();
    setStartups(data);
  }

  async function handleSubmit() {
    if (editing) {
      await updateStartup(editing.id, form);
    } else {
      await createStartup({ ...form, founderId: user?.uid || "", founderName: user?.displayName || "" });
    }
    setForm({ name: "", description: "", industry: "", stage: "", pitch: "", website: "" });
    setEditing(null);
    setOpen(false);
    loadStartups();
  }

  async function handleDelete(id: string) {
    await deleteStartup(id);
    loadStartups();
  }

  function handleEdit(startup: Startup) {
    setForm({
      name: startup.name,
      description: startup.description,
      industry: startup.industry,
      stage: startup.stage,
      pitch: startup.pitch,
      website: startup.website || "",
    });
    setEditing(startup);
    setOpen(true);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Startup Profiles</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ name: "", description: "", industry: "", stage: "", pitch: "", website: "" }); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Startup
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Startup" : "Add New Startup"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Startup Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. TechVenture AI" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does your startup do?" />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pitch</Label>
                <Textarea value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} placeholder="Your elevator pitch..." rows={4} />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editing ? "Update Startup" : "Create Startup"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {startups.map((startup) => (
          <Card key={startup.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{startup.name}</CardTitle>
                  <CardDescription>{startup.founderName}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(startup)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(startup.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{startup.description}</p>
              <div className="flex gap-2">
                <Badge>{startup.industry}</Badge>
                <Badge variant="outline">{startup.stage}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 5: Investor Discovery CRUD (0:45 - 1:00)

### Step 15: Create Investor Service

Create `src/services/investorService.ts` — same pattern as startup service but for `investors` collection.

```typescript
import { db } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { Investor } from "@/types";

const COLLECTION = "investors";

export async function createInvestor(data: Omit<Investor, "id" | "createdAt">) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getInvestors(): Promise<Investor[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Investor));
}

export async function updateInvestor(id: string, data: Partial<Investor>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteInvestor(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
```

### Step 16: Create Investor Page

Create `src/app/investors/page.tsx` — same CRUD pattern as Startups page. Fields:
- Name
- Bio
- Focus Areas (comma-separated → split into array)
- Check Size (dropdown: "$10K-$50K", "$50K-$200K", "$200K-$1M", "$1M+")
- Stage Preference (dropdown: same as startup stages)
- Contact Email

---

## PHASE 6: AI Startup Evaluator ⭐ (1:00 - 1:25)

### Step 17: Create AI Evaluation Page

Create `src/app/evaluate/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { evaluateStartup } from "@/lib/gemini";
import { Evaluation } from "@/types";

export default function EvaluatePage() {
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleEvaluate() {
    setLoading(true);
    try {
      const evaluation = await evaluateStartup(pitch);
      setResult(evaluation);
    } catch (error) {
      console.error("Evaluation failed:", error);
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI Startup Evaluator</h1>

      {/* Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Paste Your Pitch</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Paste your startup pitch deck text here... Include details about your market, team, traction, product, and business model."
            rows={8}
          />
          <Button onClick={handleEvaluate} disabled={loading || !pitch} className="mt-4 w-full">
            {loading ? "Analyzing with AI..." : "Evaluate Startup"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Overall Score
                <span className="text-4xl font-bold text-primary">{result.overallScore}/100</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader><CardTitle>Category Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize font-medium">{key}</span>
                      <span>{value as number}/100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-primary rounded-full h-3 transition-all"
                        style={{ width: `${value as number}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths, Weaknesses, Suggestions */}
          <Tabs defaultValue="strengths">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            <TabsContent value="strengths">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {result.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Badge variant="default" className="mt-0.5">✓</Badge>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="weaknesses">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {result.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-0.5">!</Badge>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="suggestions">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {result.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">→</Badge>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 7: Events & Navigation (1:25 - 1:45)

### Step 18: Create Events Page

Create `src/app/events/page.tsx` — simple CRUD with fields:
- Title, Description, Date, Location
- Use same Dialog + Card pattern from Startups page

### Step 19: Create Events Service

Create `src/services/eventService.ts` — same CRUD pattern for `events` collection.

### Step 20: Create Navigation Bar

Create `src/components/Navbar.tsx`:

```typescript
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, signIn, logOut } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">StartupLens</Link>
          <Link href="/startups" className="text-sm hover:text-primary">Startups</Link>
          <Link href="/investors" className="text-sm hover:text-primary">Investors</Link>
          <Link href="/evaluate" className="text-sm hover:text-primary">AI Evaluator</Link>
          <Link href="/events" className="text-sm hover:text-primary">Events</Link>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={logOut}>Sign Out</Button>
            </div>
          ) : (
            <Button onClick={signIn}>Sign In with Google</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
```

Add `<Navbar />` to `layout.tsx` inside the `<AuthProvider>`.

### Step 21: Create Dashboard Home Page

Update `src/app/page.tsx` with:
- Welcome hero section
- Stats cards (total startups, investors, evaluations)
- Quick action buttons to each section

---

## PHASE 8: Polish & Deploy (1:45 - 2:00)

### Step 22: Final Polish

- Add loading states (use shadcn `Skeleton` component)
- Add empty states ("No startups yet, create one!")
- Make sure mobile responsive (shadcn handles most of this)

### Step 23: Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Or connect GitHub repo to Vercel dashboard for auto-deploy.

---

## Firestore Database Schema

```
startups/
  {id}:
    - name: string
    - description: string
    - industry: string
    - stage: string
    - pitch: string
    - website: string (optional)
    - founderId: string
    - founderName: string
    - createdAt: timestamp

investors/
  {id}:
    - name: string
    - bio: string
    - focusAreas: string[]
    - checkSize: string
    - stagePreference: string
    - contactEmail: string (optional)
    - createdAt: timestamp

evaluations/
  {id}:
    - startupId: string
    - startupName: string
    - overallScore: number
    - scores: { market, team, traction, innovation, scalability }
    - strengths: string[]
    - weaknesses: string[]
    - suggestions: string[]
    - summary: string
    - createdAt: timestamp

events/
  {id}:
    - title: string
    - description: string
    - date: string
    - location: string
    - createdAt: timestamp
```

---

## Firestore Security Rules (for hackathon — open access)

Go to Firestore → Rules tab and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ NOTE: This is for hackathon only. In production, lock this down.

---

## Key Points for Judges

1. **AI Integration**: Gemini evaluates startups with structured scoring
2. **Database Design**: Clean Firestore schema with proper relationships
3. **Full CRUD**: Dynamic operations on Startups, Investors, Events
4. **Product Thinking**: Solves real problem — connecting startup ecosystem
5. **Software Architecture**: Clean separation of services, types, components
6. **Modern Stack**: Next.js 14 + Firebase + shadcn + Gemini AI
