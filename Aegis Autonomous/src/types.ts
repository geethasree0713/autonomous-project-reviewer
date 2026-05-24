export interface RepoInfo {
  owner: string;
  name: string;
  description: string;
  stars: number;
  languages: string[];
  defaultBranch: string;
}

export interface RepoFile {
  path: string;
  name: string;
  type: "file" | "dir";
  size: number;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  user: string;
  htmlUrl: string;
  state: "open" | "closed";
  createdAt: string;
}

export interface PrReviewResult {
  prNumber: number;
  summary: {
    whatChanged: string;
    possibleImpact: string;
    affectedServices: string[];
    rollbackRisk: "Low" | "Medium" | "High";
  };
  comments: {
    id: string;
    filePath: string;
    line: number;
    content: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    patch?: string;
  }[];
  scores: {
    security: number;
    performance: number;
    quality: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface RiskIssue {
  id: string;
  title: string;
  category: "Security" | "Deployment" | "Maintainability";
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
}

export interface RiskScores {
  securityScore: number;
  deploymentRisk: number;
  maintainabilityScore: number;
  issues: RiskIssue[];
}

export interface ArchNode {
  id: string;
  name: string;
  type: "entry" | "module" | "database" | "service" | "config" | "api" | "view";
  size: number;
  isRisky: boolean;
  x?: number;
  y?: number;
}

export interface ArchLink {
  source: string;
  target: string;
  type: "calls" | "imports" | "depends";
}

export interface ArchitectureInfo {
  nodes: ArchNode[];
  links: ArchLink[];
}
