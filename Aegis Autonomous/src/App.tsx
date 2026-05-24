import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import PRReviewer from "./components/PRReviewer";
import RepoChat from "./components/RepoChat";
import RiskCenter from "./components/RiskCenter";
import ArchVisualizer from "./components/ArchVisualizer";
import ReadmeGenerator from "./components/ReadmeGenerator";
import { RepoInfo, RepoFile, PullRequest } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [repoUrl, setRepoUrl] = useState<string>("https://github.com/facebook/react");
  const [githubToken, setGithubToken] = useState<string>("");
  
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [fileTree, setFileTree] = useState<RepoFile[]>([]);
  const [pulls, setPulls] = useState<PullRequest[]>([]);
  const [selectedPr, setSelectedPr] = useState<PullRequest | null>(null);
  const [openFile, setOpenFile] = useState<{ path: string; content: string } | null>(null);
  
  const [readmeMarkdown, setReadmeMarkdown] = useState<string>("");
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleScan = async () => {
    if (!repoUrl) return;
    setIsLoading(true);
    setOpenFile(null);
    setReadmeMarkdown("");
    try {
      // 1. Fetch Repository Base Info
      const infoRes = await fetch("/api/github/repo-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl, githubToken }),
      });
      const infoData = await infoRes.json();
      setRepoInfo(infoData);

      // 2. Fetch File Tree
      const treeRes = await fetch("/api/github/repo-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl, githubToken }),
      });
      const treeData = await treeRes.json();
      setFileTree(treeData.tree || []);

      // 3. Fetch Pull Requests
      const pullsRes = await fetch("/api/github/pulls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl, githubToken }),
      });
      const pullsData = await pullsRes.json();
      setPulls(pullsData.pulls || []);

    } catch (error) {
      console.error("Scanning process rejected: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPr = (pr: PullRequest) => {
    setSelectedPr(pr);
    setActiveTab("pr");
  };

  const handleClearPr = () => {
    setSelectedPr(null);
    setActiveTab("dashboard");
  };

  const handleOpenFile = (file: RepoFile, content: string) => {
    setOpenFile({ path: file.path, content });
  };

  const handleGenerateReadme = async () => {
    if (!repoUrl) return;
    setReadmeLoading(true);
    setActiveTab("readme");
    try {
      // Find package.json if it exists to help Gemini read dependencies
      const packageJsonFile = fileTree.find(f => f.path.endsWith("package.json"));
      let mainFileContent = "";
      if (packageJsonFile) {
        const fileContentRes = await fetch("/api/github/file-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: repoUrl, filePath: packageJsonFile.path, githubToken }),
        });
        const packageJsonData = await fileContentRes.json();
        mainFileContent = packageJsonData.content || "";
      }

      const res = await fetch("/api/create-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: repoUrl,
          fileTree,
          mainFileContent,
        }),
      });
      const data = await res.json();
      setReadmeMarkdown(data.readme || "");
    } catch (err) {
      console.error(err);
    } finally {
      setReadmeLoading(false);
    }
  };

  // Switch workspace renderer
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            repoInfo={repoInfo}
            fileTree={fileTree}
            pulls={pulls}
            isLoading={isLoading}
            onScan={handleScan}
            onSelectPr={handleSelectPr}
            onOpenFile={handleOpenFile}
            openFile={openFile}
            onCreateReadme={handleGenerateReadme}
          />
        );
      case "pr":
        return (
          <PRReviewer
            repoUrl={repoUrl}
            selectedPr={selectedPr}
            onClearPr={handleClearPr}
            githubToken={githubToken}
          />
        );
      case "chat":
        return (
          <RepoChat
            repoUrl={repoUrl}
            fileTree={fileTree}
            openFile={openFile}
          />
        );
      case "risk":
        return <RiskCenter repoUrl={repoUrl} fileTree={fileTree} />;
      case "architecture":
        return <ArchVisualizer repoUrl={repoUrl} fileTree={fileTree} />;
      case "readme":
        return (
          <ReadmeGenerator
            repoUrl={repoUrl}
            fileTree={fileTree}
            onSubmitReadme={handleGenerateReadme}
            readmeMarkdown={readmeMarkdown}
            readmeLoading={readmeLoading}
          />
        );
      default:
        return (
          <div className="flex-grow p-8 bg-zinc-900 text-white">
            Workspace under construction.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans antialiased overflow-hidden">
      {/* Dock Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        repoName={repoInfo?.name || ""}
        repoOwner={repoInfo?.owner || ""}
      />

      {/* Main active platform view */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
