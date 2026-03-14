"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet, MapPin, Mail, DollarSign, Layers } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInvestor,
  getInvestors,
  updateInvestor,
  deleteInvestor,
} from "@/services/investorService";
import { Investor } from "@/types";

const FOCUS_OPTIONS = [
  "SaaS",
  "FinTech",
  "DeepTech",
  "HealthTech",
  "ClimateTech",
  "Web3",
  "Enterprise AI",
  "Cybersecurity",
  "Hardware",
  "Energy",
];
const CHECK_SIZES = [
  "$10K - $50K",
  "$50K - $200K",
  "$200K - $1M",
  "$1M - $5M",
  "$5M+",
];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

const emptyForm = {
  name: "",
  bio: "",
  focusAreas: [] as string[],
  checkSize: "",
  stagePreference: "",
  contactEmail: "",
};

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Investor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [focusInput, setFocusInput] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [viewing, setViewing] = useState<Investor | null>(null);

  useEffect(() => {
    loadInvestors();
  }, []);

  async function loadInvestors() {
    try {
      const data = await getInvestors();
      setInvestors(data);
    } catch {
      // Firebase not configured yet
    }
  }

  async function handleSubmit() {
    const focusAreas =
      form.focusAreas.length > 0
        ? form.focusAreas
        : focusInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    if (editing) {
      await updateInvestor(editing.id, { ...form, focusAreas });
    } else {
      await createInvestor({ ...form, focusAreas });
    }
    setForm(emptyForm);
    setFocusInput("");
    setEditing(null);
    setOpen(false);
    loadInvestors();
  }

  async function handleDelete(id: string) {
    await deleteInvestor(id);
    loadInvestors();
  }

  function handleEdit(investor: Investor) {
    setForm({
      name: investor.name,
      bio: investor.bio,
      focusAreas: investor.focusAreas,
      checkSize: investor.checkSize,
      stagePreference: investor.stagePreference,
      contactEmail: investor.contactEmail || "",
    });
    setFocusInput(investor.focusAreas.join(", "));
    setEditing(investor);
    setOpen(true);
  }

  function toggleFocus(area: string) {
    setForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area)
        ? f.focusAreas.filter((a) => a !== area)
        : [...f.focusAreas, area],
    }));
  }

  const filtered =
    filterTag === "All"
      ? investors
      : investors.filter((inv) => inv.focusAreas.includes(filterTag));

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <FadeIn className="mb-2">
        <p className="text-[10px] text-[#b4c5ff] uppercase tracking-widest font-bold">
          Discovery Hub
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
          Connect with Capital
        </h1>
        <p className="text-[#c2c6d9] max-w-lg">
          Discover the perfect strategic partner from our curated database of investors.
        </p>
      </FadeIn>

      <div className="flex justify-between items-center mb-6 mt-6">
        <div className="flex gap-2 flex-wrap">
          {["All", ...FOCUS_OPTIONS.slice(0, 6)].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterTag === tag
                  ? "bg-[#0062ff] text-white"
                  : "bg-[#2e3447] text-[#c2c6d9] hover:bg-[#424656]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setFocusInput("");
              }}
              className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
            <DialogHeader>
              <DialogTitle className="text-[#dce1fb]">
                {editing ? "Edit Investor" : "Add New Investor"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Investor / Firm Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Nebula Ventures"
                  className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Bio / Investment Thesis
                </Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe investment focus and thesis..."
                  rows={3}
                  className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2 block">
                  Focus Areas
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {FOCUS_OPTIONS.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleFocus(area)}
                      className={`px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
                        form.focusAreas.includes(area)
                          ? "bg-[#0062ff] text-white"
                          : "bg-[#2e3447] text-[#c2c6d9]"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Check Size
                  </Label>
                  <Select
                    value={form.checkSize}
                    onValueChange={(v) => setForm({ ...form, checkSize: v })}
                  >
                    <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#191f31] border-[#424656]/20">
                      {CHECK_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Preferred Stage
                  </Label>
                  <Select
                    value={form.stagePreference}
                    onValueChange={(v) =>
                      setForm({ ...form, stagePreference: v })
                    }
                  >
                    <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#191f31] border-[#424656]/20">
                      {STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Contact Email (optional)
                </Label>
                <Input
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  placeholder="contact@firm.com"
                  className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-[#c2c6d9]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                >
                  {editing ? "Update Investor" : "Add Investor"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Investor Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#c2c6d9]">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No investors yet</p>
          <p className="text-sm">Add investor profiles to start matching.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((investor) => (
            <StaggerItem
              key={investor.id}
              className="cursor-pointer"
            >
              <div
                onClick={() => setViewing(investor)}
                className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/10 hover:bg-[#191f31] transition-colors group h-full"
              >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#191f31] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#b4c5ff]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#dce1fb]">
                      {investor.name}
                    </h3>
                    <p className="text-xs text-[#c2c6d9] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {investor.stagePreference}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(investor); }}
                    className="p-1.5 rounded hover:bg-[#2e3447]"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#c2c6d9]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(investor.id); }}
                    className="p-1.5 rounded hover:bg-[#2e3447]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#ffb4ab]" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#c2c6d9] leading-relaxed mb-4 line-clamp-3">
                {investor.bio}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {investor.focusAreas.map((area) => (
                  <Badge
                    key={area}
                    className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-4 text-[10px] uppercase tracking-wider text-[#c2c6d9]">
                <div>
                  <span className="block text-[#424656]">Check Size</span>
                  <span className="font-bold text-[#dce1fb]">
                    {investor.checkSize}
                  </span>
                </div>
                <div>
                  <span className="block text-[#424656]">Preferred Stage</span>
                  <span className="font-bold text-[#dce1fb]">
                    {investor.stagePreference}
                  </span>
                </div>
              </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
      {/* Detail Modal */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-xl bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#070d1f] flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-[#b4c5ff]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-[#dce1fb]">{viewing.name}</DialogTitle>
                    <p className="text-xs text-[#c2c6d9] mt-0.5">{viewing.stagePreference} Stage Investor</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#070d1f] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#34d399]" />
                      <span className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Check Size</span>
                    </div>
                    <p className="text-sm font-semibold text-[#dce1fb]">{viewing.checkSize}</p>
                  </div>
                  <div className="bg-[#070d1f] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3.5 h-3.5 text-[#b4c5ff]" />
                      <span className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Preferred Stage</span>
                    </div>
                    <p className="text-sm font-semibold text-[#dce1fb]">{viewing.stagePreference}</p>
                  </div>
                </div>
                {viewing.bio && (
                  <div>
                    <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Investment Thesis</h4>
                    <p className="text-sm text-[#dce1fb] leading-relaxed bg-[#070d1f] rounded-lg p-4">{viewing.bio}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Focus Areas</h4>
                  <div className="flex gap-2 flex-wrap">
                    {viewing.focusAreas.map((area) => (
                      <Badge key={area} className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                {viewing.contactEmail && (
                  <div className="flex items-center gap-2 text-xs text-[#c2c6d9]">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${viewing.contactEmail}`} className="hover:text-[#b4c5ff] transition-colors">
                      {viewing.contactEmail}
                    </a>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => { setViewing(null); handleEdit(viewing); }}
                    className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Investor
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
