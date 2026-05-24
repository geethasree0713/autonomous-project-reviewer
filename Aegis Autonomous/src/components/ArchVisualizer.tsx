import React, { useState, useEffect } from "react";
import { Network, Loader2, GitCommit, ShieldAlert, Cpu, AlertCircle, RefreshCw, Info } from "lucide-react";
import { RepoFile, ArchNode, ArchLink, ArchitectureInfo } from "../types";

interface ArchVisualizerProps {
  repoUrl: string;
  fileTree: RepoFile[];
}

export default function ArchVisualizer({ repoUrl, fileTree }: ArchVisualizerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ArchitectureInfo | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    fetchArchitecture();
  }, [repoUrl]);

  const fetchArchitecture = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl, fileTree }),
      });
      const resData = await res.json();
      
      // Calculate dynamic positions for circles to keep the UI beautiful
      const nodes = resData.nodes || [];
      const links = resData.links || [];
      const width = 800;
      const height = 450;
      const centerX = width / 2;
      const centerY = height / 2;

      // Arrange nodes in concentric rings or simple layout based on types to look organic & architectural
      const positionedNodes = nodes.map((node: ArchNode, index: number) => {
        let x = centerX;
        let y = centerY;

        if (node.type === "entry") {
          x = centerX - 250;
          y = centerY;
        } else if (node.type === "database") {
          x = centerX + 250;
          y = centerY;
        } else if (node.type === "api") {
          x = centerX + 100;
          y = centerY - 100;
        } else if (node.type === "view") {
          x = centerX - 100;
          y = centerY + 100;
        } else {
          // Circular distribution around center for other nodes
          const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2;
          const radius = 160 + (index % 2) * 40;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }

        return { ...node, x, y };
      });

      setData({ nodes: positionedNodes, links });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (type: string, isRisky: boolean) => {
    if (isRisky) return "fill-rose-500 stroke-rose-400";
    switch (type) {
      case "entry":
        return "fill-indigo-500 stroke-indigo-400";
      case "database":
        return "fill-amber-500 stroke-amber-400";
      case "api":
        return "fill-cyan-500 stroke-cyan-400";
      case "view":
        return "fill-emerald-500 stroke-emerald-400";
      case "service":
        return "fill-purple-500 stroke-purple-400";
      default:
        return "fill-zinc-650 stroke-zinc-500";
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 overflow-y-auto flex flex-col h-screen text-zinc-100">
      
      <header className="p-6 bg-zinc-950/40 border-b border-zinc-850 shrink-0 flex items-center justify-between sticky top-0 bg-zinc-900/40 backdrop-blur z-20">
        <div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">Component Dependency Mapper</span>
          <h2 className="text-sm font-sans font-medium text-zinc-200">Architecture Visualizer</h2>
        </div>
        <button 
          onClick={fetchArchitecture}
          disabled={loading}
          className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold font-mono text-zinc-400 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Redraw Boundaries</span>
        </button>
      </header>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 gap-3 bg-zinc-900">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="text-zinc-500 font-sans text-xs">Computing topological vectors and node relationship states...</p>
        </div>
      ) : data ? (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SVG Interactive Drawing Board */}
            <div className="lg:col-span-8 bg-zinc-950/60 border border-zinc-850 rounded-2xl p-6 flex flex-col relative h-[520px] justify-center items-center overflow-auto scrollbar-none">
              
              <div className="absolute top-5 left-5 text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
                Network topology graph (Interactive nodes)
              </div>

              {/* Dynamic Legend */}
              <div className="absolute bottom-5 left-5 flex-wrap flex gap-3 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-900 py-1.5 px-3 rounded-xl">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Entry</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Views</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" /> APIs</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Database</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" /> Threat alert</span>
              </div>

              {/* Custom SVG canvas */}
              <svg 
                viewBox="0 0 800 450" 
                className="w-full h-full max-h-[440px] select-none"
              >
                {/* Arrow markers */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f3f46" />
                  </marker>
                  <marker id="arrow-active" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                </defs>

                {/* Connections Lines */}
                {data.links.map((link, idx) => {
                  const sourceNode = data.nodes.find(n => n.id === link.source);
                  const targetNode = data.nodes.find(n => n.id === link.target);
                  if (!sourceNode || !targetNode) return null;

                  const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;

                  return (
                    <g key={idx}>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={isHighlighted ? "#6366f1" : "#27272a"}
                        strokeWidth={isHighlighted ? "2.5" : "1.5"}
                        strokeDasharray={link.type === "depends" ? "5, 5" : undefined}
                        className="transition-all duration-350"
                        markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow)"}
                      />
                      {/* Flowing animated light dots on active lines */}
                      {isHighlighted && (
                        <circle r="3" fill="#818cf8" className="animate-ping">
                          <animateMotion 
                            path={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`} 
                            dur="2.5s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Nodes Circles and Labels */}
                {data.nodes.map((node) => {
                  const isHovered = hoveredNode === node.id;
                  const circleRadius = node.size ? node.size / 4 + 4 : 15;

                  return (
                    <g 
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer group"
                    >
                      {/* Aura halo for risky files */}
                      {node.isRisky && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={circleRadius + 8}
                          className="fill-rose-500/10 stroke-rose-400/25 stroke-[1] animate-pulse"
                        />
                      )}

                      {/* Hover ring shadow halo */}
                      {isHovered && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={circleRadius + 5}
                          className="fill-transparent stroke-indigo-500/20 stroke-[3] transition-all"
                        />
                      )}

                      {/* Primary vector center */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={circleRadius}
                        className={`${getNodeColor(node.type, node.isRisky)} stroke-[1.5] transition-all duration-300`}
                      />

                      {/* Inner point for visual detail */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="3.5"
                        fill="#09090b"
                      />

                      {/* Custom text label with contrasting outline shadow */}
                      <text
                        x={node.x}
                        y={node.y! + circleRadius + 15}
                        textAnchor="middle"
                        className={`text-[10px] font-mono select-none pointer-events-none transition-colors ${
                          isHovered ? "fill-zinc-100 font-bold" : "fill-zinc-400"
                        }`}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}

              </svg>
            </div>

            {/* Explanatory sidebar detailing module relations */}
            <div className="lg:col-span-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-6 h-[520px] overflow-hidden flex flex-col justify-between">
              <div className="space-y-6 flex-1 overflow-y-auto scrollbar-thin">
                <div>
                  <h3 className="font-sans font-bold text-white text-base">Node Properties Panel</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    Hover on topological network intersections on the left to pull codebase context summary.
                  </p>
                </div>

                {hoveredNode ? (
                  (() => {
                    const node = data.nodes.find(n => n.id === hoveredNode);
                    if (!node) return null;
                    return (
                      <div className="p-4.5 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-mono font-bold text-zinc-200 truncate">{node.name}</span>
                        </div>

                        <div className="text-xs space-y-1.5 font-sans leading-normal text-zinc-400">
                          <p>
                            <span className="font-mono text-zinc-500 uppercase text-[9px] tracking-wider block">Element classification</span>
                            <span className="font-semibold text-zinc-300 capitalize">{node.type} Module</span>
                          </p>
                          <p>
                            <span className="font-mono text-zinc-500 uppercase text-[9px] tracking-wider block">Node boundary reference ID</span>
                            <span className="text-zinc-300 font-mono text-[11px] block truncate">{node.id}</span>
                          </p>
                          <p>
                            <span className="font-mono text-zinc-500 uppercase text-[9px] tracking-wider block">Compliance Rating</span>
                            <span className={`font-semibold ${node.isRisky ? "text-rose-400" : "text-emerald-400"}`}>
                              {node.isRisky ? "Threat Detected" : "Audit Clear"}
                            </span>
                          </p>
                        </div>

                        {node.isRisky && (
                          <div className="p-3 bg-rose-950/20 border border-rose-950 text-[11px] font-sans rounded-xl text-rose-400 leading-normal flex gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              This node represents severe potential code execution smells or vulnerability risks. Restructure parameters immediately.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 space-y-2">
                    <AlertCircle className="w-10 h-10 text-zinc-700 animate-pulse mx-auto" />
                    <p className="text-xs font-sans">
                      No intersecting component highlighted. Focus cursor over a circle vector to see structural dependencies description.
                    </p>
                  </div>
                )}
              </div>

              {/* Extra micro tutorial note */}
              <div className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 leading-normal flex gap-2 pt-3 shrink-0">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="font-sans">
                  Graph boundaries are formed autonomously by compiling imports statements, call traces, and directories hierarchies of your package.
                </p>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-zinc-500 p-8">
          <p className="text-xs">Select workspace repo to load visual graph coordinates.</p>
        </div>
      )}

    </div>
  );
}
