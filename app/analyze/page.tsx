"use client";

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
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"docs" | "diagram" | "audit">(
    "docs",
  );
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
    <main className="relative min-h-screen w-full flex flex-col bg-background overflow-x-hidden">
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
          <span className="text-lg font-bold tracking-tight text-white">
            CodeLens
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10">
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
              <span className="text-xs font-medium text-white/80">
                {user.displayName || user.email}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-full glass glass-hover text-white/60 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          {!result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Start New Analysis
              </h1>
              <p className="text-white/40 mb-8">
                Enter a GitHub repository link to generate technical artifacts.
              </p>

              <form onSubmit={handleAnalyze} className="w-full relative">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center bg-[#0d0d0d] border border-white/10 rounded-2xl p-1.5 pr-2.5 shadow-2xl">
                    <div className="pl-4 pr-3">
                      <Github className="text-white/40 w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://github.com/username/repository"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus:ring-0 text-base py-3 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing || !url}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="animate-spin w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
                    </button>
                  </div>
                </div>
              </form>
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
                  {result.summary.split(".")[0]}
                </h1>
              </div>
              <button
                onClick={() => {
                  setResult(null);
                  setUrl("");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm font-medium text-white/60 hover:text-white transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
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
                        {result.documentation}
                      </ReactMarkdown>
                    </div>
                  )}
                  {activeTab === "diagram" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">
                          System Architecture
                        </h2>
                        <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                          Mermaid Engine v10.0
                        </span>
                      </div>
                      <Mermaid chart={result.mermaid} />
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
                          className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
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
        "flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 border-transparent border group",
        active
          ? "bg-primary text-white shadow-xl glow"
          : "glass glass-hover text-white/40",
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
