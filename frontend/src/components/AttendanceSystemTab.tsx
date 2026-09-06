"use client";

import React, { useEffect, useState } from "react";
import { Clock, Phone, Mic, ShieldCheck, MapPin, Radio, MessageSquare, CheckCircle2, Sparkles, Building, Layers, Send, RefreshCw } from "lucide-react";
import { fetchApi, AttendanceLocation, AttendanceLog } from "@/lib/api";

export const AttendanceSystemTab: React.FC = () => {
  const [architecture, setArchitecture] = useState<any>(null);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulator form state
  const [workerName, setWorkerName] = useState("Ramesh Kumar");
  const [empId, setEmpId] = useState("EMP-9021");
  const [selectedLocationId, setSelectedLocationId] = useState("LOC-001");
  const [speechInput, setSpeechInput] = useState("Present sir, location Site 1, Ramesh Kumar EMP 9021");
  const [simulating, setSimulating] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<AttendanceLog | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [archData, locsData, logsData] = await Promise.all([
        fetchApi<any>("/api/attendance/architecture"),
        fetchApi<AttendanceLocation[]>("/api/attendance/locations"),
        fetchApi<AttendanceLog[]>("/api/attendance/logs"),
      ]);
      setArchitecture(archData);
      setLocations(locsData || []);
      setLogs(logsData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await fetchApi<AttendanceLog>("/api/attendance/simulate-checkin", {
        method: "POST",
        body: JSON.stringify({
          worker_name: workerName,
          emp_id: empId,
          location_id: selectedLocationId,
          speech_input: speechInput,
        }),
      });
      setLastCheckinResult(res);
      loadData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Solution Header */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              No-Smartphone Attendance System
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                1000 Staff • 100 Locations
              </span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Task 3 HR Solution: Zero smartphones, zero apps. Powered by Inbound Voice AI IVR, PSTN Telephony Geofencing, and Automated Outbound Check-ins.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Locations Matrix
        </button>
      </div>

      {/* 4 Pillars Solution Architecture Grid */}
      {architecture && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Architectural Solution Blueprint
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecture.core_pillars.map((pillar: any, idx: number) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-base leading-snug">{pillar.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive IVR Simulator Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Test Inbound Feature Phone IVR Call</h3>
          </div>
          <p className="text-xs text-slate-400">
            Simulate a worker calling 1800-ATTEND-AI from a basic Nokia/Jio feature phone or POTS landline.
          </p>

          <form onSubmit={handleSimulateCheckin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Worker Name</label>
              <input
                type="text"
                required
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Employee ID Code</label>
              <input
                type="text"
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Select Location (100 Sites)</label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {locations.slice(0, 20).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Spoken Voice Transcript (Feature Phone Audio Input)</label>
              <textarea
                rows={2}
                required
                value={speechInput}
                onChange={(e) => setSpeechInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {simulating ? "Verifying Voice Bio & PSTN..." : "Simulate IVR Call Check-In"}
            </button>
          </form>

          {/* Simulation Output Card */}
          {lastCheckinResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Voice AI Attendance Marked!
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>• Verified: <span className="font-semibold text-white">{lastCheckinResult.worker_name} ({lastCheckinResult.emp_id})</span></div>
                <div>• Location: <span className="text-indigo-300">{lastCheckinResult.location_name}</span></div>
                <div>• PSTN Node: <span className="font-mono text-slate-400">{lastCheckinResult.telecom_node}</span></div>
                <div className="p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] mt-2 border border-slate-800">
                  {lastCheckinResult.confirmation_sms}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live 100 Locations Attendance Heatmap Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              Real-time 100 Locations Monitoring Heatmap
            </h3>
            <span className="text-xs text-slate-400">Total Staff Tracked: 1,000</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto p-1">
            {locations.slice(0, 24).map((loc) => (
              <div
                key={loc.id}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  loc.status === "COMPLETED"
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : loc.status === "PARTIAL"
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <div>
                  <div className="font-bold truncate text-white">{loc.name}</div>
                  <div className="text-[10px] text-slate-400">{loc.region} Region</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-bold">{loc.present_workers} / {loc.total_workers} Present</span>
                  <span className="text-[10px] uppercase font-semibold">{loc.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Logs */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Voice Check-In Feed Logs
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-4 text-center">No simulated check-in calls yet. Test the IVR call on the left!</div>
              ) : (
                logs.map((lg, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white">{lg.worker_name} ({lg.emp_id})</div>
                      <div className="text-[11px] text-slate-400">{lg.location_name} • {lg.timestamp}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PRESENT
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
