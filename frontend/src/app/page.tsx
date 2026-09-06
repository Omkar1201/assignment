"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HunarAgentsTab } from "@/components/HunarAgentsTab";
import { PeopleSearchTab } from "@/components/PeopleSearchTab";
import { ReachoutDashboardTab } from "@/components/ReachoutDashboardTab";
import { AttendanceSystemTab } from "@/components/AttendanceSystemTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"agents" | "search" | "dashboard" | "attendance">("agents");

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {activeTab === "agents" && <HunarAgentsTab />}
        {activeTab === "search" && <PeopleSearchTab />}
        {activeTab === "dashboard" && <ReachoutDashboardTab />}
        {activeTab === "attendance" && <AttendanceSystemTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 glass-panel mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Hunar.AI Voice AI Hiring & Reachout Platform • Built with Next.js TypeScript & Python Backend
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Production API Key Active</span>
            <span>•</span>
            <a href="https://api.voice.hunar.ai/docs/external/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 underline">
              Hunar API Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
