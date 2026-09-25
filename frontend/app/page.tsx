"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  FlaskConical,
  Users,
  ShieldAlert,
  FileCheck2,
  Activity,
  Globe,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Lock,
  BarChart3,
  Download,
  BookOpen,
  Layers,
  Cpu,
  Building2,
  Star,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Clinical Trial Management",
    description:
      "End-to-end trial lifecycle management with CTRI integration, protocol versioning, and multi-site coordination for Ayurveda clinical research.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: ShieldAlert,
    title: "SAE & Pharmacovigilance",
    description:
      "Real-time adverse event tracking with 24-hour SAE countdown alerts, MedDRA/Ayurvedic dual terminology mapping, and automated severity classification.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: ShieldCheck,
    title: "Ethics & Compliance",
    description:
      "Institutional Ethics Committee (IEC) review workflows, 21 CFR Part 11 audit trails, and AYUSH GCP compliance scorecard for regulatory readiness.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Participant Management",
    description:
      "Comprehensive participant enrollment, demographic tracking, visit scheduling, and multi-site cohort management with real-time status updates.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Cpu,
    title: "AI-Powered Terminology",
    description:
      "Intelligent MedDRA code suggestion with Ayurvedic correlate mapping, confidence scoring, and System Organ Class classification powered by NLP.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Download,
    title: "FHIR & SDTM Exports",
    description:
      "One-click regulatory data exports in FHIR R4 bundles, CDISC SDTM domains (DM, AE), and CSV formats for seamless regulatory submissions.",
    gradient: "from-cyan-500 to-teal-600",
  },
];

const ROLES = [
  {
    role: "PI",
    name: "Principal Investigator",
    description: "Protocol design, cohort enrollment, and safety incident reporting.",
    color: "bg-emerald-500",
  },
  {
    role: "Ethics",
    name: "Ethics Committee",
    description: "Protocol clearance, amendments, and statutory safety oversight.",
    color: "bg-blue-500",
  },
  {
    role: "PV",
    name: "Pharmacovigilance",
    description: "ADR monitoring, causality assessment, and SAE tracking.",
    color: "bg-amber-500",
  },
  {
    role: "Regulator",
    name: "AYUSH / CDSCO",
    description: "Statutory audit trails, inspections, and export generation.",
    color: "bg-purple-500",
  },
  {
    role: "Admin",
    name: "System Admin",
    description: "User governance, settings, and site provisioning.",
    color: "bg-slate-500",
  },
];

const TECH_STACK = [
  { name: "Next.js 15", category: "Frontend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Supabase PostgreSQL", category: "Database" },
  { name: "SQLAlchemy ORM", category: "ORM" },
  { name: "JWT Authentication", category: "Security" },
  { name: "Recharts", category: "Visualization" },
  { name: "FHIR R4 / SDTM", category: "Standards" },
  { name: "Vercel", category: "Deployment" },
];

