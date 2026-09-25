"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";

const PERSONAS = [
  {
    role: "PI" as UserRole,
    name: "Dr. Rajesh Sharma",
    title: "Principal Investigator",
    email: "pi@ayurctms.in",
    inst: "All India Institute of Ayurveda, New Delhi",
    color: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900",
  },
  {
    role: "ETHICS" as UserRole,
    name: "Dr. Sunita Patel",
    title: "Ethics Committee Chair",
    email: "ethics@ayurctms.in",
    inst: "Institutional Ethics Review Board",
    color: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900",
  },
  {
    role: "PV" as UserRole,
    name: "Dr. Anand Verma",
    title: "Pharmacovigilance Officer",
    email: "pv@ayurctms.in",
    inst: "National PvCC Safety Unit",
    color: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900",
  },
  {
    role: "REGULATOR" as UserRole,
    name: "Officer K. S. Rao",
    title: "Regulatory Inspector",
    email: "regulator@ayurctms.in",
    inst: "Ministry of AYUSH / CDSCO",
    color: "border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900",
  },
  {
    role: "ADMIN" as UserRole,
    name: "System Administrator",
    title: "Platform Governance",
    email: "admin@ayurctms.in",
    inst: "AyurCTMS Operations",
    color: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
  const [email, setEmail] = useState("pi@ayurctms.in");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    setError("");
    setLoading(true);
    try {
      await api.login(loginEmail || email, loginPassword || password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaClick = (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword(DEMO_PASSWORD);
    handleLogin(personaEmail, DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-block">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-950/60 mb-4 hover:scale-105 transition-transform">
            <Leaf className="w-8 h-8 text-emerald-100" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">AyurCTMS</h2>
        <p className="text-xs text-slate-400 mt-1">Ayurveda Clinical Trial Management & Regulatory Compliance</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          21 CFR Part 11 & AYUSH GCP Ready
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.in"
                  className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Regulatory Portal"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Signup link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Create Account →
              </Link>
            </p>
          </div>

          {/* Quick Persona Picker for Judges */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Evaluation Persona Quick-Fill
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click to login</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {PERSONAS.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handlePersonaClick(p.email)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all group ${p.color} cursor-pointer`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/80 text-[10px] font-extrabold border border-current shadow-2xs">
                        {p.role}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75 truncate">{p.title} · {p.inst}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div className="mt-6 text-center z-10">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
