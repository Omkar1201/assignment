"use client";

import React, { useState, useEffect } from "react";
import { Search, Sparkles, Filter, CheckSquare, Square, PhoneCall, Bot, Briefcase, MapPin, Award, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchApi, Candidate, HunarAgent } from "@/lib/api";

const PRESET_JDS = [
  {
    title: "Senior Full Stack Engineer",
    text: "We are seeking a Senior Full Stack Engineer with 5+ years of experience in React, TypeScript, Node.js, Python, FastAPI, and PostgreSQL. Location: Bengaluru. Candidates must have strong API design skills and modern SaaS background."
  },
  {
    title: "AI / ML Engineer",
    text: "Looking for an AI Engineer with expertise in Python, PyTorch, Large Language Models (LLMs), LangChain, and RAG architectures. Minimum 3 years experience building production AI systems."
  },
  {
    title: "HR & Talent Acquisition Lead",
    text: "Hiring an experienced HR Manager / Talent Acquisition lead with 4+ years experience in Tech Recruiting, Voice AI hiring tools, and end-to-end recruitment operations."
  }
];

export const PeopleSearchTab: React.FC = () => {
  const [jdText, setJdText] = useState(PRESET_JDS[0].text);
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minExp, setMinExp] = useState(0);
  const [provider, setProvider] = useState("apollo");
  const [providerApiKey, setProviderApiKey] = useState("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [agents, setAgents] = useState<HunarAgent[]>([]);

  const [loading, setLoading] = useState(false);
  const [parsedJd, setParsedJd] = useState<{ suggested_role: string; required_experience: number; extracted_skills: string[] } | null>(null);

  // Bulk Reachout Modal
  const [showReachoutModal, setShowReachoutModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [reachoutSubmitting, setReachoutSubmitting] = useState(false);
  const [reachoutResult, setReachoutResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!jdText.trim()) {
      setParsedJd(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchApi<any>("/api/search/parse-jd", {
        method: "POST",
        body: JSON.stringify({ jd_text: jdText })
      })
        .then((parsed) => {
          if (parsed && parsed.suggested_role) {
            setParsedJd(parsed);
          }
        })
        .catch((e) => console.warn("JD parse notice:", e));
    }, 300);
    return () => clearTimeout(timer);
  }, [jdText]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const effectiveSkills = skillFilter || (parsedJd?.extracted_skills ? parsedJd.extracted_skills.join(", ") : "");
      const effectiveQuery = query || parsedJd?.suggested_role || "";
      const effectiveMinExp = minExp || parsedJd?.required_experience || 0;

      const res = await fetchApi<{ count: number; candidates: Candidate[] }>("/api/search/candidates", {
        method: "POST",
        body: JSON.stringify({
          jd_text: jdText,
          query: effectiveQuery,
          skill_filter: effectiveSkills,
          location_filter: locationFilter,
          min_exp: effectiveMinExp,
          provider
        })
      });

      if (res && res.candidates) {
        setCandidates(res.candidates);
      } else {
        setCandidates([]);
      }
      setSelectedIds([]);
    } catch (err: any) {
      console.error("Search error:", err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi<{ results: HunarAgent[] }>("/api/agents")
      .then((res) => {
        setAgents(res.results || []);
        if (res.results && res.results.length > 0) {
          setSelectedAgentId(res.results[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleSelectCandidate = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const handleLaunchBulkReachout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || selectedIds.length === 0) return;
    setReachoutSubmitting(true);
    setReachoutResult(null);

    const targetCandidates = candidates.filter((c) => selectedIds.includes(c.id));
    const bulkData = {
      agent_id: selectedAgentId,
      request_id: `batch-${Date.now()}`,
      data: targetCandidates.map((c) => ({
        callee_name: c.full_name,
        mobile_number: c.mobile_number,
        custom_data: {
          company: c.company || "Target Hire",
          role: c.title || "Target Role",
          location: c.location || "India"
        }
      }))
    };

    try {
      const res = await fetchApi<any>("/api/calls/bulk", {
        method: "POST",
        body: JSON.stringify(bulkData)
      });

      setReachoutResult({
        success: true,
        message: `Successfully initiated ${targetCandidates.length} automated Voice AI reachout calls! Calls are now active on Hunar Voice Engine.`
      });
    } catch (err: any) {
      setReachoutResult({
        success: false,
        message: err.message || "Failed to trigger bulk reachout calls"
      });
    } finally {
      setReachoutSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Search className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-bold text-white">People Search & Voice AI Reachout</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Paste a Job Description or search talent pool (PDL & Apollo schemas). Match candidates dynamically and trigger automated Hunar Voice AI calls in one click.
        </p>
      </div>

      {/* Job Description Analyzer Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Job Description Match Engine</h3>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <span className="text-xs text-slate-400 shrink-0">Try Preset:</span>
            {PRESET_JDS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setJdText(p.text)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste Job Description here to extract skills and match candidates..."
          className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-sans"
        />

        {/* Extracted Skills Badge Bar */}
        {parsedJd && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs">
            <span className="text-slate-400 font-medium">Extracted Criteria:</span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/30">
              Role: {parsedJd.suggested_role}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30">
              Exp: {parsedJd.required_experience}+ Years
            </span>
            <div className="flex flex-wrap gap-1">
              {parsedJd.extracted_skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono border border-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Inputs & Action Bar */}
        <div className="space-y-3 pt-2">
          {/* Provider Selection Row */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                People Search API Engine *
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="pdl">People Data Labs (PDL) — Person Search API</option>
                <option value="apollo">Apollo.IO — People Search & Sourcing API</option>
                <option value="proxycurl">Proxycurl — LinkedIn Profile Search API</option>
                <option value="coresignal">Coresignal — Multi-Source Talent API</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Search Keywords <span className="text-[10px] text-indigo-400 font-normal">(Auto from JD)</span>
              </label>
              <input
                type="text"
                placeholder={parsedJd?.suggested_role ? `Auto: ${parsedJd.suggested_role}` : "Name, role or company..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Skill Filter <span className="text-[10px] text-emerald-400 font-normal">(Auto-extracted from JD)</span>
              </label>
              <input
                type="text"
                placeholder={parsedJd?.extracted_skills ? `Auto: ${parsedJd.extracted_skills.join(", ")}` : "Auto-extracted from JD (or type to override)..."}
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                placeholder="Bengaluru, Hyderabad..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                {loading ? "Matching..." : "Search & Match Talent"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-lg">Candidates Matched ({candidates.length})</h3>
            {candidates.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"
              >
                {selectedIds.length === candidates.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {selectedIds.length === candidates.length ? "Deselect All" : "Select All Candidates"}
              </button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowReachoutModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 animate-bounce"
            >
              <PhoneCall className="w-4 h-4" />
              Launch Voice AI Reachout ({selectedIds.length})
            </button>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No candidates found matching filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your skill filter or paste a different job description.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((cand) => {
              const isSelected = selectedIds.includes(cand.id);
              return (
                <div
                  key={cand.id}
                  onClick={() => toggleSelectCandidate(cand.id)}
                  className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={cand.avatar_url}
                          alt={cand.full_name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                        <div
                          className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {isSelected ? "✓" : ""}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-base leading-snug">
                            {cand.full_name}
                          </h4>
                          {cand.match_score && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-400" />
                              {cand.match_score}% Match
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                            {cand.provider || "People Data Labs (PDL)"}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-300 font-medium flex items-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" />
                          {cand.title} at {cand.company}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {cand.location} • {cand.experience_years} Yrs Exp
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {cand.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                    {cand.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BULK REACHOUT MODAL */}
      {showReachoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-emerald-500/30 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowReachoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Trigger Voice AI Reachout</h3>
                <p className="text-xs text-slate-400">Selected Candidates: <span className="text-emerald-400 font-bold">{selectedIds.length}</span></p>
              </div>
            </div>

            <form onSubmit={handleLaunchBulkReachout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Hunar Voice AI Agent *
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.voice_persona} - {ag.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-300">Outreach Batch Summary:</div>
                <div className="text-slate-400">• Total recipients: {selectedIds.length} candidates</div>
                <div className="text-slate-400">• Custom Data attached: Role, Company, Location variables per recipient</div>
                <div className="text-slate-400">• Webhook & Transcript: Tracked live on Executive Dashboard</div>
              </div>

              {reachoutResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    reachoutResult.success
                      ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                      : "bg-rose-950/80 border border-rose-500/50 text-rose-300"
                  }`}
                >
                  {reachoutResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <div>{reachoutResult.message}</div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReachoutModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={reachoutSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  {reachoutSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                  {reachoutSubmitting ? "Dispatching..." : "Dispatch Calls"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
