"use client";

import { useEffect, useState } from "react";
import { Network, Wallet, Rocket, ChevronRight, Sparkles, Loader2, Mail, Copy, Check, AlertTriangle, X } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getInvestors } from "@/services/investorService";
import { getStartups } from "@/services/startupService";
import { matchInvestors, generateOutreachEmail } from "@/lib/gemini";
import { Startup, Investor } from "@/types";

interface Match {
  startup: Startup;
  investor: Investor;
  matchReason: string;
  aiScore?: number;
  aiReason?: string;
}

// Module-level cache so results persist across navigations
let matchCache: { matches: Match[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const STAGE_ORDER = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

function getStageScore(stage: string): number {
  return STAGE_ORDER.indexOf(stage);
}

function isStageCompatible(startupStage: string, investorPreference: string): boolean {
  if (!investorPreference) return false;
  const startupScore = getStageScore(startupStage);
  const investorScore = getStageScore(investorPreference);
  return startupScore <= investorScore + 1;
}

export default function MatchPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"startups" | "investors">("startups");
  const [connectModal, setConnectModal] = useState<{ match: Match; mode: "startups" | "investors" } | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewingDetails, setViewingDetails] = useState<{
    startup?: Startup;
    investor?: Investor;
    mode: 'startups' | 'investors';
    sourceMatches?: Match[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Use cache if fresh
    if (matchCache && Date.now() - matchCache.timestamp < CACHE_TTL) {
      setMatches(matchCache.matches);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [startups, investors] = await Promise.all([
        getStartups(),
        getInvestors(),
      ]);

      if (startups.length === 0 || investors.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const newMatches: Match[] = [];

      for (const startup of startups) {
        for (const investor of investors) {
          const industryMatch = investor.focusAreas.some((area) =>
            startup.industry.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(startup.industry.toLowerCase())
          );

          const stageMatch = isStageCompatible(startup.stage, investor.stagePreference);

          if (industryMatch || stageMatch) {
            const reasons: string[] = [];
            if (industryMatch) reasons.push("Industry alignment");
            if (stageMatch) reasons.push("Stage fit");

            newMatches.push({
              startup,
              investor,
              matchReason: reasons.join(" + "),
            });
          }
        }
      }

      setMatches(newMatches);

      if (newMatches.length > 0) {
        await enhanceWithAI(newMatches);
      }
    } catch (e) {
      console.error("Error loading matches:", e);
    } finally {
      setLoading(false);
    }
  }

  async function enhanceWithAI(baseMatches: Match[], forceRefresh = false) {
    if (forceRefresh) matchCache = null;
    setAiLoading(true);
    try {
      const startupGroups = baseMatches.reduce((acc, m) => {
        if (!acc[m.startup.id]) acc[m.startup.id] = [];
        acc[m.startup.id].push(m.investor);
        return acc;
      }, {} as Record<string, Investor[]>);

      const enhancedMatches: Match[] = [...baseMatches];

      // Fire all AI calls in parallel instead of sequentially
      const aiTasks = Object.entries(startupGroups).map(async ([startupId, investors]) => {
        const startup = baseMatches.find(m => m.startup.id === startupId)!.startup;
        
        const investorList = investors.map(inv => 
          `Name: ${inv.name}, Bio: ${inv.bio}, Focus: ${inv.focusAreas.join(", ")}, Stage: ${inv.stagePreference}, Check Size: ${inv.checkSize}`
        ).join("\n\n");

        const startupProfile = `Name: ${startup.name}\nIndustry: ${startup.industry}\nStage: ${startup.stage}\nDescription: ${startup.description}\nPitch: ${startup.pitch}`;

        try {
          const result = await matchInvestors(startupProfile, investorList);
          return { startupId, result };
        } catch (err: any) {
          console.error("AI matching error:", err);
          setApiError(`Matching AI: ${err?.message || err}`);
          return null;
        }
      });

      const results = await Promise.all(aiTasks);

      for (const res of results) {
        if (!res || !res.result?.matches) continue;
        for (const aiMatch of res.result.matches) {
          const matchIndex = enhancedMatches.findIndex(
            m => m.startup.id === res.startupId && m.investor.name === aiMatch.investorName
          );
          if (matchIndex !== -1) {
            enhancedMatches[matchIndex] = {
              ...enhancedMatches[matchIndex],
              aiScore: aiMatch.matchScore,
              aiReason: aiMatch.reason
            };
          }
        }
      }

      if (!results.every(r => r === null)) setApiError(null);

      enhancedMatches.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      setMatches(enhancedMatches);
      // Cache the results
      matchCache = { matches: enhancedMatches, timestamp: Date.now() };
    } finally {
      setAiLoading(false);
    }
  }

  async function handleGenerateEmail(match: Match) {
    setEmailLoading(true);
    try {
      const startup = match.startup;
      const investor = match.investor;
      const result = await generateOutreachEmail(
        startup.name,
        startup.founderName || "Founder",
        investor.name,
        investor.focusAreas.join(", "),
        startup.pitch || startup.description
      );
      setGeneratedEmail(result);
      setApiError(null);
    } catch (err: any) {
      console.error("Error generating email:", err);
      setApiError(`Email AI: ${err?.message || err}`);
    } finally {
      setEmailLoading(false);
    }
  }

  function copyEmail() {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openConnectModal(match: Match, mode: "startups" | "investors") {
    setConnectModal({ match, mode });
    setGeneratedEmail(null);
  }

  const startupMatches = matches.reduce((acc, m) => {
    if (!acc[m.startup.id]) acc[m.startup.id] = [];
    acc[m.startup.id].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  const investorMatches = matches.reduce((acc, m) => {
    if (!acc[m.investor.id]) acc[m.investor.id] = [];
    acc[m.investor.id].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-2">
        <p className="text-[10px] text-[#b4c5ff] uppercase tracking-widest font-bold">
          Smart Discovery
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
          AI Investor Matching
        </h1>
        <p className="text-[#c2c6d9] max-w-lg">
          Intelligent matching between startups and investors powered by AI analysis.
        </p>
        {aiLoading && (
          <div className="flex items-center gap-2 text-sm text-[#b4c5ff] mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is analyzing matches...
          </div>
        )}
      </FadeIn>

      {apiError && (
        <div className="mb-6 bg-[#ff4444]/10 border border-[#ff4444]/30 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#ff4444] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#ff4444]">API Error</p>
            <p className="text-xs text-[#ffb4ab] mt-1 break-all">{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} className="p-1 hover:bg-[#ff4444]/10 rounded">
            <X className="w-4 h-4 text-[#ff4444]" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0062ff]"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 text-[#c2c6d9]">
          <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            No matches found yet
          </p>
          <p className="text-sm mt-2">
            Add startups and investors to see AI-powered matches based on industry and stage.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-8 mt-6 items-center">
            <button
              onClick={() => setActiveTab("startups")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "startups"
                  ? "bg-[#0062ff] text-white"
                  : "bg-[#2e3447] text-[#c2c6d9] hover:bg-[#424656]"
              }`}
            >
              <Rocket className="w-4 h-4" />
              Startups Seeking Investors
              <Badge className="ml-1 bg-white/20 text-white text-xs">
                {Object.keys(startupMatches).length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("investors")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "investors"
                  ? "bg-[#0062ff] text-white"
                  : "bg-[#2e3447] text-[#c2c6d9] hover:bg-[#424656]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              Investors Seeking Startups
              <Badge className="ml-1 bg-white/20 text-white text-xs">
                {Object.keys(investorMatches).length}
              </Badge>
            </button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => enhanceWithAI(matches, true)}
              disabled={aiLoading || matches.length === 0}
              className="ml-auto border-[#424656] text-[#c2c6d9] hover:bg-[#2e3447]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {aiLoading ? "Analyzing..." : "Re-analyze with AI"}
            </Button>
          </div>

          {activeTab === "startups" ? (
            <StaggerContainer className="space-y-8">
              {Object.entries(startupMatches).map(([startupId, startupMatchesList]) => {
                const startup = startupMatchesList[0].startup;
                return (
              <StaggerItem key={startupId}>
                    <div className="bg-[#151b2d] rounded-xl border border-[#424656]/10 overflow-hidden">
                      <div className="p-5 border-b border-[#424656]/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0062ff]/20 to-[#b4c5ff]/20 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-[#b4c5ff]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#dce1fb]">{startup.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{startup.industry}</Badge>
                              <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{startup.stage}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#c2c6d9] uppercase tracking-wider">Matched Investors</p>
                          <p className="text-2xl font-bold text-[#0062ff]">{startupMatchesList.length}</p>
                        </div>
                      </div>
                      <div className="p-5 grid gap-3">
                        {startupMatchesList
                          .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                          .map((match) => (
                          <div 
                            key={match.investor.id} 
                            className="flex items-center justify-between bg-[#070d1f] p-4 rounded-lg cursor-pointer hover:bg-[#191f31] transition-colors"
                            onClick={() => setViewingDetails({ investor: match.investor, mode: 'startups', sourceMatches: startupMatchesList })}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#191f31] flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-[#34d399]" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#dce1fb]">{match.investor.name}</h4>
                                <p className="text-xs text-[#c2c6d9]">{match.matchReason}</p>
                                {match.aiReason && (
                                  <p className="text-xs text-[#b4c5ff] mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> {match.aiReason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {match.aiScore ? (
                                <div className="text-right mr-4">
                                  <p className="text-[10px] text-[#424656] uppercase">AI Score</p>
                                  <p className={`text-lg font-bold ${
                                    match.aiScore >= 80 ? "text-[#34d399]" :
                                    match.aiScore >= 60 ? "text-[#b4c5ff]" :
                                    "text-[#c2c6d9]"
                                  }`}>{match.aiScore}%</p>
                                </div>
                              ) : (
                                <div className="text-right mr-4">
                                  <p className="text-[10px] text-[#424656] uppercase">Check Size</p>
                                  <p className="text-sm font-medium text-[#dce1fb]">{match.investor.checkSize}</p>
                                </div>
                              )}
                              <Button size="sm" className="bg-[#0062ff] hover:bg-[#0052d9] text-white" onClick={(e) => { e.stopPropagation(); openConnectModal(match, "startups"); }}>
                                Connect <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <StaggerContainer className="space-y-8">
              {Object.entries(investorMatches).map(([investorId, investorMatchesList]) => {
                const investor = investorMatchesList[0].investor;
                return (
              <StaggerItem key={investorId}>
                    <div className="bg-[#151b2d] rounded-xl border border-[#424656]/10 overflow-hidden">
                      <div className="p-5 border-b border-[#424656]/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34d399]/20 to-[#10b981]/20 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-[#34d399]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#dce1fb]">{investor.name}</h3>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {investor.focusAreas.map((area) => (
                                <Badge key={area} className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{area}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#c2c6d9] uppercase tracking-wider">Matched Startups</p>
                          <p className="text-2xl font-bold text-[#34d399]">{investorMatchesList.length}</p>
                        </div>
                      </div>
                      <div className="p-5 grid gap-3">
                        {investorMatchesList
                          .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                          .map((match) => (
                          <div 
                            key={match.startup.id} 
                            className="flex items-center justify-between bg-[#070d1f] p-4 rounded-lg cursor-pointer hover:bg-[#191f31] transition-colors"
                            onClick={() => setViewingDetails({ startup: match.startup, mode: 'investors', sourceMatches: investorMatchesList })}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#191f31] flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-[#b4c5ff]" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#dce1fb]">{match.startup.name}</h4>
                                <p className="text-xs text-[#c2c6d9]">{match.matchReason}</p>
                                {match.aiReason && (
                                  <p className="text-xs text-[#b4c5ff] mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> {match.aiReason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {match.aiScore ? (
                                <div className="text-right mr-4">
                                  <p className="text-[10px] text-[#424656] uppercase">AI Score</p>
                                  <p className={`text-lg font-bold ${
                                    match.aiScore >= 80 ? "text-[#34d399]" :
                                    match.aiScore >= 60 ? "text-[#b4c5ff]" :
                                    "text-[#c2c6d9]"
                                  }`}>{match.aiScore}%</p>
                                </div>
                              ) : (
                                <div className="text-right mr-4">
                                  <p className="text-[10px] text-[#424656] uppercase">Stage</p>
                                  <p className="text-sm font-medium text-[#dce1fb]">{match.startup.stage}</p>
                                </div>
                              )}
                              <Button size="sm" className="bg-[#34d399] hover:bg-[#10b981] text-black" onClick={(e) => { e.stopPropagation(); openConnectModal(match, "investors"); }}>
                                Connect <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </>
      )}

      <Dialog open={!!connectModal} onOpenChange={(o) => !o && setConnectModal(null)}>
        <DialogContent className="max-w-2xl bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
          {connectModal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-[#dce1fb]">
                  {connectModal.mode === "startups" 
                    ? `Connect ${connectModal.match.startup.name} with ${connectModal.match.investor.name}`
                    : `Connect with ${connectModal.match.investor.name}`}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="bg-[#070d1f] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {connectModal.mode === "startups" ? (
                      <Rocket className="w-5 h-5 text-[#b4c5ff]" />
                    ) : (
                      <Wallet className="w-5 h-5 text-[#34d399]" />
                    )}
                    <span className="font-semibold">
                      {connectModal.mode === "startups" 
                        ? connectModal.match.investor.name
                        : connectModal.match.startup.name}
                    </span>
                  </div>
                  {connectModal.match.investor.contactEmail && (
                    <p className="text-sm text-[#c2c6d9] flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {connectModal.match.investor.contactEmail}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleGenerateEmail(connectModal.match)}
                    disabled={emailLoading}
                    className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Outreach Email
                  </Button>
                </div>

                {generatedEmail && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Subject</label>
                      <p className="text-sm font-medium text-[#dce1fb] bg-[#070d1f] p-3 rounded-lg">
                        {generatedEmail.subject}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Email Body</label>
                      <Textarea 
                        value={generatedEmail.body}
                        onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                        className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] min-h-[200px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={copyEmail}
                        variant="outline"
                        className="flex-1 border-[#424656] text-[#c2c6d9] hover:bg-[#2e3447]"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                      {connectModal.match.investor.contactEmail && (
                        <Button 
                          asChild
                          className="flex-1 bg-[#34d399] hover:bg-[#10b981] text-black"
                        >
                          <a href={`mailto:${connectModal.match.investor.contactEmail}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Open Email Client
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Details View Modal */}
      <Dialog open={!!viewingDetails} onOpenChange={(o) => !o && setViewingDetails(null)}>
        <DialogContent className="max-w-2xl bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
          {viewingDetails && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0062ff]/20 to-[#b4c5ff]/20 flex items-center justify-center">
                    {viewingDetails.mode === 'startups' ? (
                      <Wallet className="w-8 h-8 text-[#34d399]" />
                    ) : (
                      <Rocket className="w-8 h-8 text-[#b4c5ff]" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-[#dce1fb]">
                      {viewingDetails.mode === 'startups' ? viewingDetails.investor?.name : viewingDetails.startup?.name}
                    </DialogTitle>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {viewingDetails.mode === 'startups' && viewingDetails.investor ? (
                        viewingDetails.investor.focusAreas.map((area) => (
                          <Badge key={area} className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{area}</Badge>
                        ))
                      ) : viewingDetails.startup ? (
                        <>
                          <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{viewingDetails.startup.industry}</Badge>
                          <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase">{viewingDetails.startup.stage}</Badge>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                <div className="p-5 bg-[#070d1f] rounded-lg border border-[#424656]/10">
                  {viewingDetails.mode === 'startups' && viewingDetails.investor?.bio && (
                    <>
                      <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Investment Thesis</h4>
                      <p className="text-sm text-[#c2c6d9] leading-relaxed">{viewingDetails.investor.bio}</p>
                    </>
                  )}
                  {viewingDetails.mode === 'investors' && viewingDetails.startup?.pitch && (
                    <>
                      <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Pitch</h4>
                      <p className="text-sm text-[#c2c6d9] leading-relaxed">{viewingDetails.startup.pitch}</p>
                    </>
                  )}
                </div>

                {viewingDetails.mode === 'startups' && viewingDetails.investor && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#070d1f] rounded-lg p-4">
                        <h5 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-1">Check Size</h5>
                        <p className="text-lg font-semibold text-[#dce1fb]">{viewingDetails.investor.checkSize}</p>
                      </div>
                      <div className="bg-[#070d1f] rounded-lg p-4">
                        <h5 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-1">Preferred Stage</h5>
                        <p className="text-lg font-semibold text-[#dce1fb]">{viewingDetails.investor.stagePreference}</p>
                      </div>
                    </div>

                    {viewingDetails.investor.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-[#c2c6d9] bg-[#070d1f] p-4 rounded-lg">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${viewingDetails.investor.contactEmail}`} className="hover:text-[#b4c5ff] transition-colors">
                          {viewingDetails.investor.contactEmail}
                        </a>
                      </div>
                    )}
                  </>
                )}

                {viewingDetails.mode === 'investors' && viewingDetails.sourceMatches && viewingDetails.sourceMatches[0] && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#dce1fb] mb-3">Matched For</h4>
                    <div className="bg-[#070d1f] rounded-lg p-4">
                      <p className="text-sm text-[#c2c6d9]">{viewingDetails.sourceMatches[0].matchReason}</p>
                      {viewingDetails.sourceMatches[0].aiReason && (
                        <p className="text-sm text-[#b4c5ff] mt-2 flex items-center gap-1.5 bg-[#0062ff]/10 px-3 py-2 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                          {viewingDetails.sourceMatches[0].aiReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-[#424656]/10">
                  {viewingDetails.sourceMatches && viewingDetails.sourceMatches[0] && (
                    <Button
                      onClick={() => {
                        setViewingDetails(null);
                        const firstMatch = viewingDetails.sourceMatches?.[0];
                        if (firstMatch) {
                          openConnectModal(firstMatch, viewingDetails.mode);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                    >
                      {viewingDetails.mode === 'startups' ? 'Connect with Investor' : 'Generate Cold Email'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setViewingDetails(null)}
                    variant="outline"
                    className="flex-1 border-[#424656] text-[#c2c6d9] hover:bg-[#2e3447]"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
