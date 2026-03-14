"use client";

import { useEffect, useState } from "react";
import { BarChart3, Rocket, ArrowRight } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";
import { getStartups } from "@/services/startupService";
import { Startup } from "@/types";

const PIPELINE_STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

export default function DealFlowPage() {
  const [startups, setStartups] = useState<Startup[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStartups();
        setStartups(data);
      } catch {
        // Firebase not configured yet
      }
    }
    load();
  }, []);

  const grouped = PIPELINE_STAGES.map((stage) => ({
    stage,
    items: startups.filter((s) => s.stage === stage),
  }));

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
          Deal Flow Pipeline
        </h1>
        <p className="text-[#c2c6d9]">
          Track startups across funding stages from idea to growth.
        </p>
      </FadeIn>

      {/* Pipeline Stats */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {grouped.map((g) => (
          <div
            key={g.stage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#151b2d] border border-[#424656]/10 shrink-0"
          >
            <span className="text-2xl font-bold text-[#dce1fb]">{g.items.length}</span>
            <span className="text-xs text-[#c2c6d9]">{g.stage}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] shrink-0">
          <span className="text-2xl font-bold text-white">{startups.length}</span>
          <span className="text-xs text-white/80">Total</span>
        </div>
      </div>

      {/* Kanban Pipeline */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" delay={0.15}>
        {grouped.map((g) => (
          <StaggerItem key={g.stage} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-[#c2c6d9] uppercase tracking-widest">
                {g.stage}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2e3447] text-[#dce1fb]">
                {g.items.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {g.items.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-[#424656]/20 text-center">
                  <p className="text-[10px] text-[#424656]">No deals</p>
                </div>
              ) : (
                g.items.map((startup) => (
                  <div
                    key={startup.id}
                    className="bg-[#151b2d] p-4 rounded-lg border border-[#424656]/10 hover:bg-[#191f31] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded bg-[#191f31] flex items-center justify-center">
                        <Rocket className="w-3.5 h-3.5 text-[#b4c5ff]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#dce1fb] leading-tight">
                          {startup.name}
                        </h4>
                        <p className="text-[10px] text-[#424656]">
                          {startup.industry}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#c2c6d9] line-clamp-2 leading-relaxed">
                      {startup.pitch || startup.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {startups.length === 0 && (
        <div className="text-center py-16 text-[#c2c6d9]">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No deals in pipeline</p>
          <p className="text-sm">
            Add startups first — they&apos;ll appear here organized by funding stage.
          </p>
        </div>
      )}
    </PageTransition>
  );
}
