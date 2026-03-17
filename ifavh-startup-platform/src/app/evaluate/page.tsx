"use client";

import { useState } from "react";
import {
  Brain,
  Loader2,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { PageTransition, FadeIn } from "@/components/motion-primitives";
import { evaluateStartup, coachPitch } from "@/lib/gemini";

type ActiveTool = "evaluate" | "coach";

interface EvaluateResult {
  overallScore: number;
  scores: Record<string, number>;
  verdict: string;
  strengths: string[];
  suggestions: string[];
  investorInterest: string;
  investorReason: string;
  confidence: number;
  insights?: {
    marketSentiment?: string;
    competitorDensity?: string;
    recentExits?: string;
    redFlags?: string;
  };
}

interface PitchCoachResult {
  clarityScore: number;
  persuasivenessScore: number;
  strengths: string[];
  issues: string[];
  suggestedRewrite: string;
  shortVersion: string;
  investorHook: string;
  nextSteps: string[];
}

export default function EvaluatePage() {
  const [name, setName] = useState("");
  const [pitch, setPitch] = useState("");
  const [activeTool, setActiveTool] = useState<ActiveTool>("evaluate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResult | null>(null);
  const [coachResult, setCoachResult] = useState<PitchCoachResult | null>(null);
  const [error, setError] = useState("");

  async function handleEvaluate() {
    if (!pitch.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (activeTool === "evaluate") {
        const data = (await evaluateStartup(
          name || "Unnamed Startup",
          pitch
        )) as EvaluateResult;
        setResult(data);
        setCoachResult(null);
      } else {
        const data = (await coachPitch(
          name || "Unnamed Startup",
          pitch
        )) as PitchCoachResult;
        setCoachResult(data);
        setResult(null);
      }
    } catch (err: unknown) {
      const fallbackMessage =
        activeTool === "evaluate"
          ? "Evaluation failed. Check your NVIDIA_API_KEY."
          : "Pitch coaching failed. Check your NVIDIA_API_KEY.";
      setError(err instanceof Error ? err.message : fallbackMessage);
      console.error(err);
    }
    setLoading(false);
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-[#b4c5ff]";
    if (score >= 60) return "text-[#7bd0ff]";
    if (score >= 40) return "text-[#bcc7de]";
    return "text-[#ffb4ab]";
  };

  const barColor = (score: number) => {
    if (score >= 80) return "bg-[#b4c5ff]";
    if (score >= 60) return "bg-[#7bd0ff]";
    if (score >= 40) return "bg-[#bcc7de]";
    return "bg-[#ffb4ab]";
  };

  const isEvaluateMode = activeTool === "evaluate";
  const hasResult = isEvaluateMode ? Boolean(result) : Boolean(coachResult);
  const clarityScore = Number(coachResult?.clarityScore ?? 0);
  const persuasivenessScore = Number(coachResult?.persuasivenessScore ?? 0);

  return (
    <PageTransition className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <FadeIn className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter uppercase bg-[#0078a2] text-[#ebf6ff] flex items-center gap-1">
            <Brain className="w-3 h-3" /> Beta Access
          </span>
          <h2 className="text-sm text-[#b4c5ff] tracking-widest uppercase">
            Intelligence Aperture
          </h2>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#dce1fb]">
          {isEvaluateMode ? "AI Startup Evaluator" : "AI Pitch Coach"}
        </h1>
        <p className="text-[#c2c6d9] max-w-2xl text-lg">
          {isEvaluateMode
            ? "Harness AI market analysis to objectively stress-test your business model."
            : "Get founder-focused feedback on clarity, persuasiveness, and a stronger rewrite for your pitch."}
        </p>
      </FadeIn>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-[#151b2d] p-8 rounded-xl border border-[#424656]/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b4c5ff]/5 rounded-full blur-3xl transition-all group-hover:bg-[#b4c5ff]/10" />
            <div className="relative space-y-6">
              <div className="bg-[#070d1f] p-1 rounded-lg border border-[#424656]/20 grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    setActiveTool("evaluate");
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${
                    isEvaluateMode
                      ? "bg-[#0062ff] text-white"
                      : "text-[#c2c6d9] hover:bg-[#2e3447]"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Evaluator
                </button>
                <button
                  onClick={() => {
                    setActiveTool("coach");
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${
                    !isEvaluateMode
                      ? "bg-[#0062ff] text-white"
                      : "text-[#c2c6d9] hover:bg-[#2e3447]"
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Pitch Coach
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#c2c6d9] tracking-widest uppercase">
                  Startup Name
                </label>
                <input
                  className="w-full bg-[#070d1f] border border-[#424656]/20 rounded-lg p-4 focus:ring-2 focus:ring-[#b4c5ff]/20 focus:border-[#b4c5ff] outline-none text-[#dce1fb] transition-all placeholder:text-[#c2c6d9]/30"
                  placeholder="e.g. NeuralNode"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#c2c6d9] tracking-widest uppercase">
                  {isEvaluateMode ? "Pitch Description" : "Pitch To Coach"}
                </label>
                <textarea
                  className="w-full bg-[#070d1f] border border-[#424656]/20 rounded-lg p-4 focus:ring-2 focus:ring-[#b4c5ff]/20 focus:border-[#b4c5ff] outline-none text-[#dce1fb] transition-all placeholder:text-[#c2c6d9]/30 resize-none"
                  placeholder={
                    isEvaluateMode
                      ? "Detail your value proposition, target market, and technical advantage..."
                      : "Paste your current pitch. Include problem, solution, traction, and why now..."
                  }
                  rows={8}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
                <div className="flex justify-between items-center text-[10px] text-[#c2c6d9]/50 uppercase tracking-widest">
                  <span>
                    {isEvaluateMode ? "Recommended: 200+ words" : "Recommended: 120+ words"}
                  </span>
                  <span>{pitch.length} / 2000 characters</span>
                </div>
              </div>
              <button
                onClick={handleEvaluate}
                disabled={loading || !pitch.trim()}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-lg bg-gradient-to-br from-[#0062ff] to-[#b4c5ff] font-bold text-white shadow-lg shadow-[#0062ff]/20 hover:shadow-[#0062ff]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>{isEvaluateMode ? <Brain className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}</>
                )}
                {loading
                  ? isEvaluateMode
                    ? "Analyzing..."
                    : "Coaching..."
                  : isEvaluateMode
                  ? "Run Deep Analysis"
                  : "Coach My Pitch"}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] text-sm">
              {error}
            </div>
          )}
        </section>

        {/* Right: Results */}
        <section className="lg:col-span-7 space-y-6">
          {!hasResult && !loading && (
            <div className="bg-[#191f31] p-12 rounded-2xl border border-[#424656]/10 text-center">
              {isEvaluateMode ? (
                <Brain className="w-16 h-16 mx-auto mb-4 text-[#424656]" />
              ) : (
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-[#424656]" />
              )}
              <p className="text-[#c2c6d9] text-lg font-medium">
                {isEvaluateMode
                  ? "Enter a pitch to get AI analysis"
                  : "Enter a pitch to get AI coaching"}
              </p>
              <p className="text-xs text-[#424656] mt-2">
                {isEvaluateMode
                  ? "Results will appear here with scores, strengths, and suggestions"
                  : "Feedback will appear here with clarity, persuasiveness, and rewrites"}
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[#191f31] p-12 rounded-2xl border border-[#b4c5ff]/10 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#b4c5ff] animate-spin" />
              <p className="text-[#dce1fb] text-lg font-medium">
                {isEvaluateMode
                  ? "Analyzing with Gemini AI..."
                  : "Coaching with NVIDIA AI..."}
              </p>
              <p className="text-xs text-[#c2c6d9] mt-2">
                {isEvaluateMode
                  ? "Evaluating market fit, solution depth, uniqueness, and viability"
                  : "Scoring clarity, improving persuasion, and rewriting your pitch"}
              </p>
            </div>
          )}

          {isEvaluateMode && result && (
            <>
              {/* Analysis Report Card */}
              <div className="bg-[#191f31] p-8 rounded-2xl border border-[#b4c5ff]/10 relative overflow-hidden">
                {/* Header with Score */}
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[#dce1fb]">
                      Analysis Report:{" "}
                      <span className="text-[#b4c5ff]">
                        {name || "Startup"}
                      </span>
                    </h3>
                    <p className="text-sm text-[#c2c6d9] flex items-center gap-2">
                      Evaluated just now
                    </p>
                  </div>
                  {/* Circular Score */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        className="text-[#2e3447]"
                        cx="48"
                        cy="48"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-[#b4c5ff]"
                        cx="48"
                        cy="48"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeDasharray="251.2"
                        strokeDashoffset={
                          251.2 - (251.2 * result.overallScore) / 100
                        }
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-[#dce1fb]">
                        {result.overallScore}
                      </span>
                      <span className="text-[8px] tracking-widest uppercase text-[#b4c5ff]">
                        Score
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scores + Verdict Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                  {/* Score Bars */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-widest uppercase text-[#c2c6d9]/60">
                      Core Performance
                    </h4>
                    <div className="space-y-5">
                      {Object.entries(result.scores).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className={scoreColor(Number(value))}>
                                {value}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-[#2e3447] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${barColor(
                                  Number(value)
                                )}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Verdict + Strengths */}
                  <div className="space-y-6">
                    <div className="bg-[#2e3447]/40 p-4 rounded-xl border-l-4 border-[#7bd0ff]">
                      <h4 className="text-[10px] tracking-widest uppercase text-[#7bd0ff] mb-2">
                        One-Line Verdict
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic text-[#dce1fb]">
                        &quot;{result.verdict}&quot;
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-widest uppercase text-[#c2c6d9]/60">
                        Key Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.strengths.map(
                          (s: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-[#0062ff]/10 border border-[#b4c5ff]/20 text-[11px] font-medium text-[#b4c5ff]"
                            >
                              {s}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions + Investor Interest */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-[#7bd0ff]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Improvement Suggestions
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-[#c2c6d9]">
                      {result.suggestions.map(
                        (s: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-[#7bd0ff] font-bold">•</span>
                            {s}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-[#0062ff] p-5 rounded-xl flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Investor Interest
                    </h4>
                    <div className="text-3xl font-black text-white">
                      {result.investorInterest}
                    </div>
                    <p className="text-[10px] text-white/70 leading-tight">
                      {result.investorReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#070d1f] rounded-xl border border-[#424656]/10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#7bd0ff]/10 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-[#7bd0ff]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Analysis Confidence</p>
                    <p className="text-[10px] text-[#c2c6d9]">
                      Based on cross-referenced market indicators
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#7bd0ff] leading-none">
                    {result.confidence}%
                  </p>
                  <p className="text-[10px] text-[#c2c6d9] uppercase tracking-tighter">
                    Certainty index
                  </p>
                </div>
              </div>

              {/* Bottom Insights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/5">
                  <TrendingUp className="w-5 h-5 text-[#b4c5ff] mb-4" />
                  <h5 className="text-sm font-bold mb-1">Market Sentiment</h5>
                  <p className="text-xs text-[#c2c6d9]">
                    {result.insights?.marketSentiment || "N/A"}
                  </p>
                </div>
                <div className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/5">
                  <Users className="w-5 h-5 text-[#7bd0ff] mb-4" />
                  <h5 className="text-sm font-bold mb-1">Competitor Density</h5>
                  <p className="text-xs text-[#c2c6d9]">
                    {result.insights?.competitorDensity || "N/A"}
                  </p>
                </div>
                <div className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/5">
                  <DollarSign className="w-5 h-5 text-[#bcc7de] mb-4" />
                  <h5 className="text-sm font-bold mb-1">Recent Exits</h5>
                  <p className="text-xs text-[#c2c6d9]">
                    {result.insights?.recentExits || "N/A"}
                  </p>
                </div>
                <div className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/5">
                  <AlertTriangle className="w-5 h-5 text-[#ffb4ab] mb-4" />
                  <h5 className="text-sm font-bold mb-1">Red Flags</h5>
                  <p className="text-xs text-[#c2c6d9]">
                    {result.insights?.redFlags || "None detected"}
                  </p>
                </div>
              </div>
            </>
          )}

          {!isEvaluateMode && coachResult && (
            <>
              <div className="bg-[#191f31] p-8 rounded-2xl border border-[#b4c5ff]/10 relative overflow-hidden space-y-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-[#dce1fb]">
                    Pitch Coach Report:{" "}
                    <span className="text-[#b4c5ff]">{name || "Startup"}</span>
                  </h3>
                  <p className="text-sm text-[#c2c6d9]">Coached just now</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10 space-y-2">
                    <p className="text-[10px] tracking-widest uppercase text-[#c2c6d9]/60">
                      Clarity Score
                    </p>
                    <p className={`text-3xl font-black ${scoreColor(clarityScore)}`}>
                      {clarityScore}%
                    </p>
                    <div className="h-1.5 w-full bg-[#2e3447] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(clarityScore)}`}
                        style={{ width: `${clarityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10 space-y-2">
                    <p className="text-[10px] tracking-widest uppercase text-[#c2c6d9]/60">
                      Persuasiveness Score
                    </p>
                    <p className={`text-3xl font-black ${scoreColor(persuasivenessScore)}`}>
                      {persuasivenessScore}%
                    </p>
                    <div className="h-1.5 w-full bg-[#2e3447] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(persuasivenessScore)}`}
                        style={{ width: `${persuasivenessScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#b4c5ff]">
                      Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(coachResult.strengths) ? coachResult.strengths : []).map(
                        (item: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-[#0062ff]/10 border border-[#b4c5ff]/20 text-[11px] font-medium text-[#b4c5ff]"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#ffb4ab]">
                      Issues To Fix
                    </h4>
                    <ul className="space-y-2 text-xs text-[#c2c6d9]">
                      {(Array.isArray(coachResult.issues) ? coachResult.issues : []).map(
                        (item: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-[#ffb4ab] font-bold">•</span>
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0062ff] p-5 rounded-xl">
                    <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                      Investor Hook
                    </h4>
                    <p className="text-sm text-white">
                      {coachResult.investorHook || "N/A"}
                    </p>
                  </div>
                  <div className="bg-[#151b2d] p-5 rounded-xl border border-[#424656]/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-[#7bd0ff]">
                      Short Version
                    </h4>
                    <p className="text-sm text-[#c2c6d9]">
                      {coachResult.shortVersion || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#7bd0ff]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Suggested Rewrite
                  </h4>
                </div>
                <p className="text-sm text-[#dce1fb] leading-relaxed whitespace-pre-wrap">
                  {coachResult.suggestedRewrite || "No rewrite generated."}
                </p>
              </div>

              <div className="bg-[#070d1f] p-6 rounded-xl border border-[#424656]/10">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#b4c5ff]">
                  Next Steps
                </h4>
                <ul className="space-y-2 text-sm text-[#c2c6d9]">
                  {(Array.isArray(coachResult.nextSteps) ? coachResult.nextSteps : []).map(
                    (item: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#7bd0ff] font-bold">•</span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
