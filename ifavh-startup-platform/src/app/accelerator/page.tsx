"use client";

import { GraduationCap, Users, Calendar, Award, ArrowRight } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";

const PROGRAMS = [
  {
    name: "Batch 2025-Q1",
    status: "Active",
    startups: 12,
    duration: "12 weeks",
    start: "Jan 15, 2025",
    end: "Apr 10, 2025",
    focus: ["AI/ML", "FinTech", "HealthTech"],
  },
  {
    name: "Batch 2024-Q4",
    status: "Completed",
    startups: 10,
    duration: "12 weeks",
    start: "Oct 1, 2024",
    end: "Dec 20, 2024",
    focus: ["CleanTech", "EdTech"],
  },
  {
    name: "Batch 2025-Q2",
    status: "Upcoming",
    startups: 0,
    duration: "10 weeks",
    start: "May 1, 2025",
    end: "Jul 10, 2025",
    focus: ["DeepTech", "SaaS", "Biotech"],
  },
];

const MILESTONES = [
  { week: 1, label: "Kick-off & Team Setup" },
  { week: 3, label: "MVP Development Sprint" },
  { week: 6, label: "Mid-Program Review" },
  { week: 9, label: "Investor Prep" },
  { week: 12, label: "Demo Day" },
];

const statusColor: Record<string, string> = {
  Active: "bg-[#34d399]/10 text-[#34d399]",
  Completed: "bg-[#424656]/20 text-[#c2c6d9]",
  Upcoming: "bg-[#0062ff]/10 text-[#7bd0ff]",
};

export default function AcceleratorPage() {
  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
          Accelerator Programs
        </h1>
        <p className="text-[#c2c6d9]">
          Manage cohort-based programs and track startup progress.
        </p>
      </FadeIn>

      {/* Summary */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Programs", value: PROGRAMS.length, icon: GraduationCap, color: "text-[#b4c5ff]" },
          { label: "Active Cohort", value: PROGRAMS.filter((p) => p.status === "Active").length, icon: Calendar, color: "text-[#34d399]" },
          { label: "Startups Enrolled", value: PROGRAMS.reduce((a, p) => a + p.startups, 0), icon: Users, color: "text-[#7bd0ff]" },
          { label: "Graduated", value: PROGRAMS.filter((p) => p.status === "Completed").reduce((a, p) => a + p.startups, 0), icon: Award, color: "text-[#f59e0b]" },
        ].map((s) => (
          <StaggerItem key={s.label} className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#c2c6d9]">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#dce1fb]">{s.value}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Programs */}
      <div className="space-y-4 mb-8">
        {PROGRAMS.map((p) => (
          <div key={p.name} className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-[#dce1fb]">{p.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <span className="text-xs text-[#c2c6d9]">{p.startups} startups</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[#c2c6d9] mb-3">
              <span>Duration: {p.duration}</span>
              <span>Start: {p.start}</span>
              <span>End: {p.end}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.focus.map((f) => (
                <span
                  key={f}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#2e3447] text-[#b4c5ff]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Milestones Timeline */}
      <div className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
        <h2 className="text-sm font-bold text-[#dce1fb] mb-4">Program Milestones</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {MILESTONES.map((m, i) => (
            <div key={m.week} className="flex items-center shrink-0">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#2e3447] flex items-center justify-center mb-1 border border-[#424656]/20">
                  <span className="text-xs font-bold text-[#b4c5ff]">W{m.week}</span>
                </div>
                <p className="text-[10px] text-[#c2c6d9] max-w-[80px]">{m.label}</p>
              </div>
              {i < MILESTONES.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[#424656] mx-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
