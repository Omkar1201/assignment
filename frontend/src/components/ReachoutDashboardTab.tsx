"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Phone, CheckCircle2, Clock, Play, FileText, AlertCircle, RefreshCw, Filter, Sparkles, User, ThumbsUp, CalendarDays, MessageSquare, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi, HunarCall } from "@/lib/api";

const formatLabel = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${formatLabel(key)}: ${formatValue(entry)}`)
      .join(" • ");
  }
  return String(value);
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getDisplayStatus = (call: HunarCall) => call.status || call.lifecycle_status || "ACTIVE";

export const ReachoutDashboardTab: React.FC = () => {
  const [calls, setCalls] = useState<HunarCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCallsCount, setTotalCallsCount] = useState(0);
  const [selectedCall, setSelectedCall] = useState<HunarCall | null>(null);

  const loadCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const allCalls: HunarCall[] = [];
      let currentPage = 1;
      let expectedCount = 0;

      while (true) {
        const params = new URLSearchParams({ page: String(currentPage), page_size: "200" });
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetchApi<{ count: number; results: HunarCall[] }>(`/api/calls?${params.toString()}`);
        const pageResults = res.results || [];
        allCalls.push(...pageResults);
        expectedCount = res.count || allCalls.length;

        if (pageResults.length === 0 || allCalls.length >= expectedCount) break;
        currentPage += 1;
      }

      setCalls(allCalls);
      setTotalCallsCount(allCalls.length);
    } catch (err: any) {
      setError(err.message || "Failed to fetch call logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [statusFilter]);

  const filteredCalls = calls.filter((call) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return [call.callee_name, call.mobile_number, call.id, call.status, call.lifecycle_status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });
  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / pageSize));
  const paginatedCalls = filteredCalls.slice((page - 1) * pageSize, page * pageSize);

  // Compute metrics
  const totalCalls = totalCallsCount;
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
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <label className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search candidate, phone, or call ID"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
              aria-label="Search calls"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Status:</span>
            {["", "COMPLETED", "IN_PROGRESS", "NOT_CONNECTED", "FAILED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing {filteredCalls.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredCalls.length)} of {filteredCalls.length} calls
            {searchTerm.trim() && filteredCalls.length !== calls.length ? " matching" : ""}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400" htmlFor="calls-page-size">Rows:</label>
            <select
              id="calls-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
            >
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-300 min-w-16 text-center">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
        ) : filteredCalls.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Phone className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">{searchTerm ? "No matching calls found" : "No calls found"}</p>
            <p className="text-xs text-slate-400 mt-1">{searchTerm ? "Try a different candidate name, phone number, or call ID." : "Trigger an outbound call from the AI Hiring Assistant tab to populate this dashboard."}</p>
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
                {paginatedCalls.map((call) => {
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
          <div className="glass-panel w-full max-w-2xl h-full p-6 border-l border-indigo-500/30 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Reachout summary</p>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedCall.callee_name || "Unknown Candidate"}</h3>
                  <p className="text-xs text-slate-400 mt-1">Call ID: {selectedCall.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
                  aria-label="Close call details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" /> Contact
                    </div>
                    <div className="text-sm text-white font-semibold mt-2">{selectedCall.mobile_number || "Not provided"}</div>
                    <div className="text-xs text-slate-500 mt-1">{selectedCall.language || "Default language"}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Call status
                    </div>
                    <div className="text-sm text-emerald-400 font-semibold mt-2">{getDisplayStatus(selectedCall)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {selectedCall.duration_minutes ? `${selectedCall.duration_minutes} minutes` : selectedCall.duration_seconds ? `${selectedCall.duration_seconds} seconds` : "Duration not available"}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-400" /> Started
                    </div>
                    <div className="text-sm text-slate-200 mt-2">{formatDate(selectedCall.started_at || selectedCall.created_at)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Play className="w-3.5 h-3.5 text-emerald-400" /> Recording
                    </div>
                    {selectedCall.recording_url ? (
                      <a href={selectedCall.recording_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white mt-2">
                        Listen to call <Play className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="text-sm text-slate-500 mt-2">Not available</div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI findings
                  </div>
                  {Object.keys(selectedCall.result || {}).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedCall.result || {}).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-slate-950/70 border border-slate-800 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{formatLabel(key)}</div>
                          <div className="text-sm text-slate-100 mt-1 wrap-break-word">{formatValue(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">The call has not returned structured findings yet.</p>
                  )}
                </div>

                {selectedCall.custom_data && Object.keys(selectedCall.custom_data).length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-4">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Reachout context
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedCall.custom_data).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-[11px] text-slate-500">{formatLabel(key)}</div>
                          <div className="text-sm text-slate-200 mt-0.5 wrap-break-word">{formatValue(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
