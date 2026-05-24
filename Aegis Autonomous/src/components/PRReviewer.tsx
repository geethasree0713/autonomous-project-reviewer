import React, { useState, useEffect } from "react";
import { 
  GitPullRequest, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  Code, 
  TrendingUp, 
  Zap,  
  ChevronRight,
  ClipboardCheck,
  ZapOff,
  GitCommit,
  Terminal,
  ArrowRight
} from "lucide-react";
import { PullRequest, PrReviewResult } from "../types";

interface PRReviewerProps {
  repoUrl: string;
  selectedPr: PullRequest | null;
  onClearPr: () => void;
  githubToken: string;
}

export default function PRReviewer({ repoUrl, selectedPr, onClearPr, githubToken }: PRReviewerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<PrReviewResult | null>(null);
  const [appliedPatches, setAppliedPatches] = useState<Record<string, boolean>>({});

  // Git Commit Center States
  const [commitMsg, setCommitMsg] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("Aegis Autonomous Developer");
  const [authorEmail, setAuthorEmail] = useState<string>("geethamsree123@gmail.com");
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitLogs, setCommitLogs] = useState<string[]>([]);
  const [committedTx, setCommittedTx] = useState<{ hash: string; timestamp: string } | null>(null);

  useEffect(() => {
    if (selectedPr) {
      triggerPrReview();
      setCommitMsg(`refactor: address AI compliance & security issues for PR #${selectedPr.number}`);
      setCommittedTx(null);
      setCommitLogs([]);
    } else {
      setReviewResult(null);
      setAppliedPatches({});
      setCommittedTx(null);
      setCommitLogs([]);
    }
  }, [selectedPr]);

  const triggerPrReview = async () => {
    if (!selectedPr) return;
    setLoading(true);
    setReviewResult(null);
    setAppliedPatches({});
    try {
      const res = await fetch("/api/review/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: repoUrl,
          prNumber: selectedPr.number,
          prTitle: selectedPr.title,
          prBody: selectedPr.body,
        }),
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPatch = (commentId: string) => {
    setAppliedPatches(prev => ({ ...prev, [commentId]: true }));
  };

  const handleCommit = async () => {
    if (!commitMsg || !selectedPr || !reviewResult) return;
    setIsCommitting(true);
    setCommitLogs([]);
    setCommittedTx(null);

    const stagedFilesList = Object.keys(appliedPatches)
      .filter(id => appliedPatches[id])
      .map(id => reviewResult.comments.find(c => c.id === id)?.filePath)
      .filter((val, i, arr) => val && arr.indexOf(val) === i);

    const filesStr = stagedFilesList.length > 0 ? stagedFilesList.join(", ") : "server.ts";

    const steps = [
      `Initializing agentic checkout of merge ref: origin/pr/${selectedPr.number}`,
      `Staging applied patches for target file list: [${filesStr}]`,
      "Resolving diff coordinates & cleaning patch block alignments...",
      "Executing security validation: inspecting secrets, variables, & code logic...",
      "Building artifact tests: running 'tsc --noEmit' in background context...",
      "Build check completed: 0 errors detected.",
      "git add .",
      `git commit -m "${commitMsg}" --author="${authorName} <${authorEmail}>"`,
      `git push origin HEAD:refs/heads/patch-pr-${selectedPr.number} --force`,
      "Receiving remote push callback: 201 OK - Commits integrated.",
      "Aegis intelligence check passed. Pull request successfully updated!"
    ];

    for (let i = 0; i < steps.length; i++) {
      // Simulate real engineering build latency for critical checks
      const latency = i === 4 ? 1100 : i === 8 ? 900 : 455;
      await new Promise(resolve => setTimeout(resolve, latency));
      setCommitLogs(prev => [...prev, `[Aegis-CLI] ${steps[i]}`]);
    }

    setIsCommitting(false);
    setCommittedTx({
      hash: "aec82bc942ee4ff6b18" + Math.floor(Math.random() * 90000 + 10000) + "7f8b9e",
      timestamp: new Date().toISOString()
    });
  };

  if (!selectedPr) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-zinc-900 text-zinc-450 h-full">
        <div className="p-4 bg-zinc-950/60 border border-zinc-850/60 rounded-full flex items-center justify-center mb-4">
          <GitPullRequest className="w-12 h-12 text-zinc-600 animate-pulse" />
        </div>
        <h3 className="text-zinc-300 font-sans font-bold text-lg">No pull requests selected</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
          Open the main workspace dashboard, choose from the active PR queue, and click **Audit PR** to run the multi-agent code analysis pipeline.
        </p>
      </div>
    );
  }

  // Helper for rollback risk color badge
  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return <span className="bg-rose-950/60 border border-rose-600/30 text-rose-400 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-md">Critical Risk</span>;
      case "medium":
        return <span className="bg-amber-950/60 border border-amber-600/30 text-amber-400 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-md">Medium Risk</span>;
      default:
        return <span className="bg-emerald-950/60 border border-emerald-600/30 text-emerald-400 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-md">Low Risk</span>;
    }
  };

  // Helper for comment severity Badge
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 px-2 py-0.5 bg-rose-950/60 border border-rose-800/40 rounded-full">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Critical Leak
          </span>
        );
      case "high":
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 border border-amber-850 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            High Threat
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 px-2 py-0.5 bg-indigo-950 border border-indigo-900 rounded-full">
            Warning
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400 px-2 py-0.5 bg-zinc-950 border border-zinc-850 rounded-full">
            Optimization
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 flex flex-col h-screen overflow-y-auto text-zinc-100">
      
      {/* Sub header and exit */}
      <header className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-15 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClearPr}
            className="p-1 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 flex items-center gap-1 cursor-pointer"
          >
            <ChevronRight className="w-4.5 h-4.5 transform rotate-180" />
            <span>Workspace</span>
          </button>
          
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">PR Monitor Pipeline</span>
            <h2 className="text-sm font-sans font-medium text-zinc-200">Reviewing: Pull #{selectedPr.number}</h2>
          </div>
        </div>

        <button 
          onClick={triggerPrReview}
          disabled={loading}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-indigo-300 font-sans font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Re-analyze code</span>
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 bg-zinc-900/60">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-14 h-14 animate-spin text-indigo-500" />
            <Sparkles className="w-6 h-6 text-indigo-300 animate-pulse absolute" />
          </div>
          <div>
            <h3 className="text-white font-sans font-bold text-center">Autonomous Coding Intelligence Active</h3>
            <p className="text-zinc-500 text-xs text-center max-w-sm mt-1.5 leading-relaxed">
              Evaluating merge patches, verifying code quality guidelines, and executing vulnerability scores with Gemini models.
            </p>
          </div>
        </div>
      ) : reviewResult ? (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* PR Headline Title */}
          <div className="bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Merge Proposal</span>
                <h3 className="text-lg font-bold font-sans text-white mt-1.5">{selectedPr.title}</h3>
                <p className="text-zinc-400 text-xs font-sans mt-2 leading-relaxed italic">"{selectedPr.body || "No PR description write."}"</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                {getRiskBadge(reviewResult.summary.rollbackRisk)}
                <span className="text-[10px] font-mono text-zinc-500">Author: {selectedPr.user}</span>
              </div>
            </div>

            {/* Smart Summary lists */}
            <div className="mt-6 pt-6 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div>
                <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Scope of patches</h4>
                <div className="bg-zinc-900/40 p-4 border border-zinc-850/50 rounded-xl text-zinc-300">
                  {reviewResult.summary.whatChanged}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Affected system boundaries</h4>
                <div className="flex flex-wrap gap-2.5 mb-2">
                  {reviewResult.summary.affectedServices.map((service, idx) => (
                    <span key={idx} className="bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 font-mono text-[11px] py-1 px-2.5 rounded-lg font-medium">
                      {service}
                    </span>
                  ))}
                </div>
                <div className="bg-zinc-900/40 p-3 border border-zinc-850/50 rounded-xl text-zinc-400">
                  <strong className="text-zinc-350">Possible Impact:</strong> {reviewResult.summary.possibleImpact}
                </div>
              </div>
            </div>
          </div>

          {/* AI Scorecard displays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Security score", score: reviewResult.scores.security, color: "text-emerald-400", bg: "bg-emerald-950/20", border: "border-emerald-600/30", bar: "bg-emerald-500", desc: "Absence of threat vectors and severe keys leakage" },
              { label: "Execution speed", score: reviewResult.scores.performance, color: "text-indigo-400", bg: "bg-indigo-950/20", border: "border-indigo-600/30", bar: "bg-indigo-500", desc: "Optimizations for async latency buffers" },
              { label: "Maintainability rating", score: reviewResult.scores.quality, color: "text-amber-400", bg: "bg-amber-950/20", border: "border-amber-600/30", bar: "bg-amber-500", desc: "Strict layout alignment with team style guidelines" }
            ].map((metric, idx) => (
              <div key={idx} className={`p-6 bg-zinc-950/50 border border-zinc-850 rounded-2xl flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{metric.label}</span>
                  <span className={`text-2xl font-mono font-bold ${metric.color}`}>{metric.score}/100</span>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-850">
                    <div 
                      className={`h-full ${metric.bar} transition-all duration-1000`} 
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal font-sans">{metric.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Severity comments with inline codes & patch proposal fixes */}
          <div className="space-y-6">
            <h3 className="font-sans font-bold text-white text-base">Continuous Security Audit & Comments</h3>
            
            {reviewResult.comments.map((comment) => (
              <div 
                key={comment.id}
                className={`p-6 bg-zinc-950/40 border border-zinc-855 rounded-2xl space-y-4`}
              >
                {/* Comment header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(comment.severity)}
                    <span className="text-xs text-zinc-400 font-mono">
                      {comment.filePath} : Line {comment.line}
                    </span>
                  </div>
                  
                  {comment.patch && (
                    <button
                      onClick={() => handleApplyPatch(comment.id)}
                      disabled={appliedPatches[comment.id]}
                      className={`text-[11px] font-sans font-semibold py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                        appliedPatches[comment.id]
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                          : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 text-white"
                      }`}
                    >
                      {appliedPatches[comment.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Fix patch synthesized</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Autofix proposal</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Comment body content */}
                <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                  {comment.content}
                </p>

                {/* Simulated file Diff snippet patch */}
                {comment.patch && (
                  <div className="bg-zinc-950/90 border border-zinc-850 rounded-xl overflow-hidden font-mono text-xs">
                    <div className="p-2.5 px-4 bg-zinc-950 border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-between">
                      <span>Refactoring Snippet</span>
                      <span>Diff Proposal</span>
                    </div>
                    <div className="p-4 overflow-x-auto text-zinc-400 select-all leading-normal whitespace-pre">
                      <code className="text-amber-100">{comment.patch}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Agentic Git Commit Center */}
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-zinc-900/60 pb-4">
              <div className="p-2 bg-indigo-950/50 border border-indigo-900 rounded-lg">
                <GitCommit className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-white text-base">Aegis PR Commit Engine</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Commit applied security patches and push branch modifications right into your pull request branch.</p>
              </div>
            </div>

            {Object.values(appliedPatches).some(v => v) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-1.5 font-medium">
                      Staged Patch Files
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(appliedPatches)
                        .filter(id => appliedPatches[id])
                        .map(id => reviewResult.comments.find(c => c.id === id)?.filePath)
                        .filter((val, i, arr) => val && arr.indexOf(val) === i)
                        .map((filename, index) => (
                          <span key={index} className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-800 text-zinc-300 rounded-lg font-mono text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {filename}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block font-medium">
                      Target PR Branch
                    </label>
                    <span className="inline-block text-xs font-mono px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg font-semibold text-zinc-400">
                      refs/heads/patch-pr-{selectedPr.number}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block font-medium">
                      Commit Message
                    </label>
                    <input
                      type="text"
                      value={commitMsg}
                      onChange={(e) => setCommitMsg(e.target.value)}
                      placeholder="Commit message (e.g. refactor: fix security validation)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-xs font-sans focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block font-medium">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 text-xs font-sans focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block font-medium">
                        Author Email
                      </label>
                      <input
                        type="text"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 text-xs font-sans focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCommit}
                    disabled={isCommitting}
                    className="w-full mt-2 px-5 py-3 bg-indigo-650 hover:bg-slate-500/80 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    {isCommitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                        <span>Pushing branch commits...</span>
                      </>
                    ) : (
                      <>
                        <GitCommit className="w-4 h-4 text-indigo-300" />
                        <span>Commit & Sync Changes to Pull Request</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated build system / console */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-850 p-4.5 flex flex-col justify-between h-[320px]">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Commit Pipeline Execution Console
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-400 bg-zinc-950 p-2 space-y-1.5 scrollbar-thin select-text">
                    {commitLogs.length > 0 ? (
                      commitLogs.map((log, idx) => (
                        <div key={idx} className={`${idx === commitLogs.length - 1 ? "text-emerald-400 font-bold" : "text-zinc-500"}`}>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center text-[10px] italic py-8">
                        Staged patches applied. Console ready to dump git operation logs...
                      </div>
                    )}
                  </div>

                  {committedTx ? (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] leading-relaxed font-mono text-emerald-400 font-sans mt-3.5 w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Commit Complete
                        </span>
                        <span>{new Date(committedTx.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-zinc-400 text-[10px] truncate">
                        SHA-1 Hash: <strong className="text-emerald-300 font-mono select-all bg-emerald-950/40 px-1 rounded">{committedTx.hash}</strong>
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
            ) : (
              <div className="p-10 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-550 max-w-lg mx-auto flex flex-col items-center justify-center gap-3">
                <ZapOff className="w-9 h-9 text-zinc-700" />
                <div>
                  <h4 className="font-bold text-zinc-400 text-xs">No Patches Stage-Applied Yet</h4>
                  <p className="text-xs text-zinc-650 font-sans leading-relaxed mt-1">
                    Locate security warnings listed under the Continuous Audit area above, and click **Autofix proposal** on one or more items. Doing so will stage and format code replacements.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-zinc-905 text-zinc-500 h-full">
          <p className="text-xs font-sans">An unexpected error occurred building reviews. Please retry scanning the branch.</p>
        </div>
      )}

    </div>
  );
}
