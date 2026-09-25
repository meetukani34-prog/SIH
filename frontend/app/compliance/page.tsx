"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  FileText,
  AlertCircle,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { EthicsReview, ProtocolDeviation, DataQualityQuery } from "@/lib/types";
import { StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";
import { AuditModal } from "@/components/AuditModal";

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<"ethics" | "deviations" | "queries">("ethics");
  const [reviews, setReviews] = useState<EthicsReview[]>([]);
  const [deviations, setDeviations] = useState<ProtocolDeviation[]>([]);
  const [queries, setQueries] = useState<DataQualityQuery[]>([]);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ethics Adjudication state
  const [selectedReview, setSelectedReview] = useState<EthicsReview | null>(null);
  const [targetDecision, setTargetDecision] = useState<string>("");
  const [showAuditModal, setShowAuditModal] = useState(false);

  // CAPA Deviation Modal state
  const [selectedDeviation, setSelectedDeviation] = useState<ProtocolDeviation | null>(null);
  const [showCapaModal, setShowCapaModal] = useState(false);
  const [capaPlan, setCapaPlan] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [capaNotes, setCapaNotes] = useState("");
  const [capaSubmitting, setCapaSubmitting] = useState(false);

  // Data Quality Query Modal state
  const [selectedQuery, setSelectedQuery] = useState<DataQualityQuery | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryResolutionText, setQueryResolutionText] = useState("");
  const [querySubmitting, setQuerySubmitting] = useState(false);

  // Filter
  const [search, setSearch] = useState("");

  const currentUser = getCurrentUser();

  const loadData = async () => {
    try {
      const [rData, scData, devData, qData] = await Promise.all([
        api.getEthicsReviews(),
        api.getComplianceScorecard(),
        api.getProtocolDeviations({ limit: 50 }).catch(() => []),
        api.getDataQualityQueries({ limit: 50 }).catch(() => []),
      ]);
      setReviews(rData);
      setScorecard(scData);
      setDeviations(devData);
      setQueries(qData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjudicate = (review: EthicsReview, decision: string) => {
    setSelectedReview(review);
    setTargetDecision(decision);
    setShowAuditModal(true);
  };

  const handleConfirmDecision = async (reason: string) => {
    if (!selectedReview) return;
    try {
      await api.updateEthicsReview(selectedReview.id, {
        status: targetDecision as any,
        decision_date: new Date().toISOString().split("T")[0],
        reason_for_change: reason,
      });
      setSelectedReview(null);
      loadData();
    } catch (err: any) {
      alert(`Adjudication failed: ${err.message}`);
    }
  };

  const handleOpenCapa = (dev: ProtocolDeviation) => {
    setSelectedDeviation(dev);
    setCapaPlan(dev.capa_plan || "");
    setRootCause(dev.root_cause || "");
    setCapaNotes("");
    setShowCapaModal(true);
  };

  const handleSaveCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviation) return;
    setCapaSubmitting(true);
    try {
      await api.resolveProtocolDeviation(selectedDeviation.id, {
        capa_plan: capaPlan,
        root_cause: rootCause,
        resolution_notes: capaNotes,
      });
      setShowCapaModal(false);
      setSelectedDeviation(null);
      loadData();
    } catch (err: any) {
      alert(`Failed to save CAPA: ${err.message}`);
    } finally {
      setCapaSubmitting(false);
    }
  };

  const handleOpenQuery = (q: DataQualityQuery) => {
    setSelectedQuery(q);
    setQueryResolutionText(q.resolution_text || "");
    setShowQueryModal(true);
  };

  const handleSaveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    setQuerySubmitting(true);
    try {
      await api.resolveDataQualityQuery(selectedQuery.id, queryResolutionText);
      setShowQueryModal(false);
      setSelectedQuery(null);
      loadData();
    } catch (err: any) {
      alert(`Failed to resolve query: ${err.message}`);
    } finally {
      setQuerySubmitting(false);
    }
  };

  const canAdjudicate = currentUser?.role === "ETHICS" || currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Ethics & Regulatory Oversight Suite
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ICMR / AYUSH GCP
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            21 CFR PART 11
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          IEC review dossiers, protocol deviation CAPAs, and eCRF data quality discrepancies
        </p>
      </div>

      {/* Compliance Scorecard KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Index</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {scorecard?.compliance_rate_percent || 98.5}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">GCP Validated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dossiers ratified without lapsed review</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Protocols</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{scorecard?.approved || 0}</span>
            <span className="text-xs font-medium text-slate-500">of {scorecard?.total_reviews || 0} submitted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active clearance certificates issued</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protocol Deviations</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{deviations.length}</span>
            <span className="text-xs font-bold text-rose-600">
              {deviations.filter((d) => d.severity === "CRITICAL").length} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CAPA tracking and root cause logged</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Quality Queries</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-700">{queries.length}</span>
            <span className="text-xs font-medium text-slate-500">
              {queries.filter((q) => q.status === "OPEN").length} Open Queries
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Discrepancy resolution workflow active</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("ethics")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ethics"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Ethics Committee Clearances ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("deviations")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "deviations"
              ? "border-amber-600 text-amber-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Protocol Deviations & CAPA</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
            {deviations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("queries")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "queries"
              ? "border-teal-600 text-teal-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Data Quality & Queries</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
            {queries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Ethics Reviews */}
      {activeTab === "ethics" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Ethics Committee Submissions & Clearances</h3>
              <p className="text-xs text-slate-500">Statutory review dossiers with full audit trails</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Study Reference</th>
                  <th className="px-6 py-3.5">Ethics Committee</th>
                  <th className="px-6 py-3.5">Review Classification</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Decision Status</th>
                  <th className="px-6 py-3.5">Valid Until</th>
                  <th className="px-6 py-3.5 text-right">Committee Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-emerald-700">{r.trial_study_id || "Study"}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.trial_title}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.committee_name}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {r.review_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(r.submission_date)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatDate(r.expiry_date)}</td>
                    <td className="px-6 py-4 text-right">
                      {canAdjudicate && r.status !== "APPROVED" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAdjudicate(r, "APPROVED")}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAdjudicate(r, "CONDITIONAL")}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors"
                          >
                            Conditional
                          </button>
                          <button
                            onClick={() => handleAdjudicate(r, "REJECTED")}
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Ratified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Protocol Deviations & CAPA Log */}
      {activeTab === "deviations" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Protocol Deviations & Corrective Action (CAPA) Log</h3>
              <p className="text-xs text-slate-500">
                18 tracked deviations classified by severity with root cause analyses
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ICH E6(R2) / GCP §5.20
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Code & Protocol</th>
                  <th className="px-6 py-3.5">Deviation Type</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Root Cause & CAPA</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deviations.map((dev) => {
                  const isCrit = dev.severity === "CRITICAL";
                  const isMaj = dev.severity === "MAJOR";

                  return (
                    <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900">{dev.deviation_code}</div>
                        <div className="text-[11px] text-slate-500">{dev.trial?.study_id || "Protocol"}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{dev.deviation_type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isCrit
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isMaj
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {dev.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-600 leading-snug">{dev.description}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            dev.resolution_status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {dev.resolution_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {dev.capa_plan ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-semibold text-slate-800 block truncate">
                              Plan: {dev.capa_plan}
                            </span>
                            {dev.root_cause && (
                              <span className="text-[10px] text-slate-400 block truncate">
                                Cause: {dev.root_cause}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-semibold italic">CAPA Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenCapa(dev)}
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          {dev.resolution_status === "RESOLVED" ? "View CAPA" : "File CAPA"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Quality & Discrepancies */}
      {activeTab === "queries" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Electronic CRF Discrepancy & Query Ledger</h3>
              <p className="text-xs text-slate-500">
                42 data cleanliness queries across screening, vitals, labs, and visit timelines
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              CDISC SDTM Conformance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Query Code & Study</th>
                  <th className="px-6 py-3.5">Subject & Visit</th>
                  <th className="px-6 py-3.5">Field Name</th>
                  <th className="px-6 py-3.5">Discrepancy Category</th>
                  <th className="px-6 py-3.5">Query Text</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {queries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">{q.query_code}</div>
                      <div className="text-[11px] text-slate-500">{q.trial?.study_id || "Protocol"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-emerald-800 font-semibold">{q.participant?.participant_code || "AYU-XXXX"}</div>
                      <div className="text-[11px] text-slate-400">{q.visit_name || "Screening"}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{q.field_name}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.discrepancy_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-slate-600">{q.query_text}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          q.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenQuery(q)}
                        className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        {q.status === "RESOLVED" ? "View Answer" : "Answer Query"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 21 CFR Part 11 Ethics Adjudication Modal */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        onConfirm={handleConfirmDecision}
        title="Institutional Ethics Ratification"
        description={`You are officially recording the ethics decision '${targetDecision}' for study '${selectedReview?.trial_study_id}'. State committee meeting minutes or conditions.`}
        confirmButtonText="Ratify Adjudication"
      />

      {/* CAPA Plan Resolution Modal */}
      {showCapaModal && selectedDeviation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {selectedDeviation.deviation_code}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">
                  Corrective & Preventive Action (CAPA) Dossier
                </h3>
              </div>
              <button
                onClick={() => setShowCapaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCapa} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Deviation Incident:</span>
                <p className="text-slate-800 font-semibold">{selectedDeviation.description}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                  <span>Type: <strong>{selectedDeviation.deviation_type}</strong></span>
                  <span>Severity: <strong>{selectedDeviation.severity}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Root Cause Analysis (5-Whys Methodology)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Identify underlying protocol, site, or participant causes..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corrective & Preventive Action Plan (CAPA)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify protocol amendment, staff retraining, or monitoring controls..."
                  value={capaPlan}
                  onChange={(e) => setCapaPlan(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Regulatory Resolution Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certified by Lead CRC & Ethics Committee reported"
                  value={capaNotes}
                  onChange={(e) => setCapaNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCapaModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={capaSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer transition-colors"
                >
                  {capaSubmitting ? "Ratifying..." : "Ratify CAPA & Resolve"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Quality Query Resolution Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedQuery.query_code}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">
                  eCRF Data Query Resolution & Audit Trail
                </h3>
              </div>
              <button
                onClick={() => setShowQueryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuery} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Data Discrepancy:</span>
                <p className="text-slate-800 font-semibold">{selectedQuery.query_text}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                  <span>Field: <strong>{selectedQuery.field_name}</strong></span>
                  <span>Category: <strong>{selectedQuery.discrepancy_type}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Investigator Resolution / Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide verifiable clinical explanation or corrected value backed by source medical records..."
                  value={queryResolutionText}
                  onChange={(e) => setQueryResolutionText(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={querySubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer transition-colors"
                >
                  {querySubmitting ? "Resolving..." : "Submit Resolution & Close Query"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
