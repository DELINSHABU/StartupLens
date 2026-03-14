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
import { Badge } from "@/components/ui/badge";

export default function EvaluatePage() {
  const [name, setName] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleEvaluate() {
    if (!pitch.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Unnamed Startup", pitch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Evaluation failed. Check your Gemini API key.");
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
          AI Startup Evaluator
        </h1>
        <p className="text-[#c2c6d9] max-w-2xl text-lg">
          Harness AI market analysis to objectively stress-test your business model.
        </p>
      </FadeIn>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-[#151b2d] p-8 rounded-xl border border-[#424656]/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b4c5ff]/5 rounded-full blur-3xl transition-all group-hover:bg-[#b4c5ff]/10" />
            <div className="relative space-y-6">
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
                  Pitch Description
                </label>
                <textarea
                  className="w-full bg-[#070d1f] border border-[#424656]/20 rounded-lg p-4 focus:ring-2 focus:ring-[#b4c5ff]/20 focus:border-[#b4c5ff] outline-none text-[#dce1fb] transition-all placeholder:text-[#c2c6d9]/30 resize-none"
                  placeholder="Detail your value proposition, target market, and technical advantage..."
                  rows={8}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
                <div className="flex justify-between items-center text-[10px] text-[#c2c6d9]/50 uppercase tracking-widest">
                  <span>Recommended: 200+ words</span>
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
                  <Brain className="w-5 h-5" />
                )}
                {loading ? "Analyzing..." : "Run Deep Analysis"}
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
          {!result && !loading && (
            <div className="bg-[#191f31] p-12 rounded-2xl border border-[#424656]/10 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-[#424656]" />
              <p className="text-[#c2c6d9] text-lg font-medium">
                Enter a pitch to get AI analysis
              </p>
              <p className="text-xs text-[#424656] mt-2">
                Results will appear here with scores, strengths, and suggestions
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[#191f31] p-12 rounded-2xl border border-[#b4c5ff]/10 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#b4c5ff] animate-spin" />
              <p className="text-[#dce1fb] text-lg font-medium">
                Analyzing with Gemini AI...
              </p>
              <p className="text-xs text-[#c2c6d9] mt-2">
                Evaluating market fit, solution depth, uniqueness, and viability
              </p>
            </div>
          )}

          {result && (
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
                      {Object.entries(result.scores).map(
                        ([key, value]: [string, any]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className={scoreColor(value)}>
                                {value}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-[#2e3447] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${barColor(
                                  value
                                )}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        )
                      )}
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
        </section>
      </div>
    </PageTransition>
  );
}
