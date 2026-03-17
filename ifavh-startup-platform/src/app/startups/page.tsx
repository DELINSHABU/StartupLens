"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Rocket,
  Globe,
  User,
  Layers,
  Briefcase,
  ArrowLeftRight,
  Check,
} from "lucide-react";
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
  createStartup,
  getStartups,
  updateStartup,
  deleteStartup,
} from "@/services/startupService";
import { useAuth } from "@/context/AuthContext";
import { Startup } from "@/types";

const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AI/ML",
  "SaaS",
  "E-Commerce",
  "CleanTech",
  "DeepTech",
  "Web3",
  "Other",
];
const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

const emptyForm = {
  name: "",
  description: "",
  industry: "",
  stage: "",
  pitch: "",
  website: "",
};

export default function StartupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Startup | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [viewing, setViewing] = useState<Startup | null>(null);
  const [selectedStartupIds, setSelectedStartupIds] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState("");


  const loadStartups = useCallback(async () => {
    try {
      const data = await getStartups();
      setStartups(data);
      setSelectedStartupIds((prev) =>
        prev.filter((id) => data.some((startup) => startup.id === id))
      );
    } catch {
      // Firebase not configured yet
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStartups();
    });
  }, [loadStartups]);

  function toggleStartupSelection(startupId: string) {
    setSelectionError("");
    setSelectedStartupIds((prev) => {
      if (prev.includes(startupId)) {
        return prev.filter((id) => id !== startupId);
      }
      if (prev.length >= 3) {
        setSelectionError("You can compare up to 3 startups at a time.");
        return prev;
      }
      return [...prev, startupId];
    });
  }

  function handleCompareSelected() {
    if (selectedStartupIds.length < 2) {
      setSelectionError("Select at least 2 startups to compare.");
      return;
    }
    router.push(`/startups/compare?ids=${selectedStartupIds.join(",")}`);
  }

  async function handleSubmit() {
    if (editing) {
      await updateStartup(editing.id, form);
    } else {
      await createStartup({
        ...form,
        founderId: user?.uid || "",
        founderName: user?.displayName || "Anonymous",
      });
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
    loadStartups();
  }

  async function handleDelete(id: string) {
    await deleteStartup(id);
    loadStartups();
  }

  function handleEdit(startup: Startup) {
    setForm({
      name: startup.name,
      description: startup.description,
      industry: startup.industry,
      stage: startup.stage,
      pitch: startup.pitch,
      website: startup.website || "",
    });
    setEditing(startup);
    setOpen(true);
  }

  const filtered =
    filterIndustry === "All"
      ? startups
      : startups.filter((s) => s.industry === filterIndustry);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <FadeIn className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
            Startup Ecosystem
          </h1>
          <p className="text-[#c2c6d9]">
            Discover and manage the next generation of high-growth ventures.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-3">
            <Button
              onClick={handleCompareSelected}
              disabled={selectedStartupIds.length < 2}
              className="bg-[#191f31] border border-[#424656]/20 text-[#dce1fb] hover:bg-[#2e3447]"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Compare ({selectedStartupIds.length})
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                  className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Startup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
                <DialogHeader>
                  <DialogTitle className="text-[#dce1fb]">
                    {editing ? "Edit Startup" : "Add New Startup"}
                  </DialogTitle>
                  <p className="text-xs text-[#c2c6d9] uppercase tracking-wider">
                    Ecosystem Expansion
                  </p>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                        Startup Name
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g. Acme AI"
                        className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                        Founder Name
                      </Label>
                      <Input
                        value={user?.displayName || ""}
                        disabled
                        className="bg-[#070d1f] border-[#424656]/20 text-[#c2c6d9] mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                        Industry
                      </Label>
                      <Select
                        value={form.industry}
                        onValueChange={(v) => setForm({ ...form, industry: v })}
                      >
                        <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                          <SelectValue placeholder="Select Industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#191f31] border-[#424656]/20">
                          {INDUSTRIES.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                        Funding Stage
                      </Label>
                      <Select
                        value={form.stage}
                        onValueChange={(v) => setForm({ ...form, stage: v })}
                      >
                        <SelectTrigger className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1">
                          <SelectValue placeholder="Select Stage" />
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
                      Short Pitch
                    </Label>
                    <Textarea
                      value={form.pitch}
                      onChange={(e) =>
                        setForm({ ...form, pitch: e.target.value })
                      }
                      placeholder="Tell us what makes this startup unique..."
                      rows={4}
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
                      {editing ? "Update Startup" : "Register Startup"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
            Select 2-3 startups, then compare
          </p>
        </div>
      </FadeIn>

      {/* Filter Tags */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {["All", ...INDUSTRIES].map((ind) => (
          <button
            key={ind}
            onClick={() => setFilterIndustry(ind)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterIndustry === ind
                ? "bg-[#0062ff] text-white"
                : "bg-[#2e3447] text-[#c2c6d9] hover:bg-[#424656]"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>
      {(selectionError || selectedStartupIds.length > 0) && (
        <div
          className={`mb-6 p-3 rounded-lg text-xs border ${
            selectionError
              ? "bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]"
              : "bg-[#151b2d] border-[#424656]/20 text-[#c2c6d9]"
          }`}
        >
          {selectionError || `${selectedStartupIds.length} startup(s) selected for comparison.`}
        </div>
      )}

      {/* Startup Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#c2c6d9]">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No startups yet</p>
          <p className="text-sm">Click &quot;Add Startup&quot; to register the first venture.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((startup) => (
            <StaggerItem
              key={startup.id}
              className="cursor-pointer"
            >
              <div
                onClick={() => setViewing(startup)}
                className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/10 hover:bg-[#191f31] transition-colors group h-full"
              >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#191f31] flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-[#b4c5ff]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#dce1fb]">
                      {startup.name}
                    </h3>
                    <p className="text-xs text-[#c2c6d9]">
                      {startup.founderName}
                    </p>
                  </div>
                </div>
                <div
                  className="flex gap-1"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStartupSelection(startup.id);
                    }}
                    className={`p-1.5 rounded border transition-colors ${
                      selectedStartupIds.includes(startup.id)
                        ? "bg-[#0062ff]/20 border-[#b4c5ff]/30 text-[#b4c5ff]"
                        : "border-[#424656]/30 text-[#c2c6d9] hover:bg-[#2e3447]"
                    }`}
                    aria-label="Toggle compare selection"
                  >
                    {selectedStartupIds.includes(startup.id) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(startup); }}
                    className="p-1.5 rounded hover:bg-[#2e3447]"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#c2c6d9]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(startup.id); }}
                    className="p-1.5 rounded hover:bg-[#2e3447]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#ffb4ab]" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#c2c6d9] leading-relaxed mb-4 line-clamp-3">
                {startup.pitch || startup.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider">
                  {startup.industry}
                </Badge>
                <Badge className="bg-[#2e3447] text-[10px] text-[#dce1fb] uppercase tracking-wider">
                  {startup.stage}
                </Badge>
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
                    <Rocket className="w-7 h-7 text-[#b4c5ff]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-[#dce1fb]">{viewing.name}</DialogTitle>
                    <p className="text-xs text-[#c2c6d9] mt-0.5">Founded by {viewing.founderName}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#070d1f] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#7bd0ff]" />
                      <span className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Industry</span>
                    </div>
                    <p className="text-sm font-semibold text-[#dce1fb]">{viewing.industry}</p>
                  </div>
                  <div className="bg-[#070d1f] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3.5 h-3.5 text-[#b4c5ff]" />
                      <span className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">Stage</span>
                    </div>
                    <p className="text-sm font-semibold text-[#dce1fb]">{viewing.stage}</p>
                  </div>
                </div>
                {viewing.pitch && (
                  <div>
                    <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Pitch</h4>
                    <p className="text-sm text-[#dce1fb] leading-relaxed bg-[#070d1f] rounded-lg p-4">{viewing.pitch}</p>
                  </div>
                )}
                {viewing.description && viewing.description !== viewing.pitch && (
                  <div>
                    <h4 className="text-[10px] text-[#c2c6d9] uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-sm text-[#dce1fb] leading-relaxed bg-[#070d1f] rounded-lg p-4">{viewing.description}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-[#c2c6d9]">
                  {viewing.website && (
                    <a href={viewing.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#b4c5ff] transition-colors">
                      <Globe className="w-3.5 h-3.5" /> {viewing.website}
                    </a>
                  )}
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {viewing.founderName}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => { setViewing(null); handleEdit(viewing); }}
                    className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Startup
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
