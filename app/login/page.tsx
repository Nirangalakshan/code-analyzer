"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Code, ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { auth, githubProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden selection:bg-primary/30">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow mb-8">
            <Code className="text-white w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-white/40 mb-10 leading-relaxed text-sm">
            Sign in with your GitHub account to start mapping and documenting
            your repositories.
          </p>

          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl mb-6 group"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2 text-white/20 text-xs uppercase tracking-widest font-semibold justify-center my-4">
              <div className="h-px w-8 bg-white/10" />
              <span>Secure Access via Firebase</span>
              <div className="h-px w-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <SecurityItem
                icon={<Lock className="w-4 h-4" />}
                label="Encrypted"
              />
              <SecurityItem
                icon={<Shield className="w-4 h-4" />}
                label="Verified"
              />
              <SecurityItem icon={<Zap className="w-4 h-4" />} label="Fast" />
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-white/20 text-xs"
        >
          By continuing, you agree to CodeLens Terms of Service and Privacy
          Policy.
        </motion.p>
      </div>
    </main>
  );
}

function SecurityItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="text-white/40">{icon}</div>
      <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
        {label}
      </span>
    </div>
  );
}