const STATS = [
  { label: "Regulatory Standards", value: "5+", icon: ShieldCheck },
  { label: "User Roles", value: "5", icon: Users },
  { label: "Export Formats", value: "3", icon: Download },
  { label: "API Endpoints", value: "30+", icon: Globe },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              AyurCTMS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-emerald-400 transition-colors">
              Roles
            </a>
            <a href="#tech" className="hover:text-emerald-400 transition-colors">
              Tech Stack
            </a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              About
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2 rounded-lg shadow-lg shadow-emerald-900/40 transition-all hover:shadow-emerald-900/60"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[100px]"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
            className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-600/8 rounded-full blur-[100px]"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          />
          <div
            className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[100px]"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Smart India Hackathon 2024 — SIH Problem Statement
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Ayurveda Clinical Trial
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, regulatory-compliant platform for managing Ayurveda and Traditional
            Medicine clinical trials — featuring{" "}
            <span className="text-emerald-400 font-semibold">21 CFR Part 11</span> audit trails,{" "}
            <span className="text-teal-400 font-semibold">AYUSH GCP</span> compliance, real-time
            SAE monitoring, and{" "}
            <span className="text-cyan-400 font-semibold">AI-powered</span> terminology mapping.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl shadow-emerald-900/50 transition-all hover:shadow-emerald-900/70 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all hover:bg-slate-800/50"
            >
              <Lock className="w-4 h-4" />
              Sign In to Portal
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              21 CFR Part 11
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              AYUSH GCP
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-600" />
              CTRI Ready
            </span>
          </div>

          <div className="mt-16 animate-bounce text-slate-600">
            <ChevronDown className="w-6 h-6 mx-auto" />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative py-16 border-y border-slate-800/50 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" data-animate className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Everything You Need for
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Ayurveda Clinical Research
              </span>
            </h2>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${
              isVisible("features")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:bg-slate-900 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLE-BASED ACCESS ─── */}
      <section
        id="roles"
        data-animate
        className="py-24 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              ROLE-BASED ACCESS CONTROL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Five Specialized Portals
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
              Each role gets a tailored dashboard with permissions aligned to their regulatory
              responsibilities.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 transition-all duration-700 ${
              isVisible("roles")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {ROLES.map((role, i) => (
              <div
                key={role.role}
                className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-1 text-center group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-full ${role.color} mx-auto mb-3 flex items-center justify-center text-white font-black text-sm shadow-lg`}
                >
                  {role.role.charAt(0)}
                </div>
                <h3 className="text-sm font-bold text-white">{role.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  {role.role}
                </span>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPLIANCE ─── */}
      <section id="compliance" data-animate className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-700 ${
                isVisible("compliance")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
                REGULATORY COMPLIANCE
              </span>
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                Built for Regulatory Readiness
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "21 CFR Part 11 Audit Trails",
                    desc: "Every data modification is logged with user identity, timestamp, old/new values, and reason for change.",
                  },
                  {
                    title: "AYUSH GCP Guidelines",
                    desc: "Protocol versioning, informed consent tracking, and ethics committee review workflows per AYUSH norms.",
                  },
                  {
                    title: "24-Hour SAE Reporting",
                    desc: "Automated countdown timers for Serious Adverse Events with escalation alerts to ensure regulatory deadlines.",
                  },
                  {
                    title: "FHIR R4 & SDTM Compliance",
                    desc: "Export clinical data in HL7 FHIR bundles and CDISC SDTM format for regulatory submissions.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible("compliance")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Compliance Scorecard</h3>
                    <p className="text-[11px] text-slate-500">Real-time regulatory status</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Protocol Version Control", score: 100 },
                    { name: "Ethics Committee Clearance", score: 95 },
                    { name: "SAE Timely Reporting", score: 88 },
                    { name: "Audit Trail Completeness", score: 100 },
                    { name: "Informed Consent Status", score: 92 },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{item.name}</span>
                        <span
                          className={`font-bold ${
                            item.score >= 95
                              ? "text-emerald-400"
                              : item.score >= 80
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {item.score}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.score >= 95
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                              : item.score >= 80
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-rose-500 to-pink-500"
                          }`}
                          style={{
                            width: isVisible("compliance") ? `${item.score}%` : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Overall Score</span>
                  <span className="text-lg font-black text-emerald-400">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section
        id="tech"
        data-animate
        className="py-24 px-4 bg-gradient-to-b from-slate-950 to-slate-900/50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            TECHNOLOGY STACK
          </span>
          <h2 className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-10">
            Modern & Scalable Architecture
          </h2>

          <div
            className={`flex flex-wrap justify-center gap-3 transition-all duration-700 ${
              isVisible("tech") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {TECH_STACK.map((tech, i) => (
              <div
                key={tech.name}
                className="px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all hover:-translate-y-0.5"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="text-sm font-bold text-white">{tech.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{tech.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / SIH ─── */}
      <section id="about" data-animate className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700/50 p-8 sm:p-12 text-center transition-all duration-700 ${
              isVisible("about") ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
              <Star className="w-3.5 h-3.5" />
              Smart India Hackathon
            </div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
              About This Project
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
              <strong className="text-white">AyurCTMS</strong> is developed as a comprehensive
              solution for the{" "}
              <span className="text-amber-400 font-semibold">
                Smart India Hackathon (SIH)
              </span>{" "}
              problem statement addressing the need for a Clinical Trial Management and Regulatory
              Compliance Platform specifically designed for{" "}
              <span className="text-emerald-400 font-semibold">
                Ayurveda and Traditional Medicine
              </span>
              .
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
              The platform bridges the gap between modern clinical trial management practices and
              the unique requirements of Ayurvedic research — supporting dual terminology systems
              (MedDRA + Ayurvedic), AYUSH-specific GCP guidelines, CTRI integration, and
              comprehensive regulatory compliance features mandated by Indian regulatory bodies
              including the Ministry of AYUSH and CDSCO.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl transition-all hover:scale-105"
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Already have an account? Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 border-t border-slate-800/50 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-400">AyurCTMS</span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs text-slate-600">SIH 2024 Project</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} AyurCTMS. Clinical Trial Management & Regulatory Compliance Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
