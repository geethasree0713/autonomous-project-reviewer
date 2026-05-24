import React, { useState } from "react";
import { 
  Github, 
  Search, 
  Star, 
  Folder, 
  FileText, 
  GitBranch, 
  Code2, 
  Loader2, 
  ArrowRight, 
  GitPullRequest, 
  BookOpen, 
  FileCode2,
  AlertCircle
} from "lucide-react";
import { RepoInfo, RepoFile, PullRequest } from "../types";

interface DashboardProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  repoInfo: RepoInfo | null;
  fileTree: RepoFile[];
  pulls: PullRequest[];
  isLoading: boolean;
  onScan: () => void;
  onSelectPr: (pr: PullRequest) => void;
  onOpenFile: (file: RepoFile, content: string) => void;
  openFile: { path: string; content: string } | null;
  onCreateReadme: () => void;
}

export default function Dashboard({
  repoUrl,
  setRepoUrl,
  githubToken,
  setGithubToken,
  repoInfo,
  fileTree,
  pulls,
  isLoading,
  onScan,
  onSelectPr,
  onOpenFile,
  openFile,
  onCreateReadme,
}: DashboardProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileClick = async (file: RepoFile) => {
    if (file.type === "dir") return;
    setSelectedFilePath(file.path);
    setFileContentLoading(true);
    try {
      const res = await fetch("/api/github/file-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: repoUrl,
          filePath: file.path,
          githubToken,
        }),
      });
      const data = await res.json();
      onOpenFile(file, data.content || "");
    } catch (err) {
      console.error(err);
    } finally {
      setFileContentLoading(false);
    }
  };

  const filteredTree = fileTree.filter((file) =>
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-900 flex flex-col h-screen text-zinc-100">
      
      {/* Search Header Bar */}
      <header className="p-6 bg-zinc-950/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 backdrop-blur z-10">
        <div className="flex-1 max-w-xl">
          <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
            Synchronize Codebase Boundary
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/facebook/react or username/repo"
                id="github_url_input"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <button
              onClick={onScan}
              disabled={isLoading || !repoUrl}
              id="analyze_repo_button"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl text-white font-sans font-medium text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Deploy Intelligence</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* GitHub Secrets configuration panel */}
        <div className="flex flex-col gap-1 items-end">
          <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block font-semibold">
            GitHub Token (Optional / Skip Rate Limits)
          </label>
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxx"
            id="github_token_input"
            className="w-48 bg-zinc-950/60 border border-zinc-900 rounded-lg px-2.5 py-1 text-xs text-zinc-400 font-mono focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
          />
        </div>
      </header>

      {/* Main Workspace Frame */}
      {repoInfo ? (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Hero Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Repository summary card */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Metadata Specs</span>
                <h3 className="text-xl font-bold font-sans text-white mt-1.5 truncate">{repoInfo.name}</h3>
                <p className="text-zinc-400 text-xs font-sans mt-2 line-clamp-2 leading-relaxed">{repoInfo.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {repoInfo.stars} stars</span>
                <span className="flex items-center gap-1.5"><GitBranch className="w-4 h-4 text-zinc-500" /> {repoInfo.defaultBranch}</span>
              </div>
            </div>

            {/* Architecture high-level scorecard */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Codebase Volume</span>
                <h3 className="text-3xl font-mono font-bold text-white mt-2.5">{fileTree.length}</h3>
                <p className="text-zinc-400 text-xs font-sans mt-2 leading-relaxed">Recursive source objects verified by autonomous memory.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-indigo-400" /> {repoInfo.languages.join(", ")}</span>
                <span className="text-emerald-500 font-semibold uppercase tracking-wider text-[10px]">Scanned: Normal</span>
              </div>
            </div>

            {/* AI Documentation Launch Pad */}
            <div className="bg-gradient-to-br from-indigo-950/30 to-zinc-950 border border-indigo-900/30 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl transform translate-x-8 -translate-y-8" />
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Documation Suite</span>
                <h3 className="text-lg font-bold font-sans text-white mt-1.5">No README found?</h3>
                <p className="text-zinc-400 text-xs font-sans mt-2 leading-relaxed">Auto-synthesize a custom, presentation README covering files & structures with a single click.</p>
              </div>
              <button
                onClick={onCreateReadme}
                id="create_doc_dashboard_button"
                className="mt-5 w-full bg-indigo-600 hover:bg-slate-500 text-white font-sans font-medium text-xs py-2.5 rounded-xl border border-indigo-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Create Documentation</span>
              </button>
            </div>
            
          </div>

          {/* Grid: Repo File Explorer & Active File Content Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Folder list sidebar */}
            <div className="lg:col-span-5 bg-zinc-950/40 border border-zinc-850 rounded-2xl overflow-hidden flex flex-col h-[520px]">
              <div className="p-4 border-b border-zinc-850/80 bg-zinc-950/60 flex items-center justify-between">
                <span className="text-xs font-mono tracking-wider uppercase font-bold text-zinc-400">File Hierarchy Explorer</span>
                <span className="text-[10px] font-mono bg-zinc-900 py-1 px-2 border border-zinc-800 rounded text-zinc-500">{filteredTree.length} objects</span>
              </div>
              
              <div className="p-3 border-b border-zinc-850/80">
                <input
                  type="text"
                  placeholder="Filter elements... (e.g. App.tsx)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-600 placeholder:text-zinc-650"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
                {filteredTree.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={`w-full text-left flex items-center justify-between p-2 rounded-lg text-xs leading-normal font-mono group transition-colors ${
                      selectedFilePath === file.path 
                        ? "bg-indigo-900/30 border border-indigo-850 text-indigo-200" 
                        : file.type === "dir" 
                          ? "text-zinc-400 cursor-default" 
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {file.type === "dir" ? (
                        <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 shrink-0" />
                      )}
                      <span className="truncate">{file.path}</span>
                    </div>
                    {file.type === "file" && (
                      <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 font-semibold">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* active File Content Viewer */}
            <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-850 rounded-2xl flex flex-col h-[520px] overflow-hidden">
              <div className="p-4 border-b border-zinc-850/80 bg-zinc-950/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    {openFile ? openFile.path : "Select a source file to analyze"}
                  </span>
                </div>
                {openFile && (
                  <span className="text-[9px] font-mono uppercase bg-indigo-950 border border-indigo-850 px-2 py-0.5 rounded text-indigo-300 font-bold tracking-widest">
                    Code Preview
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto p-5 bg-zinc-950/90 font-mono text-xs leading-normal scrollbar-thin text-zinc-400">
                {fileContentLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-sans text-xs">Streaming file content securely...</p>
                  </div>
                ) : openFile ? (
                  <pre className="whitespace-pre overflow-x-auto select-text scrollbar-thin">
                    <code>{openFile.content}</code>
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
                    <Code2 className="w-12 h-12 text-zinc-700 animate-pulse" />
                    <p className="text-zinc-500 font-sans text-xs max-w-sm">
                      Select any document from the tree viewer on the left. The full-capacity AI code interpreter will map its context for chat memory.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Live Enterprise PR Pipeline Review Monitor */}
          <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="font-sans font-bold text-white text-base">Real-time PR Deployment Log</h3>
                <p className="text-xs font-sans text-zinc-500 mt-0.5">Scans open branch merge logs for security failures and rollback thresholds.</p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 py-1 px-2 rounded-lg font-semibold tracking-wider uppercase">
                Continuous Monitoring Status
              </span>
            </div>

            <div className="space-y-4">
              {pulls.map((pr) => (
                <div 
                  key={pr.id} 
                  className="p-4 bg-zinc-900/40 border border-zinc-850/80 rounded-xl hover:bg-zinc-900/60 transition-all flex flex-wrap items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="p-2 bg-indigo-950/50 border border-indigo-900 rounded-lg shrink-0 mt-0.5">
                      <GitPullRequest className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-zinc-500 font-mono">PR #{pr.number}</span>
                        <h4 className="text-xs font-sans font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">
                          {pr.title}
                        </h4>
                      </div>
                      <p className="text-zinc-500 text-[11px] font-sans mt-1 line-clamp-1 truncate max-w-2xl">
                        {pr.body}
                      </p>
                      <div className="flex items-center gap-3.5 mt-2 text-[10px] font-mono text-zinc-500">
                        <span>Author: <strong className="font-medium text-zinc-400">{pr.user}</strong></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <span>Created: {new Date(pr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPr(pr)}
                    id={`pr_action_btn_${pr.number}`}
                    className="p-2 px-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 font-sans font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Audit PR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto gap-4">
          <div className="p-4 bg-zinc-950/60 border border-zinc-850/60 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <Github className="w-12 h-12 text-zinc-500" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-white text-xl tracking-tight">Synchronize Your Codebase</h2>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed mt-2">
              Welcome to the Aegis Autonomous AI Engineering Intelligence Suite. Insert a GitHub repository URL above to deploy multi-agent code analysis, real-time PR assessments, codebase-oriented chat, and AI-enabled documentation mapping.
            </p>
          </div>
          <div className="mt-2 text-zinc-500 text-[11px] font-mono flex items-center gap-1.5 justify-center py-1.5 px-3 bg-zinc-950/20 border border-zinc-900 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-600" />
            <span>Works for any public GitHub project, or privately with a token.</span>
          </div>
        </div>
      )}

    </div>
  );
}
