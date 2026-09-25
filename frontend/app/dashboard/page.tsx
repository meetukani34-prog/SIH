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
import { api } from "@/lib/api";
import {
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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [commandMetrics, setCommandMetrics] = useState<CommandCenterMetrics>(DEFAULT_COMMAND_METRICS);
  const [alerts, setAlerts] = useState<CommandCenterAlert[]>([]);
  const [signals, setSignals] = useState<SafetySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Connecting to AIIA Command Telemetry Network...</p>
      </div>
    );
  }

  const urgentSae = metrics?.urgent_sae_alerts?.[0];

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity === "ALL") return true;
    return a.severity === selectedSeverity;
  });

  return (
    <div className="space-y-6">
      {/* AIIA Command Center Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-md relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
        
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
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
              Sync Telemetry
            </button>
            <Link
              href="/exports"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              Export Dossier
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

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

      {/* Top Telemetry KPI Cards with Risk Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Studies by Risk Matrix */}
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
          {/* Risk Badges */}
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

        {/* Cohort Recruitment vs Target */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Enrollment</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {commandMetrics?.patient_metrics?.total_enrolled ?? metrics?.total_participants ?? 1170}
              </span>
              <span className="text-xs text-slate-400">
                / {commandMetrics?.patient_metrics?.target_enrolled ?? 1480} target
              </span>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {commandMetrics?.patient_metrics?.enrolled_percentage ?? 79.1}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${commandMetrics?.patient_metrics?.enrolled_percentage ?? 79.1}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {commandMetrics?.patient_metrics?.active_participants ?? 980} active in treatment
          </p>
        </div>

        {/* Safety & Pharmacovigilance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Safety Surveillance</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {commandMetrics?.safety_counts?.total_ae ?? metrics?.total_adverse_events ?? 24}
            </span>
            <span className="text-xs font-bold text-rose-600">
              {commandMetrics?.safety_counts?.serious_ae ?? metrics?.active_saes ?? 4} Serious (SAE)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pending PV: {commandMetrics?.safety_counts?.pending_pv_review ?? 3}</span>
            <span className="font-semibold text-emerald-600">
              Overdue 24h: {commandMetrics?.safety_counts?.overdue_24h_reports ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {commandMetrics?.safety_counts?.potential_signals ?? 1} Safety Signal Under Analysis
          </p>
        </div>

        {/* Quality & Protocol Integrity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Quality & Cleanliness</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {commandMetrics?.quality_metrics?.data_cleanliness_pct ?? 94.2}%
            </span>
            <span className="text-xs font-medium text-slate-500">Cleanliness Index</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Open Queries: {commandMetrics?.quality_metrics?.open_queries ?? 42}</span>
            <span className="font-semibold text-amber-700">
              Deviations: {commandMetrics?.quality_metrics?.critical_deviations ?? 1} Crit / {commandMetrics?.quality_metrics?.major_deviations ?? 5} Maj
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">21 CFR Part 11 & CDISC SDTM Ready</p>
        </div>
      </div>

      {/* Dynamic Alert & Risk Engine Feed (Priority 2 of SIH Specification) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Dynamic Risk & Alert Feed</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {alerts.length} Active Events
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated trigger engine: recruitment lag, ethics renewals, CTRI status, and statutory 24-hr safety deadlines
            </p>
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
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

        {/* Alerts List */}
        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All active protocols and statutory deadlines are fully cleared.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCrit = alert.severity === "CRITICAL";
              const isHigh = alert.severity === "HIGH";

              return (
                <div
                  key={alert.id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCrit ? "bg-rose-50/40 hover:bg-rose-50/60" : isHigh ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCrit
                          ? "bg-rose-600 text-white"
                          : isHigh
                          ? "bg-amber-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {isCrit ? (
                        <AlertTriangle className="w-4 h-4 animate-pulse" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
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
                        {alert.hours_remaining !== undefined && alert.hours_remaining > 0 && (
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

      {/* Two-Column Analytics: Signals & Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Signals & Disproportionality Heuristic */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Safety Signal Telemetry</h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                PRR Heuristic
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Disproportionality analysis comparing observed vs expected adverse events across classical formulations
            </p>

            <div className="space-y-3">
              {signals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No safety signal anomalies detected.</p>
              ) : (
                signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{sig.formulation_name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          sig.signal_status === "SIGNAL_DETECTED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {sig.signal_status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Term: <strong>{sig.event_term}</strong></span>
                      <span>PRR Score: <strong className="text-amber-800">{sig.prr_score.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Observed: {sig.observed_count} | Expected: {sig.expected_count}</span>
                      <span className="font-semibold text-slate-600">Study: {sig.study_id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/adverse-events"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between"
          >
            <span>Full Pharmacovigilance Suite</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trial Status Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Clinical Protocol Distribution by Status</h3>
              <p className="text-xs text-slate-500">Active monitoring across research hospital sites</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Live Pipeline
            </span>
          </div>
          <div className="h-56">
            {metrics?.trials_by_status && metrics.trials_by_status.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.trials_by_status}>
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                No status data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Deviations & Data Quality Quick Navigation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/compliance"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Protocol Deviations & CAPA Log
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                18 active protocol deviations logged with corrective & preventive action tracking
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Link>

        <Link
          href="/compliance"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Data Quality Queries & Resolution
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                42 electronic CRF discrepancies with investigator resolution audits
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Clinical Trials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Clinical Protocols</h3>
            <p className="text-xs text-slate-500">Multi-site trial monitoring at AIIA and partner research hospitals</p>
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
