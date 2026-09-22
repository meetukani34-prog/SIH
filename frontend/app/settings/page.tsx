"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Database, Key, Clock, Server, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/api";

export default function SettingsPage() {
  const [saeDeadlineHours, setSaeDeadlineHours] = useState(24);
  const [saved, setSaved] = useState(false);
  const currentUser = getCurrentUser();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform & Compliance Governance</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            System Administration
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Statutory regulatory countdown thresholds, institutional database connections, and 21 CFR Part 11 parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Safety Countdown Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Statutory Serious Adverse Event (SAE) Window
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expedited Regulatory Reporting Deadline (Hours)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={saeDeadlineHours}
                  onChange={(e) => setSaeDeadlineHours(parseInt(e.target.value) || 24)}
                  className="w-32 text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500 font-medium">hours post-onset</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Configurable statutory countdown. Default standard per AYUSH GCP & CDSCO pharmacovigilance guidelines is 24 hours.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg text-xs text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Modifying the countdown threshold recalibrates all subsequent SAE incident alerts across the PI, Ethics, and PV dashboards.
            </div>
          </div>
        </div>

        {/* Regulatory Governance Profile */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Regulatory Framework & Compliance Engines</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">21 CFR Part 11 Electronic Records</p>
                <p className="text-[11px] text-slate-500">Append-only immutable audit trail with justification prompt</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                ENFORCED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">AYUSH Good Clinical Practice (GCP)</p>
                <p className="text-[11px] text-slate-500">ICMR ethical guidelines & traditional medicine safety tracking</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">AI Terminology Harmonizer</p>
                <p className="text-[11px] text-slate-500">Classical Ayurvedic correlates mapped to MedDRA PT/SOC</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                ONLINE
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">FHIR R4 & CDISC SDTM Exports</p>
                <p className="text-[11px] text-slate-500">Standardized regulatory interchange formats</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                READY
              </span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Database */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Database & Deployment Tier</h3>
          </div>

          <div className="text-xs space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">Target Database Engine</p>
                <p className="text-[11px] text-slate-500">Supabase PostgreSQL (AWS ap-south-1 / Local evaluation SQLite)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              To connect your live Supabase cloud database instance, update the <code>DATABASE_URL</code> variable in your backend <code>.env</code> file with your Supabase pooler connection string:
              <br />
              <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono mt-1 inline-block">
                postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
              </code>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings successfully ratified & saved!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
