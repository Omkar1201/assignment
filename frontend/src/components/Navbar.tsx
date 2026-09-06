"use client";

import React, { useEffect, useState } from "react";
import { Bot, Users, BarChart3, Clock, Radio, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface NavbarProps {
  activeTab: "agents" | "search" | "dashboard" | "attendance";
  setActiveTab: (tab: "agents" | "search" | "dashboard" | "attendance") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchApi<{ status: string }>("/api/health")
      .then((res) => setApiOnline(res.status === "online"))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Hunar<span className="glow-text font-extrabold">Voice.AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO RECRUIT
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Hiring Assistant & People Reachout Suite</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-sm overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "agents"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>1. AI Hiring Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "search"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. People Search & Reachout</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>3. Reachout Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "attendance"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="flex items-center gap-1">
              4. No-Smartphone Attendance
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
          </button>
        </nav>

        {/* API Status Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span className="text-slate-400">Backend API:</span>
          {apiOnline === null ? (
            <span className="text-amber-400 font-medium">Checking...</span>
          ) : apiOnline ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span>
              Live Proxy Active
            </span>
          ) : (
            <span className="text-rose-400 font-semibold">Disconnected</span>
          )}
        </div>
      </div>
    </header>
  );
};
