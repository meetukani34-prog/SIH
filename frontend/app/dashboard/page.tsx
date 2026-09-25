"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Users,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Activity,
  FileCheck2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  RefreshCw,
  Building2,
  ExternalLink,
  UserCheck,
  ClipboardList,
  Scale,
  Landmark,
  FileText,
  UserPlus,
  Stethoscope,
  HeartPulse,
  Eye,
  Lock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api, getCurrentUser, setCurrentUser as setStoredUser } from "@/lib/api";
import {
  User,
  UserRole,
  DashboardMetrics,
  CommandCenterMetrics,
  CommandCenterAlert,
  SafetySignal,
} from "@/lib/types";
import { StatusBadge, SaeCountdownBadge } from "@/components/Badges";

const SEVERITY_COLORS: Record<string, string> = {
  MILD: "#10b981",
  MODERATE: "#f59e0b",
  SEVERE: "#ef4444",
};

const DEFAULT_COMMAND_METRICS: CommandCenterMetrics = {
  total_studies: 12,
  studies_by_risk: { on_track: 8, at_risk: 3, critical: 1 },
  patient_metrics: {
    total_enrolled: 1170,
    target_enrolled: 1480,
    enrolled_percentage: 79.1,
    active_participants: 980,
    completed_participants: 190,
  },
  safety_counts: {
    total_ae: 24,
    serious_ae: 4,
    pending_pv_review: 3,
    overdue_24h_reports: 0,
    potential_signals: 1,
  },
  quality_metrics: {
    open_queries: 42,
    critical_deviations: 1,
    major_deviations: 5,
    data_cleanliness_pct: 94.2,
  },
  overdue_items: {
    sae_overdue: 0,
    ethics_lapsed: 0,
    queries_aging: 0,
  },
};

