"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Code,
  Cpu,
  Network,
  Globe,
  BookOpen,
  Shield,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-background overflow-x-hidden selection:bg-primary/30">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow group-hover:scale-110 transition-transform duration-300">
            <Code className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            CodeLens<span className="text-primary italic">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink label="Features" href="#features" />
          <NavLink label="Solutions" href="#" />
          <NavLink label="Pricing" href="#" />
          <NavLink label="Docs" href="#" />
        </div>

        <div className="flex items-center gap-4">
          {!user && (
            <Link
              href="/login"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}
          <Link
            href={user ? "/analyze" : "/login"}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-primary-deep active:scale-95 shadow-lg shadow-primary/20"
          >
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            New Version 2.0 is Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[1.05]"
        >
          Understand any codebase <br />
          <span className="text-gradient-primary italic">in seconds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg md:text-xl text-white/40 max-w-2xl mb-12 leading-relaxed"
        >
          CodeLens AI automatically maps your architecture, writes comprehensive
          documentation, and uncovers security vulnerabilities before they reach
          production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Link
            href={user ? "/analyze" : "/login"}
            className="px-10 py-5 rounded-2xl bg-primary text-white text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-primary/20"
          >
            Start Mapping for Free
          </Link>
          <button className="px-10 py-5 rounded-2xl glass glass-hover text-lg font-bold text-white transition-all duration-300">
            View Demo
          </button>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full max-w-5xl mx-auto rounded-[2rem] border border-white/10 bg-[#0d0d0f] shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] font-mono text-white/20 tracking-widest uppercase">
              CODELENS-AI-VISUALIZER — v2.4
            </div>
            <div className="w-12 h-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 h-[500px]">
            <div className="p-8 text-left border-r border-white/5 font-mono text-sm overflow-hidden">
              <div className="text-white/40 mb-4 flex items-center gap-2">
                <Code className="w-4 h-4" /> index.ts
              </div>
              <CodeSnippet />
            </div>
            <div className="relative bg-[#050507] flex items-center justify-center p-8 overflow-hidden">
              {/* Simplified Diagram Placeholder */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative z-10 grid grid-cols-3 gap-8">
                  <NodeIcon icon={<Cpu />} active />
                  <NodeIcon icon={<Network />} />
                  <NodeIcon icon={<Globe />} />
                </div>
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <line
                    x1="16.6%"
                    y1="50%"
                    x2="50%"
                    y2="50%"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4"
                    className="text-primary"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="83.3%"
                    y2="50%"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4"
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 mask-radial bg-primary/5" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase mb-12">
            Trusted by teams from innovative startups
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <LogoPlaceholder name="PYTHON" />
            <LogoPlaceholder name="RUST" />
            <LogoPlaceholder name="GOLANG" />
            <LogoPlaceholder name="TYPESCRIPT" />
            <LogoPlaceholder name="KOTLIN" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Master your complexity
          </h2>
          <p className="text-white/40 text-lg">
            The ultimate developer companion for large-scale systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="text-primary" />}
            title="Automated Documentation"
            description="Never write a README from scratch again. CodeLens AI monitors your commits and automatically generates technical wikis."
          />
          <FeatureCard
            icon={<Shield className="text-secondary" />}
            title="Security Insights"
            description="AI-powered vulnerability detection that lives directly in your CI/CD pipeline, catching bugs before production."
          />
          <FeatureCard
            icon={<Zap className="text-accent" />}
            title="Direct Analysis"
            description="Deep scan legacy codebases to generate live architectural diagrams, understanding circular dependencies in real-time."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto glass rounded-[3rem] p-12 md:p-24 text-center border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
            Ready to decode your future?
          </h2>
          <p className="text-white/40 text-lg mb-12">
            Join 15,000+ developers who are building faster and safer with
            CodeLens AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/login"
              className="px-12 py-5 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-all"
            >
              Get Started Free
            </Link>
            <button className="px-12 py-5 rounded-2xl glass glass-hover text-white font-bold transition-all">
              Talk to Sales
            </button>
          </div>
          <p className="mt-8 text-xs text-white/20 leading-relaxed italic">
            No credit card required. Free plan includes up to 3 private
            repositories.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#000212]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Code className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">
                CodeLens<span className="text-primary italic">AI</span>
              </span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed">
              The AI engine for technical discovery and architectural
              intelligence. Built for developers, by developers.
            </p>
          </div>
          <FooterColumn
            title="Platform"
            links={["Features", "Integrations", "Pricing", "Changelog"]}
          />
          <FooterColumn
            title="Company"
            links={["About Us", "Careers", "Security", "Contact"]}
          />
          <FooterColumn
            title="Resources"
            links={["Documentation", "Blog", "API Status", "Privacy"]}
          />
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            © 2026 CodeLens AI Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Github className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
            <Globe className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </main>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="text-xs font-bold tracking-widest text-white/40 hover:text-white uppercase transition-colors"
    >
      {label}
    </a>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-10 rounded-[2.5rem] glass border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500">
        <div className="text-white w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
        {title}
      </h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}

function CodeSnippet() {
  return (
    <div className="space-y-1">
      <Line
        color="text-purple-400"
        text="async function analyzeArchitecture(repo) {"
      />
      <Line
        color="text-blue-400"
        indent="  "
        text="const components = await ai.scan(repo);"
      />
      <Line
        color="text-gray-500"
        indent="  "
        text="// Mapping dependencies..."
      />
      <Line
        color="text-yellow-400"
        indent="  "
        text="return components.map(c => ({"
      />
      <Line color="text-blue-400" indent="    " text="id: c.uuid," />
      <Line color="text-green-400" indent="    " text="type: 'microservice'," />
      <Line
        color="text-yellow-400"
        indent="    "
        text="edges: c.links.findConnections()"
      />
      <Line color="text-yellow-400" indent="  " text="}));" />
      <Line color="text-purple-400" text="}" />
    </div>
  );
}

function Line({
  text,
  color,
  indent = "",
}: {
  text: string;
  color: string;
  indent?: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="w-4 text-white/10 text-right shrink-0">·</span>
      <span className={`${color} ${indent}`}>{text}</span>
    </div>
  );
}

function NodeIcon({
  icon,
  active = false,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${active ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" : "bg-white/5 text-white/20 border-white/5"}`}
    >
      <div className="w-6 h-6">{icon}</div>
    </div>
  );
}

function LogoPlaceholder({ name }: { name: string }) {
  return (
    <span className="text-xl font-black tracking-[0.2em] text-white select-none">
      {name}
    </span>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-2">
        {title}
      </h4>
      <div className="flex flex-col gap-4">
        {links.map((l) => (
          <a
            key={l}
            href="#"
            className="text-sm text-white/30 hover:text-white transition-colors capitalize"
          >
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}
