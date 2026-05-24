import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Terminal, 
  User, 
  Cpu, 
  Loader2, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Trash
} from "lucide-react";
import { ChatMessage, RepoFile } from "../types";

interface RepoChatProps {
  repoUrl: string;
  fileTree: RepoFile[];
  openFile: { path: string; content: string } | null;
}

export default function RepoChat({ repoUrl, fileTree, openFile }: RepoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [learningRules, setLearningRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested pre-populated prompt templates
  const suggestions = [
    { text: "Where is authentication handled?", desc: "Traces login boundary scopes" },
    { text: "Which API causes highest latency?", desc: "Pinpoints serialization bottlenecks" },
    { text: "Explain this service architecture.", desc: "Summarize module relations" },
    { text: "Enforce strict camelCase style checks?", desc: "Add rules to Team Learning Engine" }
  ];

  useEffect(() => {
    // Scroll chat console
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchLearningRules();
  }, []);

  const fetchLearningRules = async () => {
    try {
      const res = await fetch("/api/learning/rules");
      const data = await res.json();
      setLearningRules(data.rules || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          repoUrl,
          fileTree,
          openFile
        }),
      });
      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: "ast_" + Date.now(),
        role: "assistant",
        text: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.trim()) return;
    try {
      const res = await fetch("/api/learning/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule: newRule }),
      });
      const data = await res.json();
      if (data.success) {
        setLearningRules(data.rules);
        setNewRule("");
        
        // Add fake agent system message acknowledging rules injection
        const noteMsg: ChatMessage = {
          id: "sys_" + Date.now(),
          role: "assistant",
          text: `🚨 **Team Learning Engine Synced**: I have updated the corporate memory store with your style preference: "${newRule.trim()}". Subsequent pull request reviews will systematically check code structures and flag style violations against this preference!`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, noteMsg]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRule = async (idx: number) => {
    try {
      const res = await fetch("/api/learning/rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: idx }),
      });
      const data = await res.json();
      if (data.success) {
        setLearningRules(data.rules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 flex flex-col md:flex-row h-screen overflow-hidden text-zinc-100">
      
      {/* Centere code conversational chat window */}
      <div className="flex-1 flex flex-col h-full border-r border-zinc-800/60 pb-6">
        <header className="p-6 bg-zinc-950/40 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">Interactive Terminal</span>
            <h2 className="text-sm font-sans font-medium text-zinc-200">RAG codebase Memory Chat</h2>
          </div>
          {openFile && (
            <div className="text-[11px] font-mono border border-indigo-900 bg-indigo-950/30 text-indigo-300 py-1.5 px-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>Context: {openFile.path.split("/").pop()}</span>
            </div>
          )}
        </header>

        {/* Conversation flow */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center p-8 max-w-xl mx-auto text-center gap-6">
              <div className="p-4 bg-zinc-950/30 border border-zinc-850 rounded-2xl">
                <Terminal className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-zinc-300">Autopilot Repository Console</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                  Query the AI about specific directories, API latency bounds, DB relationships, mock frameworks, or custom-programmed requirements.
                </p>
              </div>

              {/* clickable suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 w-full">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug.text)}
                    className="p-3.5 bg-zinc-950/40 border border-zinc-850 hover:border-indigo-500/40 text-left rounded-xl hover:bg-zinc-950 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-sans font-medium text-zinc-300 group-hover:text-indigo-400 transition-colors block">{sug.text}</span>
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">{sug.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="p-2 bg-indigo-950 border border-indigo-900 rounded-xl">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    
                    <div className={`p-4.5 rounded-2xl max-w-xl border leading-relaxed text-xs font-sans ${
                      isUser
                        ? "bg-indigo-600/15 border-indigo-500/25 text-indigo-100"
                        : "bg-zinc-950/50 border-zinc-850 text-zinc-300"
                    }`}>
                      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 mb-2.5 pb-2 border-b border-zinc-900">
                        <span>{isUser ? "You" : "Aegis AI Auditor"}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-line select-text">
                        {msg.text}
                      </div>
                    </div>

                    {isUser && (
                      <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                  </div>
                );
              })}
              {sending && (
                <div className="flex items-start gap-4 justify-start">
                  <div className="p-2 bg-indigo-950 border border-indigo-900 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 text-xs font-sans italic text-zinc-500">
                    AI Senior reviewed codebase memory trees...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="px-6 shrink-0 mt-auto">
          <div className="max-w-4xl mx-auto flex items-center gap-2.5 bg-zinc-950 border border-zinc-850 p-2.5 rounded-2xl relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              placeholder="Ask anything about the codebase authentication, API endpoints..."
              id="chat_input_text"
              className="flex-grow bg-transparent border-none text-xs text-zinc-350 focus:outline-none px-3.5"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={sending || !inputText.trim()}
              id="send_chat_button"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-500 text-white rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: TEAM LEARNING ENGINE panels */}
      <div className="w-full md:w-80 bg-zinc-950/20 flex flex-col h-full border-t md:border-t-0 border-zinc-800 p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-sans font-bold text-white text-sm">Team Learning Engine</h3>
          </div>
          <p className="text-[11px] font-sans text-zinc-500 leading-normal mt-1.5">
            AI remembers team coding styles, recurring warnings, preferred guidelines, and enforces them actively in pull request audits.
          </p>
        </div>

        {/* Custom rules input form */}
        <div className="space-y-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
            Inject Style preference
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Prefer camelCase API rules..."
              id="learning_rule_input"
              className="flex-1 bg-zinc-900 border border-zinc-850 px-2.5 py-1.5 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
            <button
              onClick={handleAddRule}
              id="add_learning_rule_button"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Existing rules list */}
        <div className="flex-grow flex flex-col min-h-0 bg-zinc-950/70 border border-zinc-850 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2 mb-3">
            <span>Corporate Memories ({learningRules.length})</span>
            <RefreshCw className="w-3.5 h-3.5 text-zinc-600 cursor-pointer hover:text-zinc-400" onClick={fetchLearningRules} />
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 scrollbar-thin">
            {learningRules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-[11px] text-zinc-400 relative group flex gap-2 justify-between">
                <span className="leading-relaxed">{rule}</span>
                <button
                  onClick={() => handleDeleteRule(idx)}
                  className="text-zinc-600 hover:text-rose-400 h-fit transition-colors shrink-0 pt-0.5 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
