"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Target, Plus, Pencil, Trash2 } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createFundingRound,
  getFundingRounds,
  updateFundingRound,
  deleteFundingRound,
} from "@/services/fundraisingService";
import { getStartups } from "@/services/startupService";
import { getInvestors } from "@/services/investorService";
import { FundingRound, Startup, Investor } from "@/types";

const ROUND_TYPES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"];
const STATUSES = ["Active", "Closed", "Paused"];

const emptyForm = {
  startupName: "",
  round: "",
  target: "",
  raised: "",
  status: "Active",
  leadInvestor: "",
};

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function FundraisingPage() {
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FundingRound | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadRounds();
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      const [s, i] = await Promise.all([getStartups(), getInvestors()]);
      setStartups(s);
      setInvestors(i);
    } catch { /* Firebase not configured yet */ }
  }

  async function loadRounds() {
    try {
      const data = await getFundingRounds();
      setRounds(data);
    } catch {
      // Firebase not configured yet
    }
  }

  async function handleSubmit() {
    const data = {
      startupName: form.startupName,
      round: form.round,
      target: Number(form.target) || 0,
      raised: Number(form.raised) || 0,
      status: form.status,
      leadInvestor: form.leadInvestor,
    };
    if (editing) {
      await updateFundingRound(editing.id, data);
    } else {
      await createFundingRound(data);
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
    loadRounds();
  }

  async function handleDelete(id: string) {
    await deleteFundingRound(id);
    loadRounds();
  }

  function handleEdit(r: FundingRound) {
    setForm({
      startupName: r.startupName,
      round: r.round,
      target: r.target.toString(),
      raised: r.raised.toString(),
      status: r.status,
      leadInvestor: r.leadInvestor || "",
    });
    setEditing(r);
    setOpen(true);
  }

  const totalTarget = rounds.reduce((a, r) => a + r.target, 0);
  const totalRaised = rounds.reduce((a, r) => a + r.raised, 0);
  const activeRounds = rounds.filter((r) => r.status === "Active").length;

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
            Fundraising Tracker
          </h1>
          <p className="text-[#c2c6d9]">
            Monitor active funding rounds and capital raised across portfolio.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Round
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
            <DialogHeader>
              <DialogTitle className="text-[#dce1fb]">
                {editing ? "Edit Funding Round" : "Add Funding Round"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Startup Name
                </Label>
                <Select value={form.startupName} onValueChange={(v) => setForm({ ...form, startupName: v })}>
                  <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                    <SelectValue placeholder="Select a startup" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#191f31] border-[#424656]/20">
                    {startups.map((s) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Round Type
                  </Label>
                  <Select value={form.round} onValueChange={(v) => setForm({ ...form, round: v })}>
                    <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#191f31] border-[#424656]/20">
                      {ROUND_TYPES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Status
                  </Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#191f31] border-[#424656]/20">
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Target Amount ($)
                  </Label>
                  <Input
                    type="number"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    placeholder="e.g. 5000000"
                    className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Raised So Far ($)
                  </Label>
                  <Input
                    type="number"
                    value={form.raised}
                    onChange={(e) => setForm({ ...form, raised: e.target.value })}
                    placeholder="e.g. 3200000"
                    className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Lead Investor (optional)
                </Label>
                <Select value={form.leadInvestor || "_none"} onValueChange={(v) => setForm({ ...form, leadInvestor: v === "_none" ? "" : v })}>
                  <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                    <SelectValue placeholder="Select an investor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#191f31] border-[#424656]/20">
                    <SelectItem value="_none">None</SelectItem>
                    {investors.map((inv) => (
                      <SelectItem key={inv.id} value={inv.name}>{inv.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 text-[#c2c6d9]">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.startupName || !form.round || !form.target}
                  className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                >
                  {editing ? "Update Round" : "Add Round"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </FadeIn>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StaggerItem className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#c2c6d9]">Total Target</span>
            <Target className="w-4 h-4 text-[#7bd0ff]" />
          </div>
          <p className="text-2xl font-bold text-[#dce1fb]">{formatAmount(totalTarget)}</p>
        </StaggerItem>
        <StaggerItem className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#c2c6d9]">Total Raised</span>
            <DollarSign className="w-4 h-4 text-[#34d399]" />
          </div>
          <p className="text-2xl font-bold text-[#34d399]">{formatAmount(totalRaised)}</p>
        </StaggerItem>
        <StaggerItem className="bg-[#151b2d] rounded-lg border border-[#424656]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#c2c6d9]">Active Rounds</span>
            <TrendingUp className="w-4 h-4 text-[#b4c5ff]" />
          </div>
          <p className="text-2xl font-bold text-[#dce1fb]">{activeRounds}</p>
        </StaggerItem>
      </StaggerContainer>

      {/* Per-Startup Breakdown */}
      {rounds.length > 0 && (
        <FadeIn className="mb-8">
          <div className="bg-[#151b2d] rounded-lg border border-[#424656]/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#424656]/10">
              <h2 className="text-sm font-bold text-[#dce1fb]">Startup Targets</h2>
            </div>
            <div className="divide-y divide-[#424656]/10">
              {Object.entries(
                rounds.reduce<Record<string, { target: number; raised: number; rounds: number }>>((acc, r) => {
                  if (!acc[r.startupName]) acc[r.startupName] = { target: 0, raised: 0, rounds: 0 };
                  acc[r.startupName].target += r.target;
                  acc[r.startupName].raised += r.raised;
                  acc[r.startupName].rounds += 1;
                  return acc;
                }, {})
              ).map(([name, data]) => {
                const pct = data.target > 0 ? Math.min(100, Math.round((data.raised / data.target) * 100)) : 0;
                return (
                  <div key={name} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#dce1fb] truncate">{name}</h3>
                      <p className="text-[10px] text-[#c2c6d9]">{data.rounds} round{data.rounds > 1 ? "s" : ""}</p>
                    </div>
                    <div className="w-40 shrink-0">
                      <div className="flex justify-between text-[10px] text-[#c2c6d9] mb-1">
                        <span>{formatAmount(data.raised)}</span>
                        <span>{formatAmount(data.target)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#2e3447]">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#dce1fb] w-12 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Rounds Table */}
      {rounds.length === 0 ? (
        <div className="text-center py-20 text-[#c2c6d9]">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No funding rounds yet</p>
          <p className="text-sm">Click &quot;Add Round&quot; to track your first fundraise.</p>
        </div>
      ) : (
        <div className="bg-[#151b2d] rounded-lg border border-[#424656]/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#424656]/10">
            <h2 className="text-sm font-bold text-[#dce1fb]">Funding Rounds</h2>
          </div>
          <div className="divide-y divide-[#424656]/10">
            {rounds.map((r) => {
              const pct = r.target > 0 ? Math.min(100, Math.round((r.raised / r.target) * 100)) : 0;
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#191f31] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#dce1fb] truncate">{r.startupName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        r.status === "Active"
                          ? "bg-[#34d399]/10 text-[#34d399]"
                          : r.status === "Closed"
                          ? "bg-[#424656]/20 text-[#c2c6d9]"
                          : "bg-[#f59e0b]/10 text-[#f59e0b]"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#c2c6d9]">
                      {r.round}{r.leadInvestor ? ` \u00B7 Lead: ${r.leadInvestor}` : ""}
                    </p>
                  </div>
                  <div className="w-48 shrink-0">
                    <div className="flex justify-between text-[10px] text-[#c2c6d9] mb-1">
                      <span>{formatAmount(r.raised)}</span>
                      <span>{formatAmount(r.target)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#2e3447]">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#0062ff] to-[#7bd0ff] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#dce1fb] w-12 text-right">{pct}%</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(r)} className="p-1.5 rounded hover:bg-[#2e3447]">
                      <Pencil className="w-3.5 h-3.5 text-[#c2c6d9]" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-[#2e3447]">
                      <Trash2 className="w-3.5 h-3.5 text-[#ffb4ab]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
