"use client";

import { useAuth } from "@/context/AuthContext";
import { Rocket, LogIn, Loader2 } from "lucide-react";
import { GsapPulse } from "@/components/motion-primitives";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0c1324]">
        <Loader2 className="w-8 h-8 text-[#b4c5ff] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0c1324]">
        <div className="text-center max-w-md px-8">
          <GsapPulse className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0062ff] to-[#b4c5ff] flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </GsapPulse>
          <h1 className="text-3xl font-bold text-[#dce1fb] mb-2">StartupLens</h1>
          <p className="text-[#c2c6d9] mb-8">
            AI-powered startup ecosystem platform. Sign in to access your dashboard, startups, investors, and more.
          </p>
          <button
            onClick={signIn}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white font-semibold text-sm flex items-center gap-3 mx-auto transition-transform active:scale-95 hover:brightness-110"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-xs text-[#424656] mt-6">
            Built at IFAVH AI Hackathon 2025 — Space42 Arena, Abu Dhabi
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
