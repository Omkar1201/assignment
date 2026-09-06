"use client";

import React, { useEffect, useState } from "react";
import { Bot, PhoneCall, Plus, RefreshCw, CheckCircle2, AlertCircle, Phone, Globe, Sliders, ShieldCheck, Sparkles, Layers, Edit3, Eye, FileText, Code2, Tag, Calendar, UserCheck } from "lucide-react";
import { fetchApi, HunarAgent } from "@/lib/api";

export const HunarAgentsTab: React.FC = () => {
  const [agents, setAgents] = useState<HunarAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single Call Modal state
  const [selectedCallAgent, setSelectedCallAgent] = useState<HunarAgent | null>(null);
  const [calleeName, setCalleeName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("+91");
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [callSubmitting, setCallSubmitting] = useState(false);
  const [callFeedback, setCallFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create Agent Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newLanguage, setNewLanguage] = useState("ENGLISH");
  const [newVoicePersona, setNewVoicePersona] = useState("NEHA");
  const [newPersonaName, setNewPersonaName] = useState("Seema");
  const [newAgentPrompt, setNewAgentPrompt] = useState("You are a professional hiring screener evaluating technical candidate interest and notice period.");
  const [newIntroduction, setNewIntroduction] = useState("Hello {callee_name}, this is {persona_name} from {company}. Are you open for a quick chat regarding the {role} position?");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Agent Detail & Update Modal state
  const [detailAgent, setDetailAgent] = useState<HunarAgent | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editPersonaName, setEditPersonaName] = useState("");
  const [editVoicePersona, setEditVoicePersona] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editAgentPrompt, setEditAgentPrompt] = useState("");
  const [editIntroduction, setEditIntroduction] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editResultPrompt, setEditResultPrompt] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ results: HunarAgent[] }>("/api/agents");
      setAgents(res.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Open Agent Detail Modal & Fetch complete info
  const openAgentDetailModal = async (agent: HunarAgent) => {
    setDetailAgent(agent);
    setFetchingDetail(true);
    setIsEditing(false);
    setEditFeedback(null);

    // Set initial edit state from shallow agent data
    setEditName(agent.name || "");
    setEditPersonaName(agent.persona_name || "");
    setEditVoicePersona(agent.voice_persona || "NEHA");
    setEditLanguage(agent.language || "ENGLISH");
    setEditAgentPrompt(agent.agent_prompt || "You are an AI hiring screener.");
    setEditIntroduction(agent.introduction || "Hello {callee_name}, this is {persona_name}. Are you available?");
    setEditObjective(agent.objective || "Screen candidates for position availability.");
    setEditResultPrompt("Extract qualification summary, interest level, and notice period.");

    try {
      // Fetch full agent specs from detail endpoint
      const fullAgent = await fetchApi<HunarAgent>(`/api/agents/${agent.id}`);
      if (fullAgent && fullAgent.id) {
        setDetailAgent(fullAgent);
        setEditName(fullAgent.name || "");
        setEditPersonaName(fullAgent.persona_name || "");
        setEditVoicePersona(fullAgent.voice_persona || "NEHA");
        setEditLanguage(fullAgent.language || "ENGLISH");
        if (fullAgent.agent_prompt) setEditAgentPrompt(fullAgent.agent_prompt);
        if (fullAgent.introduction) setEditIntroduction(fullAgent.introduction);
        if (fullAgent.objective) setEditObjective(fullAgent.objective);
      }
    } catch (err: any) {
      console.warn("Detail fetch warning:", err.message);
    } finally {
      setFetchingDetail(false);
    }
  };

  // Handle Agent Update (PUT /api/agents/{agent_id})
  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailAgent) return;
    setEditSubmitting(true);
    setEditFeedback(null);

    try {
      const updatePayload = {
        name: editName,
        persona_name: editPersonaName,
        voice_persona: editVoicePersona,
        language: editLanguage,
        agent_prompt: editAgentPrompt,
        introduction: editIntroduction,
        objective: editObjective,
        result_prompt: editResultPrompt,
      };

      const updated = await fetchApi<HunarAgent>(`/api/agents/${detailAgent.id}`, {
        method: "PUT",
        body: JSON.stringify(updatePayload),
      });

      setDetailAgent({ ...detailAgent, ...updatePayload, ...(updated || {}) });
      setEditFeedback({
        type: "success",
        text: "Agent details updated successfully on Hunar Voice Engine!"
      });
      setIsEditing(false);
      loadAgents();
    } catch (err: any) {
      setEditFeedback({
        type: "error",
        text: err.message || "Failed to update agent details"
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const openCallModal = (agent: HunarAgent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCallAgent(agent);
    setCalleeName("");
    setMobileNumber("+91");
    setCallFeedback(null);

    const initialVars: Record<string, string> = {};
    (agent.custom_variables || []).forEach((v) => {
      initialVars[v] = v === "company" ? "Hunar AI Tech" : v === "role" || v === "role_title" ? "Senior Software Engineer" : "Bengaluru";
    });
    setCustomData(initialVars);
  };

  const handleLaunchCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCallAgent) return;
    setCallSubmitting(true);
    setCallFeedback(null);

    try {
      const payload = {
        agent_id: selectedCallAgent.id,
        callee_name: calleeName,
        mobile_number: mobileNumber,
        custom_data: customData,
        request_id: `req-${Date.now()}`
      };

      const res = await fetchApi<any>("/api/calls", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCallFeedback({
        type: "success",
        text: `Outbound voice call triggered successfully! Call ID: ${res.id || "Active"}`
      });
    } catch (err: any) {
      setCallFeedback({
        type: "error",
        text: err.message || "Failed to place voice call"
      });
    } finally {
      setCallSubmitting(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const payload = {
        name: newAgentName,
        language: newLanguage,
        voice_persona: newVoicePersona,
        persona_name: newPersonaName,
        agent_prompt: newAgentPrompt,
        objective: "Screen potential job candidates and assess qualification and availability.",
        introduction: newIntroduction,
        result_prompt: "Extract candidate interest status, notice period, and salary expectations.",
        result_schema: {
          interested: "boolean",
          notice_period: "string",
          qualification_summary: "string"
        }
      };

      await fetchApi<any>("/api/agents", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setShowCreateModal(false);
      loadAgents();
    } catch (err: any) {
      alert(`Error creating agent: ${err.message}`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-white">AI Hiring Assistant Agents</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Click any agent card to view detailed specifications and update prompts. Trigger live automated voice screenings.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadAgents}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition flex items-center gap-2 border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Fetching Hunar Voice Agents...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-semibold">Error Loading Agents</h4>
            <p className="text-xs text-rose-300/80">{error}</p>
          </div>
        </div>
      ) : agents.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No Voice Agents Found</p>
          <p className="text-xs text-slate-400 mt-1">Create your first AI recruiter persona to start making outbound calls.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => openAgentDetailModal(agent)}
              className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:border-indigo-500/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {agent.logo ? (
                      <img src={agent.logo} alt={agent.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                        {agent.persona_name?.[0] || "A"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {agent.voice_persona} ({agent.persona_name})
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {agent.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {agent.summary || "AI screener persona for evaluating technical and domain skills, candidate availability, and role alignment."}
                </p>

                {/* System Required Variables Badge */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    System Required Variables
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {`{callee_name}`}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {`{mobile_number}`}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {`{persona_name}`}
                    </span>
                  </div>
                </div>

                {/* Custom Variables Badge */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Custom Prompt Input Variables
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.custom_variables && agent.custom_variables.length > 0 ? (
                      agent.custom_variables.map((v) => (
                        <span key={v} className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {`{${v}}`}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No additional custom variables</span>
                    )}
                  </div>
                </div>

                {/* Extracted Schema Key Indicators */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Data Schema Extracted
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.result_variables && agent.result_variables.length > 0 ? (
                      agent.result_variables.slice(0, 3).map((rv) => (
                        <span key={rv} className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          {rv}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Standard JSON result</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAgentDetailModal(agent);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  View & Edit
                </button>

                <button
                  onClick={(e) => openCallModal(agent, e)}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/25"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Start Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AGENT DETAIL & EDIT MODAL */}
      {detailAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl p-6 rounded-2xl border border-indigo-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailAgent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                {detailAgent.logo ? (
                  <img src={detailAgent.logo} alt={detailAgent.name} className="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
                    {detailAgent.persona_name?.[0] || "A"}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {detailAgent.name}
                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {detailAgent.status || "ACTIVE"}
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-indigo-300">{detailAgent.agent_code ? `Code: ${detailAgent.agent_code}` : `ID: ${detailAgent.id}`}</span>
                    <span>•</span>
                    <span className="text-slate-300">Persona: <strong className="text-white">{detailAgent.voice_persona} ({detailAgent.persona_name})</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{detailAgent.language}</span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Agent
                </button>
              )}
            </div>

            {fetchingDetail && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Fetching full prompt specifications from Hunar Voice API...
              </div>
            )}

            {editFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 mb-4 ${
                  editFeedback.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/80 border border-rose-500/50 text-rose-300"
                }`}
              >
                {editFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                <div>{editFeedback.text}</div>
              </div>
            )}

            {/* READ-ONLY VIEW OR EDIT FORM */}
            {!isEditing ? (
              <div className="space-y-6 text-sm">
                {/* Overview Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    Agent Summary & Purpose
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {detailAgent.summary || "This Hunar AI voice agent conducts automated outbound screenings for candidate evaluation, assessing technical competencies, interest levels, and availability."}
                  </p>
                </div>

                {/* Prompts & Greetings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Introduction Greeting
                    </h4>
                    <p className="text-xs font-mono text-emerald-300 p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                      {detailAgent.introduction || "Hello {callee_name}, this is {persona_name}. Are you available for a quick chat regarding the {role} role?"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Business Objective
                    </h4>
                    <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                      {detailAgent.objective || "Qualify lead candidates and capture notice period and availability."}
                    </p>
                  </div>
                </div>

                {/* System Prompt */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    System Prompt & Recruiter Persona Instructions
                  </h4>
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800">
                    {detailAgent.agent_prompt || "You are an AI hiring screener calling candidates to assess skills and notice period."}
                  </pre>
                </div>

                {/* Variables Overview */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    All Variable Mapping Specifications
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-cyan-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        System Mandatory Call Variables:
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {`{callee_name}`} (Candidate Name)
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {`{mobile_number}`} (Recipient Phone)
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {`{persona_name}`} (Voice Display Name)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        These standard fields are populated automatically when placing an outbound call.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-indigo-400 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5" />
                        Custom Prompt Variables ({`custom_data`}):
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {detailAgent.custom_variables && detailAgent.custom_variables.length > 0 ? (
                          detailAgent.custom_variables.map((v) => (
                            <span key={v} className="px-2 py-0.5 text-[11px] font-mono rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {`{${v}}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No additional custom variables defined</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Passed dynamically inside <code className="font-mono text-indigo-300">custom_data</code> object per recipient.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Result Schema */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Structured Response Extraction Schema
                  </h4>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] max-h-32 overflow-y-auto border border-slate-800">
                    {JSON.stringify(detailAgent.result_schema || {}, null, 2)}
                  </pre>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => openCallModal(detailAgent)}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Launch Outbound Call With This Agent
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailAgent(null)}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT FORM VIEW */
              <form onSubmit={handleUpdateAgent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Persona Call Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPersonaName}
                      onChange={(e) => setEditPersonaName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Voice Persona Identifier *
                    </label>
                    <select
                      value={editVoicePersona}
                      onChange={(e) => setEditVoicePersona(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="NEHA">NEHA (Female - English/Hindi)</option>
                      <option value="ROY">ROY (Male - Corporate/Tech)</option>
                      <option value="ZOE">ZOE (Female - Warm/Sourcing)</option>
                      <option value="SAM">SAM (Male - Energetic)</option>
                      <option value="MIRA">MIRA (Female - Professional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Primary Language *
                    </label>
                    <select
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ENGLISH">ENGLISH</option>
                      <option value="HINDI">HINDI</option>
                      <option value="TAMIL">TAMIL</option>
                      <option value="TELUGU">TELUGU</option>
                      <option value="KANNADA">KANNADA</option>
                      <option value="MARATHI">MARATHI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Call Introduction Greeting *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editIntroduction}
                    onChange={(e) => setEditIntroduction(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Available variables: <span className="font-mono text-cyan-300">{`{callee_name}`}</span>, <span className="font-mono text-cyan-300">{`{persona_name}`}</span>, plus any custom variables like <span className="font-mono text-indigo-300">{`{company}`}</span>, <span className="font-mono text-indigo-300">{`{role_title}`}</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Business Objective *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editObjective}
                    onChange={(e) => setEditObjective(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    System Prompt & Recruiter Behavior Instructions *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editAgentPrompt}
                    onChange={(e) => setEditAgentPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                  >
                    Cancel Editing
                  </button>

                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    {editSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {editSubmitting ? "Saving Updates..." : "Save & Update Agent"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SINGLE CALL LAUNCHER MODAL */}
      {selectedCallAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedCallAgent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Outbound Voice Call</h3>
                <p className="text-xs text-slate-400">Agent: <span className="text-indigo-300 font-semibold">{selectedCallAgent.name}</span> ({selectedCallAgent.voice_persona})</p>
              </div>
            </div>

            <form onSubmit={handleLaunchCall} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Candidate Name * <span className="text-cyan-400 font-mono font-normal">({`{callee_name}`})</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={calleeName}
                  onChange={(e) => setCalleeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Phone Number (E.164 format) * <span className="text-cyan-400 font-mono font-normal">({`{mobile_number}`})</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Custom Variables */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Custom Prompt Variables ({`custom_data`})
                </h4>

                {selectedCallAgent.custom_variables && selectedCallAgent.custom_variables.length > 0 ? (
                  selectedCallAgent.custom_variables.map((vKey) => (
                    <div key={vKey}>
                      <label className="block text-xs text-slate-400 mb-1">
                        Variable: <span className="font-mono text-slate-200">{`{${vKey}}`}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customData[vKey] || ""}
                        onChange={(e) => setCustomData({ ...customData, [vKey]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    This agent doesn't require additional custom prompt variables beyond candidate name and phone number.
                  </p>
                )}
              </div>

              {/* Feedback Alert */}
              {callFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    callFeedback.type === "success"
                      ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                  }`}
                >
                  {callFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <div>{callFeedback.text}</div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCallAgent(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={callSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {callSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                  {callSubmitting ? "Dialing..." : "Start Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE AGENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create Hunar Voice AI Agent</h3>
                <p className="text-xs text-slate-400">Configure new AI recruiter persona & multilingual settings</p>
              </div>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Agent Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Tech Lead Screener"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Voice Persona *
                  </label>
                  <select
                    value={newVoicePersona}
                    onChange={(e) => setNewVoicePersona(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NEHA">NEHA (Female - English/Hindi)</option>
                    <option value="ROY">ROY (Male - Corporate/Tech)</option>
                    <option value="ZOE">ZOE (Female - Warm/Sourcing)</option>
                    <option value="SAM">SAM (Male - Energetic)</option>
                    <option value="MIRA">MIRA (Female - Professional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Persona Call Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Seema / Rahul"
                    value={newPersonaName}
                    onChange={(e) => setNewPersonaName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Language *
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="ENGLISH">ENGLISH</option>
                  <option value="HINDI">HINDI</option>
                  <option value="TAMIL">TAMIL</option>
                  <option value="TELUGU">TELUGU</option>
                  <option value="KANNADA">KANNADA</option>
                  <option value="MARATHI">MARATHI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Call Introduction Greeting *
                </label>
                <textarea
                  rows={2}
                  value={newIntroduction}
                  onChange={(e) => setNewIntroduction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  You can use variables: <span className="font-mono text-cyan-300">{`{callee_name}`}</span>, <span className="font-mono text-cyan-300">{`{persona_name}`}</span>, <span className="font-mono text-indigo-300">{`{company}`}</span>, <span className="font-mono text-indigo-300">{`{role}`}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  System Prompt & Recruiter Persona *
                </label>
                <textarea
                  rows={3}
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {createSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {createSubmitting ? "Creating..." : "Save Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
