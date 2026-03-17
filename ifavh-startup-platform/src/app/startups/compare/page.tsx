"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  Brain,
  Loader2,
  RefreshCw,
  Rocket,
  Wallet,
} from "lucide-react";
import {
  PageTransition,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStartups } from "@/services/startupService";
import { getFundingRounds } from "@/services/fundraisingService";
import { evaluateStartup } from "@/lib/gemini";
import { Startup } from "@/types";

interface ComparisonScore {
  overallScore: number;
  scores: {
    marketFit: number;
    solutionDepth: number;
    uniqueness: number;
    viability: number;
  };
  investorInterest: string;
  confidence: number;
}

interface FundingSummary {
  status: string;
  totalTarget: number;
  totalRaised: number;
  progress: number;
  roundCount: number;
  latestRound?: string;
}

const SCORE_KEYS: Array<keyof ComparisonScore["scores"]> = [
  "marketFit",
  "solutionDepth",
  "uniqueness",
  "viability",
];

const EMPTY_FUNDING: FundingSummary = {
  status: "No rounds",
  totalTarget: 0,
  totalRaised: 0,
  progress: 0,
  roundCount: 0,
};

function formatAmount(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function statusClass(status: string) {
  if (status === "Active") return "bg-[#34d399]/10 text-[#34d399]";
  if (status === "Closed") return "bg-[#424656]/20 text-[#c2c6d9]";
  if (status === "Paused") return "bg-[#f59e0b]/10 text-[#f59e0b]";
  return "bg-[#2e3447] text-[#c2c6d9]";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function StartupComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const startupIds = useMemo(() => {
    return Array.from(
      new Set(
        idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      )
    ).slice(0, 3);
  }, [idsParam]);

  const [selectedStartups, setSelectedStartups] = useState<Startup[]>([]);
  const [fundingByStartup, setFundingByStartup] = useState<
    Record<string, FundingSummary>
  >({});
  const [aiScores, setAiScores] = useState<Record<string, ComparisonScore>>({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  const topAiScore = useMemo(() => {
    const values = Object.values(aiScores).map((score) => score.overallScore);
    return values.length ? Math.max(...values) : 0;
  }, [aiScores]);

  const scoreStartups = useCallback(async (startupsToScore: Startup[]) => {
    if (!startupsToScore.length) return;

    setAiLoading(true);
    setAiError("");

    const scores: Record<string, ComparisonScore> = {};
    const failed: string[] = [];

    await Promise.all(
      startupsToScore.map(async (startup) => {
        try {
          const pitch = startup.pitch?.trim() || startup.description?.trim();
          if (!pitch) {
            failed.push(startup.name);
            return;
          }

          const result = (await evaluateStartup(
            startup.name,
            pitch
          )) as Partial<ComparisonScore>;

          scores[startup.id] = {
            overallScore: toNumber(result.overallScore),
            scores: {
              marketFit: toNumber(result.scores?.marketFit),
              solutionDepth: toNumber(result.scores?.solutionDepth),
              uniqueness: toNumber(result.scores?.uniqueness),
              viability: toNumber(result.scores?.viability),
            },
            investorInterest: result.investorInterest || "N/A",
            confidence: toNumber(result.confidence),
          };
        } catch {
          failed.push(startup.name);
        }
      })
    );

    setAiScores(scores);
    if (failed.length) {
      setAiError(`AI scoring unavailable for: ${failed.join(", ")}`);
    }
    setAiLoading(false);
  }, []);

  useEffect(() => {
    async function loadComparisonData() {
      setError("");
      setAiError("");
      setAiScores({});
      setLoading(true);

      if (startupIds.length < 2) {
        setSelectedStartups([]);
        setFundingByStartup({});
        setError("Select 2-3 startups from the Startups page to compare.");
        setLoading(false);
        return;
      }

      try {
        const [allStartups, fundingRounds] = await Promise.all([
          getStartups(),
          getFundingRounds(),
        ]);

        const selected = startupIds
          .map((id) => allStartups.find((startup) => startup.id === id))
          .filter((startup): startup is Startup => Boolean(startup));

        if (selected.length < 2) {
          setSelectedStartups(selected);
          setFundingByStartup({});
          setError("Could not load enough selected startups. Please reselect.");
          setLoading(false);
          return;
        }

        setSelectedStartups(selected);

        const fundingSummary: Record<string, FundingSummary> = {};
        for (const startup of selected) {
          const relatedRounds = fundingRounds.filter(
            (round) =>
              round.startupName?.trim().toLowerCase() ===
              startup.name.trim().toLowerCase()
          );

          const totalTarget = relatedRounds.reduce(
            (sum, round) => sum + toNumber(round.target),
            0
          );
          const totalRaised = relatedRounds.reduce(
            (sum, round) => sum + toNumber(round.raised),
            0
          );
          const latest = relatedRounds[0];
          const progress =
            totalTarget > 0 ? Math.min(100, Math.round((totalRaised / totalTarget) * 100)) : 0;

          fundingSummary[startup.id] = {
            status: latest?.status || "No rounds",
            totalTarget,
            totalRaised,
            progress,
            roundCount: relatedRounds.length,
            latestRound: latest?.round,
          };
        }

        setFundingByStartup(fundingSummary);
        await scoreStartups(selected);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load startup comparison data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadComparisonData();
  }, [scoreStartups, startupIds]);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
            Startup Comparison
          </h1>
          <p className="text-[#c2c6d9]">
            Compare startup profiles side-by-side across industry, stage, funding, and AI scores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => scoreStartups(selectedStartups)}
            disabled={aiLoading || selectedStartups.length < 2}
            className="bg-[#191f31] border border-[#424656]/20 text-[#dce1fb] hover:bg-[#2e3447]"
          >
            {aiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh AI Scores
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
          >
            <Link href="/startups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Startups
            </Link>
          </Button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#b4c5ff]" />
        </div>
      ) : error ? (
        <div className="bg-[#151b2d] rounded-xl border border-[#ffb4ab]/20 p-8 text-center">
          <p className="text-[#ffb4ab] text-sm">{error}</p>
          <Button
            asChild
            className="mt-4 bg-[#191f31] border border-[#424656]/20 text-[#dce1fb] hover:bg-[#2e3447]"
          >
            <Link href="/startups">Choose startups</Link>
          </Button>
        </div>
      ) : (
        <>
          {aiError && (
            <div className="mb-6 p-3 rounded-lg text-xs border bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]">
              {aiError}
            </div>
          )}

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedStartups.map((startup) => {
              const funding = fundingByStartup[startup.id] || EMPTY_FUNDING;
              const score = aiScores[startup.id];
              const isTopScore = Boolean(score) && score.overallScore === topAiScore && topAiScore > 0;

              return (
                <StaggerItem key={startup.id}>
                  <div className="bg-[#151b2d] rounded-xl border border-[#424656]/15 p-6 space-y-5 h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#191f31] flex items-center justify-center">
                          <Rocket className="w-5 h-5 text-[#b4c5ff]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-[#dce1fb] leading-tight">
                            {startup.name}
                          </h2>
                          <p className="text-xs text-[#c2c6d9]">{startup.founderName}</p>
                        </div>
                      </div>
                      {isTopScore && (
                        <Badge className="bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 text-[10px] uppercase">
                          Top AI
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider">
                        {startup.industry}
                      </Badge>
                      <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider">
                        {startup.stage}
                      </Badge>
                    </div>

                    <div className="bg-[#070d1f] rounded-lg p-4 border border-[#424656]/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#7bd0ff]" />
                          <h3 className="text-xs uppercase tracking-widest text-[#c2c6d9]">
                            Funding Status
                          </h3>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusClass(funding.status)}`}>
                          {funding.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#c2c6d9] mb-1">
                        {funding.roundCount > 0
                          ? `${funding.roundCount} round(s)${funding.latestRound ? ` • Latest: ${funding.latestRound}` : ""}`
                          : "No rounds tracked"}
                      </p>
                      <p className="text-sm font-semibold text-[#dce1fb] mb-2">
                        {formatAmount(funding.totalRaised)} / {formatAmount(funding.totalTarget)}
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-[#2e3447] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0062ff] to-[#7bd0ff]"
                          style={{ width: `${funding.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-[#070d1f] rounded-lg p-4 border border-[#424656]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-[#b4c5ff]" />
                        <h3 className="text-xs uppercase tracking-widest text-[#c2c6d9]">
                          AI Scores
                        </h3>
                      </div>

                      {score ? (
                        <div className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                                Overall
                              </p>
                              <p className="text-3xl font-black text-[#dce1fb]">
                                {score.overallScore}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                                Interest
                              </p>
                              <p className="text-sm font-semibold text-[#7bd0ff]">
                                {score.investorInterest}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {SCORE_KEYS.map((key) => (
                              <div key={key}>
                                <div className="flex justify-between text-[11px] text-[#c2c6d9] mb-1">
                                  <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                                  <span>{score.scores[key]}%</span>
                                </div>
                                <div className="w-full h-1 rounded-full bg-[#2e3447] overflow-hidden">
                                  <div
                                    className="h-full bg-[#b4c5ff]"
                                    style={{ width: `${score.scores[key]}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#c2c6d9]">
                          {aiLoading ? "Calculating AI score..." : "AI score not available yet."}
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      <p className="text-xs text-[#c2c6d9] line-clamp-3 leading-relaxed">
                        {startup.pitch || startup.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="mt-6 text-[10px] text-[#c2c6d9] uppercase tracking-widest flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Comparing {selectedStartups.length} startups side-by-side
          </div>
        </>
      )}
    </PageTransition>
  );
}
