import React, { useState } from "react";
import { 
  BookOpen, 
  Loader2, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  BookMarked,
  Info
} from "lucide-react";
import { RepoFile } from "../types";

interface ReadmeGeneratorProps {
  repoUrl: string;
  fileTree: RepoFile[];
  onSubmitReadme: () => void;
  readmeMarkdown: string;
  readmeLoading: boolean;
}

export default function ReadmeGenerator({
  repoUrl,
  fileTree,
  onSubmitReadme,
  readmeMarkdown,
  readmeLoading,
}: ReadmeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"formatted" | "code">("formatted");

  const handleCopy = () => {
    if (!readmeMarkdown) return;
    navigator.clipboard.writeText(readmeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!readmeMarkdown) return;
    const blob = new Blob([readmeMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-zinc-900 overflow-y-auto flex flex-col h-screen text-zinc-100">
      
      <header className="p-6 bg-zinc-950/40 border-b border-zinc-800 shrink-0 sticky top-0 bg-zinc-900/40 backdrop-blur z-20">
        <div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">Documentation Synthesis Suite</span>
          <h2 className="text-sm font-sans font-medium text-zinc-200">README Generator</h2>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        
        {/* Intro banner describing documentation capabilities */}
        <div className="bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-white text-base">Generate GitHub repository documentation</h3>
            <p className="text-xs font-sans text-zinc-500 max-w-2xl leading-relaxed">
              Compile repository structures, configuration parameters, and clean code instructions into a professional executive-ready README file analyzed via multi-agent synthesis.
            </p>
          </div>
          
          <button
            onClick={onSubmitReadme}
            disabled={readmeLoading || !repoUrl}
            id="create_readme_action_btn"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl text-white font-sans font-semibold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-lg hover:shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
          >
            {readmeLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                <span>Synthesizing description...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Create Documentation</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Display of output README */}
        {readmeLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/10 min-h-[400px]">
            <Loader2 className="w-14 h-14 animate-spin text-indigo-500" />
            <p className="text-zinc-500 font-sans text-xs mt-3.5 max-w-md text-center leading-relaxed">
              Evaluating directory tree, recognizing project classifications, parsing main frameworks architectures, and formatting markdown elements...
            </p>
          </div>
        ) : readmeMarkdown ? (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl overflow-hidden flex flex-col flex-grow min-h-[480px]">
            
            {/* Header tab controller */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-850/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4.5 h-4.5 text-indigo-400" />
                <span className="text-xs font-mono font-medium text-zinc-300">README.md Output</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg flex items-center shrink-0">
                  <button
                    onClick={() => setPreviewTab("formatted")}
                    className={`px-3 py-1 text-[11px] font-sans font-semibold rounded ${
                      previewTab === "formatted" ? "bg-zinc-850 text-white" : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    Formatted Document
                  </button>
                  <button
                    onClick={() => setPreviewTab("code")}
                    className={`px-3 py-1 text-[11px] font-sans font-semibold rounded ${
                      previewTab === "code" ? "bg-zinc-850 text-white" : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    Raw Markdown
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleDownload}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Readme rendering viewport */}
            <div className="flex-1 p-6 overflow-auto bg-zinc-950 font-sans text-sm leading-relaxed scrollbar-thin select-text">
              {previewTab === "formatted" ? (
                <div className="markdown-body text-zinc-300 space-y-6 max-w-4xl mx-auto py-4 select-text">
                  {/* Clean custom CSS styling fallback mapping markdown elements neatly */}
                  {readmeMarkdown.split("\n\n").map((para, index) => {
                    const trimmed = para.trim();
                    if (trimmed.startsWith("# ")) {
                      return <h1 key={index} className="text-3xl font-bold text-white border-b border-zinc-850 pb-3 mt-8 font-sans tracking-tight">{trimmed.replace("# ", "")}</h1>;
                    }
                    if (trimmed.startsWith("## ")) {
                      return <h2 key={index} className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-900 pb-1.5 font-sans tracking-tight">{trimmed.replace("## ", "")}</h2>;
                    }
                    if (trimmed.startsWith("### ")) {
                      return <h3 key={index} className="text-base font-bold text-indigo-300 mt-6 font-sans tracking-tight">{trimmed.replace("### ", "")}</h3>;
                    }
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                      return (
                        <ul key={index} className="list-disc list-inside space-y-1.5 text-zinc-400 pl-4">
                          {trimmed.split("\n").map((line, lidx) => (
                            <li key={lidx}>{line.replace(/^[-*]\s+/, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (trimmed.startsWith("```")) {
                      const lines = trimmed.split("\n");
                      const codeLines = lines.slice(1, -1).join("\n");
                      return (
                        <pre key={index} className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl font-mono text-xs overflow-x-auto text-zinc-300 my-4">
                          <code>{codeLines}</code>
                        </pre>
                      );
                    }
                    return <p key={index} className="text-zinc-400 leading-relaxed font-sans">{trimmed}</p>;
                  })}
                </div>
              ) : (
                <pre className="whitespace-pre overflow-x-auto font-mono text-xs text-zinc-400 scrollbar-thin max-w-5xl mx-auto leading-normal">
                  <code>{readmeMarkdown}</code>
                </pre>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-650 min-h-[360px] gap-4">
            <BookOpen className="w-14 h-14 text-zinc-700 animate-pulse" />
            <div>
              <h4 className="text-zinc-350 font-sans font-bold text-sm">System Ready for Compilation</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed mt-1.5">
                Ensure a repository is linked in your **Core Workspace** dashboard, then trigger documentation synthesis to auto-generate markdown files.
              </p>
            </div>
            <div className="p-3 bg-zinc-950/20 border border-zinc-900 rounded-xl max-w-md text-[11px] font-mono leading-normal text-zinc-550 flex gap-2 pt-2.5">
              <Info className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>We compile your source files metadata trees & configurations to draft a corporate-grade deploy manual.</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
