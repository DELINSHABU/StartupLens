import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQ46wRjJ88ttOG3JzSPP8ir1FhJHI-7hE",
  authDomain: "startuplens-98093.firebaseapp.com",
  projectId: "startuplens-98093",
  storageBucket: "startuplens-98093.firebasestorage.app",
  messagingSenderId: "122032735784",
  appId: "1:122032735784:web:ba6539846e1b6df029571d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.now();

const startups = [
  { name: "NeuraTech AI", description: "Enterprise AI platform that automates complex document processing using proprietary LLM fine-tuning.", industry: "AI/ML", stage: "Series A", pitch: "We build the brain behind enterprise document intelligence — processing contracts and compliance docs 10x faster.", website: "https://neuratech.ai", founderId: "demo", founderName: "Sarah Chen", createdAt: now },
  { name: "GreenCharge", description: "Smart EV charging network with AI-optimized grid balancing across the UAE and Saudi Arabia.", industry: "CleanTech", stage: "Seed", pitch: "EV adoption is booming in the Gulf — we make charging stations smarter and grid-friendly.", website: "https://greencharge.io", founderId: "demo", founderName: "Ahmed Al-Rashid", createdAt: now },
  { name: "FinFlow", description: "Open banking API platform for MENA startups. Connects 40+ banks with instant payment rails.", industry: "FinTech", stage: "Pre-Seed", pitch: "We are the Plaid of the Middle East — one API to connect every bank account in the region.", website: "https://finflow.dev", founderId: "demo", founderName: "Layla Hassan", createdAt: now },
  { name: "MedSync", description: "AI-powered clinical decision support system integrating patient records, imaging, and lab results.", industry: "HealthTech", stage: "Series B", pitch: "Doctors spend 40% of their time on admin. MedSync gives them an AI copilot for diagnostics.", website: "https://medsync.health", founderId: "demo", founderName: "Dr. Omar Khalil", createdAt: now },
  { name: "EduVerse", description: "Immersive VR learning platform for K-12 education with interactive 3D environments.", industry: "EdTech", stage: "Seed", pitch: "Textbooks are dead. We turn every classroom into a virtual field trip.", founderId: "demo", founderName: "Fatima Al-Mansoori", createdAt: now },
  { name: "LogiChain", description: "Blockchain-based supply chain tracking for Gulf region logistics with real-time visibility.", industry: "Logistics", stage: "Idea", pitch: "Our blockchain layer makes every shipment transparent and tamper-proof.", founderId: "demo", founderName: "Raj Patel", createdAt: now },
  { name: "AgroSense", description: "IoT + AI precision agriculture platform for arid climates. Reduces water use by 60%.", industry: "AgriTech", stage: "Pre-Seed", pitch: "We use sensor networks and ML to grow more food with less water in the desert.", founderId: "demo", founderName: "Noura Al-Suwaidi", createdAt: now },
  { name: "CyberShield", description: "AI-driven cybersecurity platform for SMBs with automated threat detection and response.", industry: "Cybersecurity", stage: "Growth", pitch: "We give small businesses Fortune 500 security protection at SMB prices.", founderId: "demo", founderName: "Khalid Mahmoud", createdAt: now },
];

const investors = [
  { name: "Venture Gulf Capital", bio: "Leading early-stage VC focused on MENA tech. $200M AUM, 45+ companies, 8 exits.", focusAreas: ["AI/ML", "FinTech", "SaaS"], checkSize: "$500K - $5M", stagePreference: "Seed", contactEmail: "deals@venturegulf.vc", createdAt: now },
  { name: "TechBridge Partners", bio: "Growth-stage firm bridging Silicon Valley and Abu Dhabi. Series A to IPO.", focusAreas: ["HealthTech", "CleanTech", "DeepTech"], checkSize: "$2M - $15M", stagePreference: "Series A", contactEmail: "info@techbridge.partners", createdAt: now },
  { name: "Al Noor Angels", bio: "Angel syndicate of 80+ MENA tech executives. Hands-on mentorship.", focusAreas: ["EdTech", "FinTech", "Cybersecurity"], checkSize: "$50K - $500K", stagePreference: "Pre-Seed", contactEmail: "hello@alnoorangels.com", createdAt: now },
  { name: "Desert Innovation Fund", bio: "Government-backed fund for deep-tech and climate innovation in the GCC.", focusAreas: ["CleanTech", "AgriTech", "Logistics"], checkSize: "$1M - $10M", stagePreference: "Seed", contactEmail: "apply@desertinnovation.fund", createdAt: now },
  { name: "Horizon Ventures ME", bio: "Corporate VC of a major telecom group. Strategic AI, IoT, and digital infra investments.", focusAreas: ["AI/ML", "Cybersecurity", "IoT"], checkSize: "$3M - $20M", stagePreference: "Series B", contactEmail: "ventures@horizonme.com", createdAt: now },
];

const events = [
  { title: "IFAVH AI Hackathon 2025", description: "2-hour AI hackathon at Space42 Arena. Build an MVP for a startup platform.", date: "2025-03-14", location: "Space42 Arena, Abu Dhabi", createdAt: now },
  { title: "MENA Startup Summit", description: "3-day conference with 2000+ founders and investors from the region.", date: "2025-04-20", location: "ADNEC, Abu Dhabi", createdAt: now },
  { title: "FinTech Demo Day", description: "10 fintech startups pitch to VCs and banking execs. $500K in prizes.", date: "2025-05-05", location: "DIFC Innovation Hub, Dubai", createdAt: now },
  { title: "Climate Tech Meetup", description: "Monthly networking for cleantech and agritech founders in the Gulf.", date: "2025-03-28", location: "Hub71, Abu Dhabi", createdAt: now },
];

async function seed() {
  console.log("Seeding startups...");
  for (const s of startups) {
    const ref = await addDoc(collection(db, "startups"), s);
    console.log(`  + ${s.name} (${ref.id})`);
  }

  console.log("Seeding investors...");
  for (const inv of investors) {
    const ref = await addDoc(collection(db, "investors"), inv);
    console.log(`  + ${inv.name} (${ref.id})`);
  }

  console.log("Seeding events...");
  for (const ev of events) {
    const ref = await addDoc(collection(db, "events"), ev);
    console.log(`  + ${ev.title} (${ref.id})`);
  }

  console.log("\nDone! 8 startups, 5 investors, 4 events added.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
