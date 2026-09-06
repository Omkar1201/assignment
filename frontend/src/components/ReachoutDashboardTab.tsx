"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Phone, CheckCircle2, Clock, Play, FileText, AlertCircle, RefreshCw, Filter, Sparkles, User, ThumbsUp, DollarSign } from "lucide-react";
import { fetchApi, HunarCall } from "@/lib/api";

export const ReachoutDashboardTab: React.FC = () => {
  const [calls, setCalls] = useState<HunarCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedCall, setSelectedCall] = useState<HunarCall | null>(null);

  const loadCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = statusFilter ? `/api/calls?status=${statusFilter}` : "/api/calls?page_size=50";
      const res = await fetchApi<{ count: number; results: HunarCall[] }>(endpoint);
      setCalls(res.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch call logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [statusFilter]);

  // Compute metrics
  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === "COMPLETED" || c.lifecycle_status === "COMPLETED").length;
  const inProgressCalls = calls.filter((c) => c.status === "IN_PROGRESS").length;
  const interestedCount = calls.filter((c) => {
    const r = c.result;
    if (!r) return false;
    return r.interested === "Yes" || r.interested === true || r.open_to_opportunity === "yes";
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-white">Voice AI Reachout & Candidate Dashboard</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time call tracking, extracted conversation responses, audio recordings, and candidate interest analytics.
          </p>
        </div>

        <button
          onClick={loadCalls}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Feed
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Outbound Calls</span>
            <Phone className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalCalls}</div>
          <div className="text-xs text-indigo-300 mt-1 font-medium">Hunar Voice Engine Active</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Calls Connected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{completedCalls}</div>
          <div className="text-xs text-slate-400 mt-1">
            Connection Rate: <span className="text-emerald-300 font-bold">{totalCalls ? Math.round((completedCalls / totalCalls) * 100) : 0}%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Candidates Interested</span>
            <ThumbsUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{interestedCount}</div>
          <div className="text-xs text-slate-400 mt-1">
            Positive Intent: <span className="text-amber-300 font-bold">{completedCalls ? Math.round((interestedCount / completedCalls) * 100) : 0}%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Calls In Progress</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{inProgressCalls}</div>
          <div className="text-xs text-slate-400 mt-1">Live Telephony Session</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter by Call Status:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {["", "COMPLETED", "IN_PROGRESS", "NOT_CONNECTED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st === "" ? "All Calls" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-300 font-medium">Fetching Hunar call history & conversation responses...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <div>
              <p className="font-semibold">Error Loading Calls</p>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Phone className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No calls found</p>
            <p className="text-xs text-slate-400 mt-1">Trigger an outbound call from the AI Hiring Assistant tab to populate this dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Candidate / Phone</th>
                  <th className="px-6 py-4">Call Status</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Extracted AI Findings</th>
                  <th className="px-6 py-4">Audio Recording</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {calls.map((call) => {
                  const res = call.result || {};
                  const isInterested = res.interested === "Yes" || res.interested === true || res.open_to_opportunity === "yes";
                  return (
                    <tr key={call.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" />
                          {call.callee_name || "Unknown Candidate"}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">{call.mobile_number}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                            call.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : call.status === "IN_PROGRESS"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {call.status || call.lifecycle_status || "ACTIVE"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-300">
                        {call.duration_minutes ? `${call.duration_minutes} min` : call.duration_seconds ? `${call.duration_seconds} sec` : "0:45 min"}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        {Object.keys(res).length > 0 ? (
                          <div className="space-y-1 text-xs">
                            {isInterested && (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 text-[10px]">
                                ★ Candidate Interested
                              </span>
                            )}
                            {res.qualification_summary && (
                              <p className="text-slate-300 line-clamp-2 italic text-[11px]">{`"${res.qualification_summary}"`}</p>
                            )}
                            {res.notice_period && (
                              <span className="inline-block mr-1 text-[10px] text-indigo-300">Notice: {res.notice_period}</span>
                            )}
                            {res.compensation_expectation && (
                              <span className="inline-block text-[10px] text-amber-300">Expected: {res.compensation_expectation}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Call active / Awaiting schema output</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {call.recording_url ? (
                          <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 inline-flex items-center gap-1.5 transition"
                          >
                            <Play className="w-3.5 h-3.5 text-indigo-400" />
                            Listen Audio
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">Processing audio</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Full Call JSON & Transcript"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALL DETAILS DRAWER MODAL */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl h-full p-6 border-l border-indigo-500/30 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Call Conversation Transcript</h3>
                  <p className="text-xs text-slate-400">ID: {selectedCall.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Candidate & Call Parameters</div>
                  <div className="text-sm text-white font-bold">{selectedCall.callee_name} ({selectedCall.mobile_number})</div>
                  <div className="text-xs text-slate-400">Status: <span className="text-emerald-400 font-bold">{selectedCall.status}</span></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Structured Response Extracted (Hunar Voice Schema)
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto">
                    {JSON.stringify(selectedCall.result || {}, null, 2)}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw API Response</div>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] max-h-60 overflow-y-auto">
                    {JSON.stringify(selectedCall, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCall(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition mt-6"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
