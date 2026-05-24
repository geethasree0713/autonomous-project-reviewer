import React from "react";
import { 
  LayoutGrid, 
  GitPullRequest, 
  ShieldAlert, 
  Network, 
  BookOpen, 
  Settings, 
  Terminal,
  FileCode2,
  Cpu
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  repoName: string;
  repoOwner: string;
}

export default function Sidebar({ activeTab, setActiveTab, repoName, repoOwner }: SidebarProps) {
  const tabs = [
    { id: "dashboard", label: "Core Workspace", icon: LayoutGrid, desc: "Overview & files" },
    { id: "pr", label: "Autonomous PR Reviewer", icon: GitPullRequest, desc: "Severity PR comments & fixes", badge: "2" },
    { id: "chat", label: "Codebase Memory Chat", icon: Terminal, desc: "Conversational repository chat" },
    { id: "risk", label: "Enterprise Risk Center", icon: ShieldAlert, desc: "Vulnerabilities & scorecards" },
    { id: "architecture", label: "Architecture Visualizer", icon: Network, desc: "Dependency graphs & relationships" },
    { id: "readme", label: "README Documentation", icon: BookOpen, desc: "Interactive README generator", highlight: true },
  ];

  return (
    <aside className="w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-900/40 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-white text-base leading-tight">
              Aegis Autonomous
            </h1>
            <p className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase font-semibold">
              AI Engineering Platform
            </p>
          </div>
        </div>

        {repoName ? (
          <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-800/85 rounded-xl flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="truncate min-w-0">
              <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider font-semibold">Active Repository</p>
              <h2 className="text-xs text-zinc-200 font-medium truncate font-sans">{repoOwner}/{repoName}</h2>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 font-sans italic text-center">No active repository</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono mb-2">
          Intelligence Suites
        </p>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left relative ${
                isActive
                  ? "bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 shadow-[inset_0_1px_1px_rgba(99,102,241,0.1)]"
                  : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"
                }`} />
                <div className="truncate">
                  <span className={`font-sans text-sm block font-medium ${isActive ? "text-zinc-100" : "text-zinc-300"}`}>
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 block truncate font-sans font-normal leading-normal mt-0.5 group-hover:text-zinc-400 transition-colors">
                    {tab.desc}
                  </span>
                </div>
              </div>

              {tab.badge && (
                <span className="bg-amber-950/60 border border-amber-600/30 text-amber-400 text-[10px] font-mono leading-none py-1 px-1.5 rounded-md font-bold">
                  {tab.badge}
                </span>
              )}
              {tab.highlight && !isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Credentials */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            V3.5 Flash Active
          </span>
          <span>Port 3000</span>
        </div>
      </div>
    </aside>
  );
}
