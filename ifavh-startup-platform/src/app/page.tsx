"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Wallet,
  CalendarDays,
  Brain,
  UserSearch,
  ChevronRight,
  Plus,
  Sparkles,
  Handshake,
  Download,
  BarChart3,
  Upload,
} from "lucide-react";
import { Startup } from "@/types";
import { createStartup, getStartups } from "@/services/startupService";
import { createInvestor, getInvestors } from "@/services/investorService";
import { getEvents } from "@/services/eventService";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FadeIn, StaggerContainer, StaggerItem, CountUp, PageTransition } from "@/components/motion-primitives";

export default function DashboardPage() {
  const [stats, setStats] = useState({ startups: 0, investors: 0, events: 0 });
  const [recentStartups, setRecentStartups] = useState<Startup[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, i, e] = await Promise.all([
        getStartups(),
        getInvestors(),
        getEvents(),
      ]);
      setStats({ startups: s.length, investors: i.length, events: e.length });
      setRecentStartups(s.slice(0, 5));
    } catch {
      // Firebase not configured yet
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let added = { startups: 0, investors: 0, events: 0 };

      if (data.startups && Array.isArray(data.startups)) {
        for (const s of data.startups) {
          await createStartup({
            name: s.name || "Unnamed",
            description: s.description || "",
            industry: s.industry || "Other",
            stage: s.stage || "Idea",
            pitch: s.pitch || "",
            website: s.website || "",
            founderId: s.founderId || "demo",
            founderName: s.founderName || "Unknown",
          });
          added.startups++;
        }
      }

      if (data.investors && Array.isArray(data.investors)) {
        for (const inv of data.investors) {
          await createInvestor({
            name: inv.name || "Unnamed",
            bio: inv.bio || "",
            focusAreas: inv.focusAreas || [],
            checkSize: inv.checkSize || "",
            stagePreference: inv.stagePreference || "",
            contactEmail: inv.contactEmail || "",
          });
          added.investors++;
        }
      }

      if (data.events && Array.isArray(data.events)) {
        for (const ev of data.events) {
          await addDoc(collection(db, "events"), {
            title: ev.title || "Unnamed",
            description: ev.description || "",
            date: ev.date || "",
            location: ev.location || "",
            createdAt: serverTimestamp(),
          });
          added.events++;
        }
      }

      alert(`Imported ${added.startups} startups, ${added.investors} investors, ${added.events} events!`);
      await loadData();
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed — make sure the file is valid JSON.");
    }
    setImporting(false);
    e.target.value = "";
  }

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <FadeIn className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
            Ecosystem Overview
          </h2>
          <p className="text-[#c2c6d9]">
            Real-time pulse of the StartupLens network.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/sample-data.json"
            download="sample-data.json"
            className="px-5 py-2.5 rounded-lg bg-[#2e3447] text-[#dce1fb] font-medium text-sm flex items-center gap-2 transition-transform active:scale-95 hover:bg-[#3a4259]"
          >
            <Download className="w-4 h-4" />
            Download Sample JSON
          </a>
          <label className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0062ff] to-[#7bd0ff] text-white font-medium text-sm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer ${importing ? "opacity-50 pointer-events-none" : "hover:brightness-110"}`}>
            <Upload className="w-4 h-4" />
            {importing ? "Importing..." : "Import JSON"}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" delay={0.1}>
        <StaggerItem className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Rocket className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-[#c2c6d9] mb-4 flex items-center gap-2">
            Total Startups
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0078a2]/20 text-[#7bd0ff]">+12%</span>
          </p>
          <div className="flex items-baseline gap-2">
            <CountUp target={stats.startups} className="text-4xl font-bold text-[#dce1fb]" />
            <span className="text-[#424656] text-sm">Active</span>
          </div>
          <div className="mt-6 h-1 w-full bg-[#2e3447] rounded-full overflow-hidden">
            <div className="h-full bg-[#b4c5ff] w-[75%] rounded-full" />
          </div>
        </StaggerItem>

        <StaggerItem className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-[#c2c6d9] mb-4 flex items-center gap-2">
            Total Investors
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0078a2]/20 text-[#7bd0ff]">+5%</span>
          </p>
          <div className="flex items-baseline gap-2">
            <CountUp target={stats.investors} className="text-4xl font-bold text-[#dce1fb]" />
            <span className="text-[#424656] text-sm">Verified</span>
          </div>
          <div className="mt-6 h-1 w-full bg-[#2e3447] rounded-full overflow-hidden">
            <div className="h-full bg-[#7bd0ff] w-[45%] rounded-full" />
          </div>
        </StaggerItem>

        <StaggerItem className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-[#c2c6d9] mb-4">Upcoming Events</p>
          <div className="flex items-baseline gap-2">
            <CountUp target={stats.events} className="text-4xl font-bold text-[#dce1fb]" />
            <span className="text-[#424656] text-sm">This Month</span>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Deal Pipeline Widget */}
      <FadeIn delay={0.3} className="mb-12">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-[#dce1fb] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#b4c5ff]" />
            Deal Pipeline
          </h3>
          <Link href="/dealflow" className="text-sm font-medium text-[#b4c5ff] hover:underline">View All</Link>
        </div>
        <div className="bg-[#151b2d] rounded-xl border border-[#424656]/10 overflow-hidden">
          {recentStartups.length > 0 ? (
            <div className="divide-y divide-[#424656]/10">
              {recentStartups.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#191f31]/30 transition-colors">
                  <div className="w-8 h-8 rounded bg-[#191f31] flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-[#b4c5ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#dce1fb] truncate">{s.name}</h4>
                    <p className="text-xs text-[#c2c6d9] truncate">{s.industry}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2e3447] text-[#b4c5ff] shrink-0">
                    {s.stage || "Idea"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#424656]" />
              <p className="text-sm text-[#c2c6d9]">No startups yet. Add your first startup to see the pipeline.</p>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-bold text-[#dce1fb] px-1">Quick Actions</h3>
          <div className="space-y-4">
            <Link href="/startups" className="w-full group p-4 rounded-xl bg-gradient-to-br from-[#0062ff] to-[#b4c5ff] text-white flex items-center justify-between transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div><p className="font-bold text-sm">Add Startup</p><p className="text-xs opacity-80">Onboard new venture</p></div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/evaluate" className="w-full group p-4 rounded-xl bg-[#191f31] text-[#dce1fb] border border-[#424656]/15 flex items-center justify-between transition-all hover:bg-[#2e3447]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0078a2]/30 text-[#7bd0ff] flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div><p className="font-bold text-sm">Evaluate Idea</p><p className="text-xs text-[#c2c6d9]">Run AI risk assessment</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#424656]" />
            </Link>
            <Link href="/investors" className="w-full group p-4 rounded-xl bg-[#191f31] text-[#dce1fb] border border-[#424656]/15 flex items-center justify-between transition-all hover:bg-[#2e3447]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#3e495d]/30 text-[#bcc7de] flex items-center justify-center">
                  <UserSearch className="w-5 h-5" />
                </div>
                <div><p className="font-bold text-sm">Find Investors</p><p className="text-xs text-[#c2c6d9]">Match with capital</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#424656]" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-lg font-bold text-[#dce1fb]">Recent Activity</h3>
            <button className="text-sm font-medium text-[#b4c5ff] hover:underline">View All</button>
          </div>
          <div className="bg-[#151b2d] rounded-xl border border-[#424656]/10 overflow-hidden">
            <div className="divide-y divide-[#424656]/10">
              <div className="p-5 flex items-start gap-4 hover:bg-[#191f31]/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#191f31] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#7bd0ff]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-[#dce1fb]">Platform Launched</h4>
                    <span className="text-[10px] text-[#424656] uppercase">Just now</span>
                  </div>
                  <p className="text-xs text-[#c2c6d9] leading-relaxed">StartupLens ecosystem is live. Start adding startups and investors.</p>
                </div>
              </div>
              <div className="p-5 flex items-start gap-4 hover:bg-[#191f31]/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#0062ff]/20 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-[#b4c5ff]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-[#dce1fb]">IFAVH AI Hackathon</h4>
                    <span className="text-[10px] text-[#424656] uppercase">Today</span>
                  </div>
                  <p className="text-xs text-[#c2c6d9] leading-relaxed">Building the future of startup ecosystems at Space42 Arena, Abu Dhabi.</p>
                </div>
              </div>
              <div className="p-5 flex items-start gap-4 hover:bg-[#191f31]/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#191f31] flex items-center justify-center shrink-0">
                  <Handshake className="w-5 h-5 text-[#bcc7de]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-[#dce1fb]">AI Matching Ready</h4>
                    <span className="text-[10px] text-[#424656] uppercase">Active</span>
                  </div>
                  <p className="text-xs text-[#c2c6d9] leading-relaxed">Gemini-powered investor matching is online. Add startup profiles to get AI recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
