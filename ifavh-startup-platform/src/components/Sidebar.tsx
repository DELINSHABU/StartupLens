"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Rocket,
  Wallet,
  Brain,
  Network,
  CalendarDays,
  BarChart3,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { GsapPulse, SlideIn } from "@/components/motion-primitives";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/startups", label: "Startups", icon: Rocket },
  { href: "/investors", label: "Investors", icon: Wallet },
  { href: "/dealflow", label: "Deal Flow", icon: BarChart3 },
  { href: "/fundraising", label: "Fundraising", icon: TrendingUp },
  { href: "/accelerator", label: "Accelerator", icon: GraduationCap },
  { href: "/evaluate", label: "AI Evaluator", icon: Brain },
  { href: "/match", label: "AI Match", icon: Network },
  { href: "/events", label: "Events", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#151b2d] flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <GsapPulse className="w-8 h-8 rounded bg-gradient-to-br from-[#0062ff] to-[#b4c5ff] flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </GsapPulse>
        <div>
          <h1 className="text-sm font-bold text-[#dce1fb] tracking-tight">
            StartupLens
          </h1>
          <p className="text-[10px] text-[#b4c5ff] uppercase tracking-[0.1em]">
            AI Ecosystem
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <SlideIn key={item.href} delay={0.05 * i}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#191f31] text-[#dce1fb]"
                    : "text-[#c2c6d9] hover:bg-[#2e3447]"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#b4c5ff]" : ""
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </SlideIn>
          );
        })}
      </nav>

      {/* AI Insight Card */}
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-[#2e3447]/50 border border-[#424656]/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#7bd0ff] shadow-[0_0_15px_rgba(0,120,162,0.3)]" />
            <span className="text-[10px] font-bold text-[#7bd0ff] uppercase tracking-wider">
              AI Insight
            </span>
          </div>
          <p className="text-xs text-[#c2c6d9] leading-relaxed">
            3 new matches found based on your recent activity.
          </p>
        </div>
      </div>
    </aside>
  );
}
