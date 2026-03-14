import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

const STARTUPS = [
  {
    name: "NeuraTech AI",
    description: "Enterprise AI platform that automates complex document processing using proprietary LLM fine-tuning. Reduces manual review time by 85%.",
    industry: "AI/ML",
    stage: "Series A",
    pitch: "We're building the brain behind enterprise document intelligence — processing contracts, invoices, and compliance docs 10x faster than humans.",
    website: "https://neuratech.ai",
    founderId: "demo",
    founderName: "Sarah Chen",
  },
  {
    name: "GreenCharge",
    description: "Smart EV charging network with AI-optimized grid balancing. Operating 500+ stations across the UAE and Saudi Arabia.",
    industry: "CleanTech",
    stage: "Seed",
    pitch: "EV adoption is booming in the Gulf — we make charging stations smarter, cheaper, and grid-friendly using real-time AI optimization.",
    website: "https://greencharge.io",
    founderId: "demo",
    founderName: "Ahmed Al-Rashid",
  },
  {
    name: "FinFlow",
    description: "Open banking API platform for MENA startups. Connects 40+ banks, enabling instant payment rails and financial data aggregation.",
    industry: "FinTech",
    stage: "Pre-Seed",
    pitch: "We're the Plaid of the Middle East — one API to connect every bank account, wallet, and payment method in the region.",
    website: "https://finflow.dev",
    founderId: "demo",
    founderName: "Layla Hassan",
  },
  {
    name: "MedSync",
    description: "AI-powered clinical decision support system for hospitals. Integrates patient records, imaging, and lab results into unified diagnostic dashboards.",
    industry: "HealthTech",
    stage: "Series B",
    pitch: "Doctors spend 40% of their time on admin. MedSync gives them an AI copilot that pulls insights from every data source in the hospital.",
    website: "https://medsync.health",
    founderId: "demo",
    founderName: "Dr. Omar Khalil",
  },
  {
    name: "EduVerse",
    description: "Immersive VR learning platform for K-12 education. Students explore interactive 3D environments for science, history, and geography.",
    industry: "EdTech",
    stage: "Seed",
    pitch: "Textbooks are dead. We turn every classroom into a virtual field trip — from the surface of Mars to ancient Egypt.",
    website: "https://eduverse.learn",
    founderId: "demo",
    founderName: "Fatima Al-Mansoori",
  },
  {
    name: "LogiChain",
    description: "Blockchain-based supply chain tracking for Gulf region logistics. Real-time visibility from port to last mile delivery.",
    industry: "Logistics",
    stage: "Idea",
    pitch: "Supply chain fraud costs $4T/year globally. Our blockchain layer makes every shipment transparent and tamper-proof.",
    founderId: "demo",
    founderName: "Raj Patel",
  },
  {
    name: "AgroSense",
    description: "IoT + AI precision agriculture platform for arid climates. Reduces water consumption by 60% while boosting crop yield.",
    industry: "AgriTech",
    stage: "Pre-Seed",
    pitch: "Water scarcity meets food demand in the desert. We use sensor networks and ML to grow more food with less water.",
    founderId: "demo",
    founderName: "Noura Al-Suwaidi",
  },
  {
    name: "CyberShield",
    description: "AI-driven cybersecurity platform for SMBs. Automated threat detection, vulnerability scanning, and incident response in one dashboard.",
    industry: "Cybersecurity",
    stage: "Growth",
    pitch: "Small businesses are the #1 target for hackers but can't afford enterprise security. We give them Fortune 500 protection at SMB prices.",
    website: "https://cybershield.security",
    founderId: "demo",
    founderName: "Khalid Mahmoud",
  },
];

const INVESTORS = [
  {
    name: "Venture Gulf Capital",
    bio: "Leading early-stage VC firm focused on MENA tech startups. $200M AUM across 3 funds. Portfolio includes 45+ companies with 8 exits.",
    focusAreas: ["AI/ML", "FinTech", "SaaS"],
    checkSize: "$500K - $5M",
    stagePreference: "Seed",
    contactEmail: "deals@venturegulf.vc",
  },
  {
    name: "TechBridge Partners",
    bio: "Growth-stage investment firm bridging Silicon Valley and Abu Dhabi. We back founders scaling from Series A to IPO.",
    focusAreas: ["HealthTech", "CleanTech", "DeepTech"],
    checkSize: "$2M - $15M",
    stagePreference: "Series A",
    contactEmail: "info@techbridge.partners",
  },
  {
    name: "Al Noor Angels",
    bio: "Angel syndicate of 80+ MENA tech executives and entrepreneurs. Hands-on mentorship with every investment.",
    focusAreas: ["EdTech", "FinTech", "Cybersecurity"],
    checkSize: "$50K - $500K",
    stagePreference: "Pre-Seed",
    contactEmail: "hello@alnoorangels.com",
  },
  {
    name: "Desert Innovation Fund",
    bio: "Government-backed fund supporting deep-tech and climate innovation in the GCC. Focus on sustainability and food security.",
    focusAreas: ["CleanTech", "AgriTech", "Logistics"],
    checkSize: "$1M - $10M",
    stagePreference: "Seed",
    contactEmail: "apply@desertinnovation.fund",
  },
  {
    name: "Horizon Ventures ME",
    bio: "Corporate VC arm of a major telecom group. Strategic investments in AI, IoT, and digital infrastructure.",
    focusAreas: ["AI/ML", "Cybersecurity", "IoT"],
    checkSize: "$3M - $20M",
    stagePreference: "Series B",
    contactEmail: "ventures@horizonme.com",
  },
];

const EVENTS = [
  {
    title: "IFAVH AI Hackathon 2025",
    description: "2-hour AI-powered hackathon at Space42 Arena. Build an MVP for a startup ecosystem platform.",
    date: "2025-03-14",
    location: "Space42 Arena, Abu Dhabi",
  },
  {
    title: "MENA Startup Summit",
    description: "3-day conference bringing together 2000+ founders, investors, and ecosystem builders from across the region.",
    date: "2025-04-20",
    location: "ADNEC, Abu Dhabi",
  },
  {
    title: "FinTech Demo Day",
    description: "10 fintech startups pitch to a panel of VCs and banking executives. $500K in prizes.",
    date: "2025-05-05",
    location: "DIFC Innovation Hub, Dubai",
  },
  {
    title: "Climate Tech Founders Meetup",
    description: "Monthly networking event for cleantech and agritech founders in the Gulf region.",
    date: "2025-03-28",
    location: "Hub71, Abu Dhabi",
  },
];

export async function POST() {
  try {
    // Check if data already exists
    const existing = await getDocs(collection(db, "startups"));
    if (existing.size > 0) {
      return NextResponse.json(
        { message: `Database already has ${existing.size} startups. Skipping seed.` },
        { status: 200 }
      );
    }

    // Seed startups
    for (const s of STARTUPS) {
      await addDoc(collection(db, "startups"), { ...s, createdAt: serverTimestamp() });
    }

    // Seed investors
    for (const inv of INVESTORS) {
      await addDoc(collection(db, "investors"), { ...inv, createdAt: serverTimestamp() });
    }

    // Seed events
    for (const ev of EVENTS) {
      await addDoc(collection(db, "events"), { ...ev, createdAt: serverTimestamp() });
    }

    return NextResponse.json({
      message: "Seed complete!",
      startups: STARTUPS.length,
      investors: INVESTORS.length,
      events: EVENTS.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
