"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { motion } from "framer-motion";
import { Github, Code, Mail } from "lucide-react";
import { auth, githubProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/analyze");
    }
  }, [user, router]);

  const handleGitHubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-[#000212] overflow-hidden">
      {/* Left Side - Visual / Brand */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-20 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Mockup / Stat Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl border-white/10 mb-12 relative overflow-hidden group"
          >
            <div className="flex gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500/30" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
              <div className="w-2 h-2 rounded-full bg-green-500/30" />
            </div>
            <div className="space-y-3 mb-8">
              <div className="h-2 w-3/4 bg-white/5 rounded-full" />
              <div className="h-2 w-full bg-white/5 rounded-full" />
              <div className="h-2 w-2/3 bg-white/5 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div className="h-2 w-32 bg-primary/20 rounded-full" />
            </div>

            {/* Floating Stat */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-4 glass p-4 rounded-2xl border-white/10 shadow-2xl"
            >
              <div className="text-2xl font-black text-white">99.8%</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Analysis Accuracy
              </div>
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white mb-6 leading-tight"
          >
            Secure your code with <br />
            <span className="text-primary italic">Intelligence.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/40 text-lg leading-relaxed"
          >
            The modern standard for deep GitHub repository analysis and
            automated code reviews.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050507]">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center mb-12"
          >
            <div
              className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center glow mb-8 group cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Code className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-white/40 text-sm">
              Please sign in to access your dashboard.
            </p>
          </motion.div>

          <div className="space-y-4">
            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 active:scale-[0.98] transition-all duration-300 shadow-xl"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>

            <div className="relative py-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] bg-[#050507]">
                or
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-white/2 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                disabled
                className="w-full py-4 rounded-2xl bg-primary/10 text-primary/40 font-bold cursor-not-allowed border border-primary/5"
              >
                Login with Email
              </button>
            </div>
          </div>

          <p className="text-center mt-12 text-[10px] leading-relaxed text-white/20 max-w-[280px] mx-auto">
            By continuing, you agree to our{" "}
            <Link href="#" className="hover:text-white underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="hover:text-white underline">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-20 flex justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
            <FooterSmlLink label="Support" />
            <FooterSmlLink label="Security" />
            <FooterSmlLink label="Status" />
          </div>
        </div>
      </div>
    </main>
  );
}

function FooterSmlLink({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-primary transition-colors italic"
    >
      {label}
    </a>
  );
}
