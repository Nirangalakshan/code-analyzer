"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  ArrowRight,
  Code,
  LogOut,
  User,
  Network,
  FileText,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Mermaid from "@/components/Mermaid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisResult {
  summary: string;
  documentation: string;
  mermaid: string;
  analysis: {
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
  }[];
  storagePath?: string;
  timestamp?: string;
}

interface HistoryItem {
  id: string;
  repoName: string;
  timestamp: string;
  summary: string;
  path: string;
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"docs" | "diagram" | "audit">(
    "docs",
  );
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchHistory();
    }
  }, [user, loading, router]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Analysis failed";
      alert(message);
    } finally {
      setIsAnalyzing(false);
      fetchHistory();
    }
  };

  const handleFetchData = async (path: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) throw new Error("Failed to fetch snapshot");

      const data = await response.json();
      setResult(data);
      setUrl(data.repoUrl || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      alert("Failed to load historical analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async (path: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        setHistory(history.filter((item) => item.path !== path));
      } else {
        alert("Failed to delete analysis");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting analysis");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-background overflow-x-hidden selection:bg-primary/30">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md border-b border-white/5">
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow transition-transform duration-300">
            <Code className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase italic">
            CodeLens<span className="text-primary italic">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 shrink-0">
              {user.photoURL ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
                  <Image
                    src={user.photoURL}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <User className="w-4 h-4 text-white/60" />
              )}
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest hidden sm:block">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-full glass glass-hover text-white/40 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-16">
          {!result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-5xl mx-auto pt-10"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Analyze a new repository
              </h1>
              <p className="text-white/40 mb-12 text-base md:text-lg">
                Enter a GitHub or GitLab URL to begin your code analysis. We’ll{" "}
                <br className="hidden md:block" /> scan for security,
                performance, and style.
              </p>

              <form onSubmit={handleAnalyze} className="w-full relative mb-16">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-4xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                  <div className="relative flex flex-col md:flex-row items-center bg-[#0d0d12] border border-white/10 rounded-3xl md:rounded-full p-2 pr-2 shadow-2xl">
                    <div className="hidden md:block pl-6 pr-4">
                      <Github className="text-white/20 w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://github.com/organization/repository"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full md:flex-1 bg-transparent border-none text-white placeholder:text-white/10 focus:ring-0 text-lg py-4 px-4 md:px-0 outline-none font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing || !url}
                      className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl md:rounded-full font-bold bg-primary text-white hover:bg-primary-deep active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="animate-spin w-5 h-5" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                      <span>
                        {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                    Public & Private
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                    Automatic Webhooks
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                    PR Support
                  </div>
                </div>
              </form>

              {/* Recent Repositories */}
              <div className="text-left w-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Recent Repositories
                  </h2>
                  <button className="text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                    View All Projects
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                  {history.length > 0 ? (
                    history.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleFetchData(item.path)}
                      >
                        <RepoCard
                          name={item.repoName}
                          branch={item.timestamp}
                          status="ARCHIVED"
                          time={
                            item.summary.length > 50
                              ? item.summary.slice(0, 50) + "..."
                              : item.summary
                          }
                          color="primary"
                          onDelete={() => handleDeleteAnalysis(item.path)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 glass rounded-3xl flex flex-col items-center justify-center text-white/20">
                      <Code className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        No recent analyses found
                      </p>
                    </div>
                  )}
                </div>

                {/* Help Card */}
                <div className="relative overflow-hidden glass rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between border-white/5 group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
                  <div className="relative z-10 max-w-xl text-center md:text-left">
                    <h2 className="text-3xl font-black text-white mb-4">
                      Need help getting started?
                    </h2>
                    <p className="text-white/40 leading-relaxed text-sm">
                      Connect your workspace to Slack or Discord to receive
                      real-time alerts whenever a repository analysis completes.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                      <button className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all">
                        Integrations
                      </button>
                      <button className="px-8 py-3 rounded-xl glass glass-hover text-white font-bold transition-all border-white/10">
                        Documentation
                      </button>
                    </div>
                  </div>
                  <div className="relative mt-8 md:mt-0 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Sparkles className="w-32 h-32 text-primary rotate-12" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8"
            >
              <div>
                <div className="flex items-center gap-3 text-white/40 mb-2">
                  <Github className="w-4 h-4" />
                  <span className="text-sm font-mono">{url}</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {typeof result.summary === "string"
                    ? result.summary.split(".")[0]
                    : "Analysis Results"}
                </h1>
                {result.storagePath && (
                  <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-green-400 capitalize bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10 w-fit animate-pulse-slow">
                    <Sparkles className="w-3 h-3" />
                    Saved to Cloud Storage: {result.storagePath}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const content =
                      typeof result.documentation === "string"
                        ? result.documentation
                        : JSON.stringify(result.documentation, null, 2);
                    const blob = new Blob([content], {
                      type: "text/markdown",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `CodeLens_Report_${new Date().getTime()}.md`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-sm font-bold text-white/60 hover:text-white transition-all border border-white/5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export MD</span>
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setUrl("");
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Analysis</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar Tabs */}
              <div className="flex flex-col gap-2">
                <TabButton
                  active={activeTab === "docs"}
                  onClick={() => setActiveTab("docs")}
                  icon={<FileText className="w-4 h-4" />}
                  label="Documentation"
                  count="README"
                />
                <TabButton
                  active={activeTab === "diagram"}
                  onClick={() => setActiveTab("diagram")}
                  icon={<Network className="w-4 h-4" />}
                  label="Infrastructure"
                  count="Diagram"
                />
                <TabButton
                  active={activeTab === "audit"}
                  onClick={() => setActiveTab("audit")}
                  icon={<AlertTriangle className="w-4 h-4" />}
                  label="Health Audit"
                  count={String(result.analysis.length)}
                />
              </div>

              {/* Main Display Area */}
              <div className="lg:col-span-3 min-h-[500px]">
                <div className="glass rounded-3xl p-8 border-white/5 overflow-hidden">
                  {activeTab === "docs" && (
                    <div className="prose prose-invert max-w-none prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/5 prose-h1:text-gradient prose-a:text-primary hover:prose-a:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typeof result.documentation === "string"
                          ? result.documentation
                          : JSON.stringify(result.documentation, null, 2)}
                      </ReactMarkdown>
                    </div>
                  )}
                  {activeTab === "diagram" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">
                          System Architecture
                        </h2>
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                          Mermaid Engine v11.12
                        </span>
                      </div>
                      <Mermaid
                        chart={
                          typeof result.mermaid === "string"
                            ? result.mermaid
                            : JSON.stringify(result.mermaid, null, 2)
                        }
                      />
                    </div>
                  )}
                  {activeTab === "audit" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white mb-6">
                        Discovery & Recommendations
                      </h2>
                      {result.analysis.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 group hover:bg-white/4 transition-all"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                              item.severity === "high"
                                ? "bg-red-500/20 text-red-500"
                                : item.severity === "medium"
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-blue-500/20 text-blue-500",
                            )}
                          >
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-white capitalize">
                                {item.type}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] uppercase font-black px-2 py-0.5 rounded-md",
                                  item.severity === "high"
                                    ? "bg-red-500 text-white"
                                    : item.severity === "medium"
                                      ? "bg-amber-500 text-black"
                                      : "bg-blue-500 text-white",
                                )}
                              >
                                {item.severity}
                              </span>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 border-transparent border-2 group",
        active
          ? "bg-primary text-white border-primary glow shadow-2xl scale-[1.02]"
          : "glass glass-hover text-white/40 border-transparent",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 transition-colors",
            active && "bg-white/20",
          )}
        >
          {icon}
        </div>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      <div
        className={cn(
          "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all",
          active
            ? "bg-white/20 text-white"
            : "bg-white/5 text-white/20 group-hover:bg-white/10",
        )}
      >
        {count}
      </div>
    </button>
  );
}

function RepoCard({
  name,
  branch,
  status,
  time,
  color,
  isLoading = false,
  onDelete,
}: {
  name: string;
  branch: string;
  status: string;
  time: string;
  color: string;
  isLoading?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative glass p-6 rounded-3xl border-white/5 hover:border-white/20 hover:bg-white/4 transition-all cursor-pointer group hover:-translate-y-1">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 z-20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center shrink-0 border border-white/5">
          <Code className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
        </div>
        {/* <div
          className={cn(
            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
            color === "accent"
              ? "bg-accent/10 text-accent border border-accent/20"
              : color === "red-500"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-primary/10 text-primary border border-primary/20",
          )}
        >
          {status}
        </div> */}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors tracking-tight">
        {name}
      </h3>
      <p className="text-xs text-white/30 mb-8 font-medium">{branch}</p>
      <div className="flex items-center gap-2.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] border-t border-white/5 pt-4">
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
        )}
        {time}
      </div>
    </div>
  );
}
