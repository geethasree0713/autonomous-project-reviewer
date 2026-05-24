import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  AlertOctagon, 
  Info, 
  ExternalLink,
  Lock,
  ArrowRight
} from "lucide-react";
import { RepoFile, RiskIssue, RiskScores } from "../types";

interface RiskCenterProps {
  repoUrl: string;
  fileTree: RepoFile[];
}

export default function RiskCenter({ repoUrl, fileTree }: RiskCenterProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [riskData, setRiskData] = useState<RiskScores | null>(null);

  useEffect(() => {
    fetchRiskAnalysis();
  }, [repoUrl]);

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/risk-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl, fileTree }),
      });
      const data = await res.json();
      setRiskData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "text-rose-450 border-rose-600/30 bg-rose-950/20";
      case "high":
        return "text-amber-400 border-amber-500/30 bg-amber-950/20";
      case "medium":
        return "text-indigo-400 border-indigo-500/30 bg-indigo-950/10";
      default:
        return "text-zinc-400 border-zinc-700 bg-zinc-950/40";
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 overflow-y-auto flex flex-col h-screen text-zinc-100">
      
      <header className="p-6 bg-zinc-950/40 border-b border-zinc-800 shrink-0 flex items-center justify-between sticky top-0 bg-zinc-900/40 backdrop-blur z-20">
        <div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">Vulnerability scorecards</span>
          <h2 className="text-sm font-sans font-medium text-zinc-200">Enterprise Risk Center</h2>
        </div>
        <button 
          onClick={fetchRiskAnalysis}
          disabled={loading}
          className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>Recheck Compliance</span>
        </button>
      </header>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 gap-3 bg-zinc-900">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="text-zinc-500 font-sans text-xs">Generating autonomous compliance scorecards...</p>
        </div>
      ) : riskData ? (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Risk Scores Grid with circular radial gauges simulated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Security Risk gauge banner */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-between relative overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Security Score</span>
                <span className="text-xs font-mono font-semibold text-emerald-400">SOC2 COMPLIANT</span>
              </div>
              
              <div className="my-6 relative flex items-center justify-center">
                {/* Simulated circle indicator */}
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-zinc-805" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" className="stroke-emerald-500" strokeWidth="8" fill="transparent" 
                          strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * riskData.securityScore) / 100} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-mono font-bold text-white">{riskData.securityScore}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Safe Index</span>
                </div>
              </div>
              
              <p className="text-[11px] font-sans text-zinc-400 text-center leading-relaxed max-w-xs">
                Measures code robustness against credential leaks, dependency vulnerabilities, and private domain isolation.
              </p>
            </div>

            {/* Deployment Risk Scorecard */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-between relative overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Deployment Risk</span>
                <span className="text-xs font-mono font-semibold text-amber-500">RELEASE WARNING</span>
              </div>

              <div className="my-6 relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-zinc-805" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" className="stroke-amber-500" strokeWidth="8" fill="transparent" 
                          strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * riskData.deploymentRisk) / 100} />
                </svg>
                <div className="absolute flex flex-col items-center font-mono">
                  <span className="text-3xl font-bold text-white">{riskData.deploymentRisk}%</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Risk bounds</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-zinc-400 text-center leading-relaxed max-w-xs">
                Evaluates failure probability inside deployment pipelines based on structural change scopes and missing unit-tests.
              </p>
            </div>

            {/* Maintainability Index Card */}
            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-between relative overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Maintainability</span>
                <span className="text-xs font-mono font-semibold text-indigo-400">HEALTHY RATING</span>
              </div>

              <div className="my-6 relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-zinc-805" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" className="stroke-indigo-500" strokeWidth="8" fill="transparent" 
                          strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * riskData.maintainabilityScore) / 100} />
                </svg>
                <div className="absolute flex flex-col items-center font-mono">
                  <span className="text-3xl font-bold text-white">{riskData.maintainabilityScore}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Quality grade</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-zinc-400 text-center leading-relaxed max-w-xs">
                Audits structural readability, functional components partitioning, style sheet reuse, and code smell levels.
              </p>
            </div>

          </div>

          {/* Table list of detected threats */}
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-850 bg-zinc-950/60 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-white text-base">Continuous Security Audit & Expose Scans</h3>
                <p className="text-xs font-sans text-zinc-500 mt-1">Autonomous checks mapped dynamically relative to repository tree assets.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-amber-500">
                {riskData.issues.length} Risks Flagged
              </span>
            </div>

            <div className="divide-y divide-zinc-900">
              {riskData.issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-zinc-950/20 transition-all flex flex-col md:flex-row gap-6 justify-between items-start">
                  
                  <div className="space-y-4 max-w-4xl flex-1">
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <span className={`text-[10px] font-mono uppercase font-bold py-1 px-3 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                        {issue.severity} Threat
                      </span>
                      <span className="text-xs font-mono text-zinc-500">{issue.category} Index</span>
                      <span className="text-zinc-650 font-mono text-xs">•</span>
                      <h4 className="text-sm font-sans font-semibold text-zinc-200">{issue.title}</h4>
                    </div>

                    <div className="text-xs leading-relaxed space-y-2">
                      <p className="text-zinc-400">
                        <strong className="text-zinc-350 font-medium">Explanatory Audit:</strong> {issue.description}
                      </p>
                      
                      <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl text-zinc-400 font-mono text-[11px] flex gap-2.5">
                        <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-400 font-medium">Mitigation Protocol:</strong> {issue.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold mt-1">
                    System Node: {issue.id}
                  </span>

                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center p-8 text-zinc-500">
          <p className="text-xs">No risk parameters loaded. Select repository workspace and analyze.</p>
        </div>
      )}

    </div>
  );
}
