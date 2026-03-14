"use client";

import { Network } from "lucide-react";

export default function MatchPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
        AI Investor Matching
      </h1>
      <p className="text-[#c2c6d9] mb-12">
        Coming soon — AI-powered matching between startups and investors.
      </p>
      <div className="text-center py-20 text-[#c2c6d9]">
        <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">
          Add startups and investors first
        </p>
        <p className="text-sm mt-2">
          The AI matching engine will analyze profiles and suggest optimal
          founder-investor pairings.
        </p>
      </div>
    </div>
  );
}