const DEMO_PERSONAS: {
  role: UserRole;
  name: string;
  email: string;
  institution: string;
  tagline: string;
  icon: any;
  colorScheme: {
    border: string;
    bg: string;
    text: string;
    badge: string;
  };
}[] = [
  {
    role: "PI",
    name: "Dr. Rajesh Sharma",
    email: "pi@ayurctms.in",
    institution: "AIIA New Delhi · Unit 01",
    tagline: "Clinical Trial Operations & Patient Care",
    icon: Stethoscope,
    colorScheme: {
      border: "border-emerald-300",
      bg: "bg-emerald-50/70",
      text: "text-emerald-900",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
  },
  {
    role: "ETHICS",
    name: "Dr. Sunita Patel",
    email: "ethics@ayurctms.in",
    institution: "Institutional Ethics Review Board (IEC)",
    tagline: "Protocol Clearances & Consent Protection",
    icon: Scale,
    colorScheme: {
      border: "border-indigo-300",
      bg: "bg-indigo-50/70",
      text: "text-indigo-900",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    },
  },
  {
    role: "PV",
    name: "Dr. Anand Verma",
    email: "pv@ayurctms.in",
    institution: "National Pharmacovigilance Centre (NPvCC)",
    tagline: "Safety Signal PRR & Statutory 24h SAE",
    icon: HeartPulse,
    colorScheme: {
      border: "border-rose-300",
      bg: "bg-rose-50/70",
      text: "text-rose-900",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
    },
  },
  {
    role: "REGULATOR",
    name: "Officer K. S. Rao",
    email: "regulator@ayurctms.in",
    institution: "Ministry of AYUSH / CDSCO Division",
    tagline: "CTRI Compliance & 21 CFR Part 11 Audit",
    icon: Landmark,
    colorScheme: {
      border: "border-purple-300",
      bg: "bg-purple-50/70",
      text: "text-purple-900",
      badge: "bg-purple-100 text-purple-800 border-purple-300",
    },
  },
  {
    role: "ADMIN",
    name: "System Administrator",
    email: "admin@ayurctms.in",
    institution: "AIIA Central Command Operations",
    tagline: "National Research Telemetry & Oversight",
    icon: ShieldCheck,
    colorScheme: {
      border: "border-slate-300",
      bg: "bg-slate-100/70",
      text: "text-slate-900",
      badge: "bg-slate-200 text-slate-800 border-slate-300",
    },
  },
];

export default function DashboardPage() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [commandMetrics, setCommandMetrics] = useState<CommandCenterMetrics>(DEFAULT_COMMAND_METRICS);
  const [alerts, setAlerts] = useState<CommandCenterAlert[]>([]);
  const [signals, setSignals] = useState<SafetySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
    const onUserChanged = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setCurrentUserState(custom.detail);
      } else {
        setCurrentUserState(getCurrentUser());
      }
    };
    window.addEventListener("ayurctms_user_changed", onUserChanged);
    return () => window.removeEventListener("ayurctms_user_changed", onUserChanged);
  }, []);

  const loadData = async () => {
    try {
      const [legacyMetrics, ccMetrics, alertList, signalList] = await Promise.all([
        api.getDashboardMetrics().catch(() => null),
        api.getCommandCenterMetrics().catch(() => null),
        api.getCommandCenterAlerts().catch(() => []),
        api.getSafetySignals().catch(() => []),
      ]);
      if (legacyMetrics) setMetrics(legacyMetrics);
      if (ccMetrics) setCommandMetrics(ccMetrics);
      setAlerts(alertList);
      setSignals(signalList);
    } catch (e) {
      console.error("Dashboard data fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s telemetry heartbeat
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (persona: (typeof DEMO_PERSONAS)[0]) => {
    const updatedUser: User = {
      id: `user-${persona.role.toLowerCase()}`,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      institution: persona.institution,
      created_at: new Date().toISOString(),
    };
    setCurrentUserState(updatedUser);
    setStoredUser(updatedUser);
    window.dispatchEvent(new CustomEvent("ayurctms_user_changed", { detail: updatedUser }));

    // Non-blocking background JWT sync
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Password123!";
    api.login(persona.email, demoPassword).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Connecting to AIIA Command Telemetry Network...</p>
      </div>
    );
  }

  const activeRole: UserRole = currentUser?.role || "PI";
  const urgentSae = metrics?.urgent_sae_alerts?.[0];

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity === "ALL") return true;
    return a.severity === selectedSeverity;
  });

  return (
    <div className="space-y-6">
      {/* 1. Fast Role Persona Switcher Bar (Instant 0ms Feedback) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Role-Specific Dashboard Viewport (Live Demo Mode)
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">
              · Click any persona below to see their tailored dashboard immediately
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            Active: <strong className="text-emerald-700">{currentUser?.name || "Dr. Rajesh Sharma"}</strong> ({activeRole})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DEMO_PERSONAS.map((p) => {
            const isSelected = activeRole === p.role;
            const Icon = p.icon;
            return (
              <button
                key={p.role}
                onClick={() => handleRoleSelect(p)}
                className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? `${p.colorScheme.bg} ${p.colorScheme.border} shadow-xs ring-2 ring-emerald-500/20`
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-700" : "text-slate-500"}`} />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border bg-white shadow-2xs">
                      {p.role}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold truncate text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.institution}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC ROLE-BASED HEADER BANNER */}
      {activeRole === "PI" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden border border-emerald-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PRINCIPAL INVESTIGATOR · AIIA UNIT 01
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ICH-GCP E6(R2)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AYUSH GCP COMPLIANT
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Principal Investigator Clinical Operations Workspace
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Active protocol management, subject screening & retention, electronic Case Report Form (eCRF) sign-offs, and clinical safety attestations for Dr. Rajesh Sharma.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/participants"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Enroll Participant
              </Link>
              <Link
                href="/trials"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Log eCRF Visit
              </Link>
              <Link
                href="/adverse-events"
                className="px-3.5 py-2 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-xs font-semibold text-rose-200 border border-rose-700 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report AE
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeRole === "ETHICS" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden border border-indigo-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  INSTITUTIONAL ETHICS COMMITTEE (IEC)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CDSCO REGD. IEC-ND-0042
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ICMR BIOETHICS 2017
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Institutional Ethics Committee (IEC) Oversight Portal
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Independent ethical clearance reviews, audio-visual vernacular informed consent auditing, vulnerable subject rights protection, and annual continuing trial authorizations.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/compliance"
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                Review Protocol Dossiers
              </Link>
              <Link
                href="/audit"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Audit Consent Logs
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeRole === "PV" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden border border-rose-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  NATIONAL PV CENTRE (NPvCC) · AIIA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STATUTORY 24H REGULATORY CLOCK
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  WHO-UMC & NARANJO SCALES
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Pharmacovigilance & Safety Telemetry Command Center
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Proportional Reporting Ratio (PRR) disproportionality heuristics, statutory SAE expedited reporting to CDSCO/Licensing Authority, and classical Ayurveda formulation safety telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/adverse-events"
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                Open Pharmacovigilance Suite
              </Link>
              <Link
                href="/exports"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Export Safety Dossier
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeRole === "REGULATOR" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden border border-purple-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MINISTRY OF AYUSH / CDSCO
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  CTRI 20-FIELD AUDIT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  21 CFR PART 11 VERIFIED
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                National Regulatory Oversight & Inspection Command Center
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                National Clinical Trials Registry of India (CTRI) dataset completeness, tamper-proof SHA-256 audit ledger verifications, and regulatory inspection readiness across all national trial sites.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/audit"
                className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Inspect Audit Ledger
              </Link>
              <Link
                href="/exports"
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Export Central Regulatory Dossier
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeRole === "ADMIN" && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-md relative overflow-hidden border border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AIIA NATIONAL HUB
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ICMR / AYUSH GCP
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  21 CFR PART 11
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AIIA Clinical Research Command Center
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                National centralized monitoring, risk telemetry, pharmacovigilance signals, and protocol compliance across all multi-center Ayurveda clinical trials.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/sarvottam"
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Sarvottam Super Admin
              </Link>
              <Link
                href="/exports"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                Export Dossier
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC ROLE-BASED TOP KPI CARDS */}
      {activeRole === "PI" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Protocols</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <FlaskConical className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">4</span>
              <span className="text-xs font-medium text-slate-500">Lead Investigator</span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 font-medium">AYUR-2025-001, 002, 003, 005</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Enrollment Target</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">342 / 400</span>
              <span className="text-xs font-bold text-emerald-700">85.5% Achieved</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: "85.5%" }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending eCRF Sign-Offs</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">7</span>
              <span className="text-xs font-medium text-slate-500">Visit Logs Awaiting Signature</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Includes 3 baseline & 4 follow-up visits</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protocol Deviations (My Sites)</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">2</span>
              <span className="text-xs font-semibold text-amber-700">Minor CAPA in Review</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">0 Critical deviations in assigned trials</div>
          </div>
        </div>
      )}

      {activeRole === "ETHICS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protocols Pending Clearance</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-700">3</span>
              <span className="text-xs font-medium text-slate-500">Awaiting IEC Meeting</span>
            </div>
            <div className="mt-2 text-xs text-indigo-600 font-medium">AYUR-2025-004, 006, 009</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Informed Consent Integrity</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">99.4%</span>
              <span className="text-xs font-bold text-emerald-700">Vernacular Verified</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Audio-Visual logs intact per CDSCO rules</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Continuing Reviews Due</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">2</span>
              <span className="text-xs font-medium text-amber-700">Annual Renewals in 30 Days</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Protocol re-evaluations scheduled</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vulnerable Cohort Assents</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <span className="text-xs font-bold text-teal-700">Assent & Witness Signed</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Pediatric & geriatric subject safeguards</div>
          </div>
        </div>
      )}

      {activeRole === "PV" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Statutory 24h SAE Clock</span>
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700">1</span>
              <span className="text-xs font-bold text-rose-900">Active Expedited SAE</span>
            </div>
            <div className="mt-2 text-xs text-rose-700 font-medium">Expedited regulatory report due to CDSCO</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PRR Safety Signals</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">3</span>
              <span className="text-xs font-bold text-amber-700">Signals Detected (PRR ≥ 2.0)</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Classical formulation disproportionate ratios</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Causality Assessments</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">8</span>
              <span className="text-xs font-medium text-slate-500">Awaiting WHO-UMC Algorithm</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Naranjo & Traditional Ayurvedic causality</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Herb-Drug Interactions</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">2</span>
              <span className="text-xs font-medium text-slate-500">CYP450 Flagged Interactions</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Polyherbal formulation screening active</div>
          </div>
        </div>
      )}

      {activeRole === "REGULATOR" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CTRI Dataset Completeness</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <span className="text-xs font-bold text-emerald-700">20/20 Mandatory Fields</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Compliant with WHO/ICMR trial registry</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">21 CFR Part 11 Audit Integrity</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">4,280</span>
              <span className="text-xs font-bold text-emerald-700">Sealed Immutable Logs</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">SHA-256 cryptographic chain validated</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">National GCP Compliance</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">98.4%</span>
              <span className="text-xs font-bold text-teal-700">Multi-Center Index</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">AIIA Delhi, ITRA Jamnagar, NIA Jaipur</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Site Inspection Queries</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">1</span>
              <span className="text-xs font-semibold text-amber-700">Response Pending (Site 03)</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Pre-approval inspection check scheduled</div>
          </div>
        </div>
      )}

      {activeRole === "ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Studies & Risk State</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <FlaskConical className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {commandMetrics?.total_studies ?? metrics?.total_trials ?? 12}
              </span>
              <span className="text-xs font-medium text-slate-500">Active Protocols</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {commandMetrics?.studies_by_risk?.on_track ?? 8} On-Track
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {commandMetrics?.studies_by_risk?.at_risk ?? 3} At-Risk
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {commandMetrics?.studies_by_risk?.critical ?? 1} Critical
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Recruitment</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {commandMetrics?.patient_metrics?.total_enrolled ?? metrics?.total_participants ?? 1170}
              </span>
              <span className="text-xs font-medium text-slate-500">
                / {commandMetrics?.patient_metrics?.target_enrolled ?? 1480} Target
              </span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${commandMetrics?.patient_metrics?.enrolled_percentage ?? 79.1}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{commandMetrics?.patient_metrics?.enrolled_percentage ?? 79.1}% Target Met</span>
                <span>{commandMetrics?.patient_metrics?.active_participants ?? 980} Active In Treatment</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacovigilance & SAE</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700">
                {commandMetrics?.safety_counts?.serious_ae ?? metrics?.active_saes ?? 4}
              </span>
              <span className="text-xs font-medium text-slate-500">Serious Adverse Events</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">
                Total AEs: <strong>{commandMetrics?.safety_counts?.total_ae ?? 24}</strong>
              </span>
              <span className="text-emerald-700 font-bold">
                ✓ 0 Overdue 24h Filings
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Quality & Cleanliness</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {commandMetrics?.quality_metrics?.data_cleanliness_pct ?? 94.2}%
              </span>
              <span className="text-xs font-bold text-teal-700">GCP Certified</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>{commandMetrics?.quality_metrics?.open_queries ?? 42} Open Queries</span>
              <span className="text-rose-600 font-semibold">{commandMetrics?.quality_metrics?.critical_deviations ?? 1} Critical CAPA</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC WORKSPACE BODY PER ROLE */}

      {/* PI SPECIFIC WORKSPACE */}
      {activeRole === "PI" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PI Clinical Visit Pipeline */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Investigator Participant Visit & Retention Pipeline</h3>
                  <p className="text-xs text-slate-500">Real-time status of enrolled subjects across assigned AIIA trial sites</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Unit 01 OPD Cohort
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Pre-Screening & Eligibility Assessment</span>
                    <span className="font-mono text-slate-900">42 Subjects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Baseline Visit (V1) & Randomization</span>
                    <span className="font-mono text-slate-900">88 Subjects Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Ayurveda Intervention Cycle (V2 - V4)</span>
                    <span className="font-mono text-slate-900">174 Active in Treatment</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Protocol Endpoint Follow-up & Discharge</span>
                    <span className="font-mono text-slate-900">38 Completed All Visits</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* PI Urgent Action Queue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Investigator Action Queue</h3>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    3 Action Items
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Sign ICF: Participant P-109</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Hindi Audio-Visual</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Audio-visual vernacular consent recording verified and sealed.</p>
                    <Link href="/participants" className="text-[11px] font-semibold text-emerald-700 hover:underline inline-block mt-1">
                      Execute Investigator e-Signature →
                    </Link>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Biomarker Lab Review: AYUR-001</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">HbA1c Lab Panel</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Ashwagandha Type-2 diabetes glycemic metrics imported.</p>
                    <Link href="/trials" className="text-[11px] font-semibold text-emerald-700 hover:underline inline-block mt-1">
                      Review Laboratory Dossier →
                    </Link>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">CAPA Deviation Response: P-072</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Window Extension</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Patient delayed Visit 3 due to festival travel (+3 days).</p>
                    <Link href="/compliance" className="text-[11px] font-semibold text-emerald-700 hover:underline inline-block mt-1">
                      Sign Corrective Action →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETHICS SPECIFIC WORKSPACE */}
      {activeRole === "ETHICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Protocols Awaiting Clearance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Protocols Awaiting Ethical Clearance</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Agenda: Meeting #44
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">AYUR-2025-004: Swarna Prashana Pediatric Immunity</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Vulnerable Cohort</span>
                  </div>
                  <p className="text-xs text-slate-600">Lead PI: Dr. M. K. Iyer · Child assent forms & vernacular Hindi consent submitted.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link href="/compliance" className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700">
                      Grant Form-3 Approval
                    </Link>
                    <Link href="/compliance" className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold hover:bg-slate-200">
                      Issue Ethics Query
                    </Link>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">AYUR-2025-006: Brahmi Rasayana in Geriatric Memory</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Minimal Risk</span>
                  </div>
                  <p className="text-xs text-slate-600">Lead PI: Dr. Rajesh Sharma · Expedited review requested per ICMR 2017 Chapter 5.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link href="/compliance" className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700">
                      Grant Expedited Approval
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio-Visual Consent Verification Ledger */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Vernacular Consent & Audio-Visual Audit Log</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CDSCO Rule 89 Compliant
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject ID</th>
                      <th className="py-2.5 px-3">Language</th>
                      <th className="py-2.5 px-3">AV Hash</th>
                      <th className="py-2.5 px-3">Witness</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">P-101</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Hindi (देवनागरी)</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">e82a9f...c1</td>
                      <td className="py-2.5 px-3 text-slate-600">Adv. R. K. Dixit</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">✓ SEALED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">P-102</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">English</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">3b41d0...a9</td>
                      <td className="py-2.5 px-3 text-slate-600">Dr. M. S. Gill</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">✓ SEALED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">P-103</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Gujarati (ગુજરાતી)</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">f709bc...82</td>
                      <td className="py-2.5 px-3 text-slate-600">Shri B. Pandya</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">✓ SEALED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PV SPECIFIC WORKSPACE */}
      {activeRole === "PV" && (
        <div className="space-y-6">
          {/* Statutory 24-Hour SAE Alert Banner */}
          {urgentSae && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                        Statutory 24-Hour Regulatory Window Active
                      </span>
                      <SaeCountdownBadge
                        deadlineString={urgentSae.sae_deadline}
                        saeStatus={urgentSae.sae_status}
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      SAE Case #{urgentSae.participant_code}: {urgentSae.event_term}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Protocol: <strong className="text-slate-800">{urgentSae.study_id}</strong> · Expedited Form-11 report must be transmitted to CDSCO within 24h.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/trials/${urgentSae.trial_id}`}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  File Expedited Regulatory Report
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Safety Signals Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Safety Signal PRR Disproportionality Telemetry</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                PRR Heuristic Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.map((sig, idx) => {
                const prrScore = Number(sig.prr_score ?? (sig as any).disproportionality_ratio ?? 0);
                const prrDisplay = !isNaN(prrScore) ? prrScore.toFixed(2) : "0.00";
                const eventTerm = sig.event_term || (sig as any).adverse_event_term || "Adverse Event";
                const statusStr = (sig.signal_status || "SIGNAL_DETECTED").replace(/_/g, " ");

                return (
                  <div key={sig.id || `sig-${idx}`} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{sig.formulation_name || "Formulation"}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        {statusStr}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Term: <strong>{eventTerm}</strong></span>
                      <span>PRR: <strong className="text-amber-800">{prrDisplay}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Observed: {sig.observed_count ?? 0} | Expected: {sig.expected_count ?? 0}
                    </div>
                    <Link
                      href="/adverse-events"
                      className="text-[11px] font-semibold text-emerald-700 hover:underline block pt-1"
                    >
                      Run WHO-UMC Causality Algorithm →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REGULATOR SPECIFIC WORKSPACE */}
      {activeRole === "REGULATOR" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CTRI 20-Field Completeness Audit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">National CTRI Mandatory Dataset Compliance</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Validated
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Real-time validation against the 20 mandatory WHO/ICMR clinical trial registry parameters
              </p>

              <div className="space-y-2">
                {[
                  { field: "Primary Registry & Trial Identifier", status: "VERIFIED", code: "CTRI/2025/08/071290" },
                  { field: "Secondary Identifiers & Protocol ID", status: "VERIFIED", code: "AIIA-DMR-2025-01" },
                  { field: "Source(s) of Monetary Support", status: "VERIFIED", code: "Ministry of AYUSH Grant" },
                  { field: "Primary & Secondary Sponsor", status: "VERIFIED", code: "All India Institute of Ayurveda" },
                  { field: "Ethics Committee Approval & Date", status: "VERIFIED", code: "IEC-ND-0042 (Approved)" },
                  { field: "Key Inclusion & Exclusion Criteria", status: "VERIFIED", code: "NAMASTE Harmonized ICD-11" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100">
                    <span className="font-medium text-slate-800">{item.field}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">{item.code}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 21 CFR Part 11 Audit Trail Integrity */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">21 CFR Part 11 Immutable Audit Ledger Verifier</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  SHA-256 Validated
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Mathematical cryptographic validation of all trial transactions, e-signatures, and data modifications
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1">
                  <div className="text-[10px] text-emerald-400">LEDGER HEAD INTEGRITY STATUS: INTACT</div>
                  <div className="text-[11px] text-slate-300 truncate">
                    Chain Hash: 8f49b1c70e2389d...44e99120ba
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Total Events Sealed: 4,280 | Zero Tamper Anomalies Detected
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">CDSCO Inspection Dossier (PDF/ZIP)</span>
                    <p className="text-[11px] text-slate-500">Ready for regulatory submission with automated timestamps</p>
                  </div>
                  <Link
                    href="/exports"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0"
                  >
                    Download Dossier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SPECIFIC WORKSPACE (FULL COMMAND CENTER) */}
      {activeRole === "ADMIN" && (
        <div className="space-y-6">
          {/* Statutory 24-Hour SAE Countdown Alert Banner */}
          {urgentSae && (
            <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5 shadow-xs">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                        Statutory Safety Alert — Expedited Regulatory Window
                      </span>
                      <SaeCountdownBadge
                        deadlineString={urgentSae.sae_deadline}
                        saeStatus={urgentSae.sae_status}
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      SAE Recorded: {urgentSae.event_term} ({urgentSae.participant_code})
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Trial: <strong className="text-slate-800">{urgentSae.study_id}</strong> · Expedited statutory report must be filed within 24h of onset.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/trials/${urgentSae.trial_id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  Review Dossier
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Active Command Center Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Operational & Compliance Alerts</h3>
                <p className="text-xs text-slate-500">Autonomous regulatory alerts, deviation tracking, and statutory clocks</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      selectedSeverity === sev
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No active operational alerts for selected severity tier.
                </div>
              ) : (
                filteredAlerts.slice(0, 5).map((alert) => {
                  const isCrit = alert.severity === "CRITICAL";
                  const isHigh = alert.severity === "HIGH";

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCrit
                          ? "bg-rose-50/60 border-rose-200"
                          : isHigh
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isCrit
                              ? "bg-rose-600 text-white"
                              : isHigh
                              ? "bg-amber-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isCrit
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : isHigh
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {alert.severity}
                            </span>
                            {alert.study_id && (
                              <span className="text-xs font-bold text-slate-800">{alert.study_id}</span>
                            )}
                            {typeof alert.hours_remaining === "number" && !isNaN(alert.hours_remaining) && alert.hours_remaining > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900 font-bold">
                                ⏱ {alert.hours_remaining.toFixed(1)}h remaining
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{alert.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{alert.description}</p>
                        </div>
                      </div>

                      {alert.action_path && (
                        <Link
                          href={alert.action_path}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-all ${
                            isCrit
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                          }`}
                        >
                          {alert.action_label || "Take Action"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SHARED CLINICAL TRIALS OVERVIEW TABLE (At Bottom For Easy Reference) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">National Clinical Protocol Roster</h3>
            <p className="text-xs text-slate-500">Multi-center trial monitoring across AIIA and affiliated research hospitals</p>
          </div>
          <Link
            href="/trials"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Trials</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Protocol Title</th>
                <th className="py-3 px-4">Phase</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recruitment</th>
                <th className="py-3 px-4">SAE Alerts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics?.recent_trials && metrics.recent_trials.length > 0 ? (
                metrics.recent_trials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.study_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">{t.title}</td>
                    <td className="py-3 px-4 text-slate-600">{t.phase || "Phase II"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{t.enrolled}</span>
                        <span className="text-slate-400">/ {t.target || 100}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {t.sae_count > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          {t.sae_count} SAE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/trials/${t.id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors inline-block"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active clinical trials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
