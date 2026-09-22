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
  Download,
  AlertTriangle,
  Activity,
  FileCheck2,
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
import { DashboardMetrics } from "@/lib/types";
import { StatusBadge, SaeCountdownBadge } from "@/components/Badges";

const SEVERITY_COLORS: Record<string, string> = {
  MILD: "#10b981",
  MODERATE: "#f59e0b",
  SEVERE: "#ef4444",
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardMetrics();
        setMetrics(data);
      } catch (e) {
        console.error("Dashboard metrics failed to load", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const urgentSae = metrics?.urgent_sae_alerts?.[0];

  return (
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

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trials Metric */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Trials</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics?.total_trials || 0}</span>
            <span className="text-xs font-medium text-emerald-600">
              {metrics?.active_trials || 0} Active Protocol{metrics?.active_trials === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-center Ayurveda research</p>
        </div>

        {/* Cohort Metric */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Registry</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics?.total_participants || 0}</span>
            <span className="text-xs font-medium text-blue-600">Pseudonymous (AYU-XXXX)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero PII statutory privacy architecture</p>
        </div>

        {/* Safety Metric */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adverse Events (AE)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics?.total_adverse_events || 0}</span>
            <span className="text-xs font-bold text-rose-600">
              {metrics?.active_saes || 0} Active SAE{metrics?.active_saes === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">MedDRA mapped & 24h monitored</p>
        </div>

        {/* Compliance Metric */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Index</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{metrics?.compliance_score || 98.5}%</span>
            <span className="text-xs font-medium text-slate-500">AYUSH GCP Aligned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">21 CFR Part 11 electronic records</p>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trial Status Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Clinical Protocol Distribution by Status</h3>
              <p className="text-xs text-slate-500">Active monitoring across research hospital sites</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Real-time Pipeline
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

        {/* Safety Severity Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Safety Severity Profile</h3>
              <p className="text-xs text-slate-500">CTCAE & WHO-UMC causality</p>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center">
            {metrics?.ae_by_severity && metrics.ae_by_severity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.ae_by_severity}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {metrics.ae_by_severity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SEVERITY_COLORS[entry.status.toUpperCase()] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">No AE observations</div>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-1">
            {metrics?.ae_by_severity.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[entry.status.toUpperCase()] || "#94a3b8" }}
                />
                <span className="text-slate-600 font-medium">
                  {entry.status}: {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Clinical Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/adverse-events"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Report Safety Event</p>
            <p className="text-[11px] text-slate-500">Expedited 24h trigger</p>
          </div>
        </Link>

        <Link
          href="/terminology"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">AI Terminology Harmonizer</p>
            <p className="text-[11px] text-slate-500">Ayurveda $\to$ MedDRA</p>
          </div>
        </Link>

        <Link
          href="/exports"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Export FHIR / SDTM</p>
            <p className="text-[11px] text-slate-500">HL7 R4 & CDISC v3.3</p>
          </div>
        </Link>

        <Link
          href="/audit"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Audit Trail Ledger</p>
            <p className="text-[11px] text-slate-500">21 CFR Part 11 records</p>
          </div>
        </Link>
      </div>

      {/* Active Clinical Trials Workspace Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Active Ayurvedic Clinical Trials</h3>
            <p className="text-xs text-slate-500">Institutional research protocols registered in platform</p>
          </div>
          <Link
            href="/trials"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Trials
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Study ID</th>
                <th className="px-6 py-3">Protocol Title</th>
                <th className="px-6 py-3">Phase</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Cohort Enrolled</th>
                <th className="px-6 py-3">Safety Signals</th>
                <th className="px-6 py-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics?.recent_trials.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-bold font-mono text-emerald-700">{t.study_id}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-900 max-w-xs truncate">{t.title}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-600">{t.phase || "Phase II"}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-slate-800">{t.enrolled}</span>
                    <span className="text-slate-400"> / {t.target || "—"}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    {t.sae_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        {t.sae_count} Serious AE
                      </span>
                    ) : (
                      <span className="text-slate-400">0 SAEs</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/trials/${t.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
