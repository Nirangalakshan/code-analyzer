"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Sparkles,
  Network,
  BookOpen,
  ArrowRight,
  Shield,
  Code,
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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden selection:bg-primary/30">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow group-hover:scale-110 transition-transform duration-300">
            <Code className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            CodeLens
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-white">
          <a
            href="#features"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            GCP Vertex
          </a>
        </div>

        <Link
          href={user ? "/analyze" : "/login"}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full glass glass-hover text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {user ? "Dashboard" : "Login"}
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container max-w-6xl px-4 flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">
            Powered by Google Vertex AI & Gemini
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Map Your Codebase <br />
          <span className="text-gradient">With AI Precision.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mb-12"
        >
          Generate diagrams, technical documentation, and security reports from
          any GitHub repository using state-of-the-art AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Link
            href={user ? "/analyze" : "/login"}
            className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-black text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl group"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 px-10 py-5 rounded-2xl glass glass-hover text-lg font-bold text-white transition-all duration-300">
            <Github className="w-5 h-5" />
            <span>Star on GitHub</span>
          </button>
        </motion.div>

        {/* Features Grid */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left scroll-mt-32"
        >
          <FeatureCard
            icon={<Network className="w-6 h-6 text-primary" />}
            title="System Diagrams"
            description="Automatic Mermaid.js diagram generation for architecture, logic flow, and class relationships."
            delay={0.4}
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6 text-secondary" />}
            title="Smart Documentation"
            description="Context-aware READMEs and technical docs generated using Vertex AI's Gemini models."
            delay={0.5}
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-accent" />}
            title="Security Audit"
            description="Real-time scanning for vulnerabilities and best practice violations in your codebase."
            delay={0.6}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full p-12 mt-20 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Code className="text-white/40 w-5 h-5" />
              <span className="text-white/60 font-semibold uppercase tracking-widest text-xs">
                Built with GCP Vertex AI
              </span>
            </div>
            <p className="text-white/30 text-sm">
              © 2026 CodeLens. All rights reserved.
            </p>
          </div>
          <div className="flex gap-12">
            <FooterLink label="API" />
            <FooterLink label="Pricing" />
            <FooterLink label="Privacy" />
            <FooterLink label="Terms" />
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="p-8 rounded-[2rem] glass glass-hover transition-all duration-500 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="text-sm font-medium text-white/30 hover:text-white transition-colors cursor-pointer"
    >
      {label}
    </a>
  );
}
