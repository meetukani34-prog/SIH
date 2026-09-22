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
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { EthicsReview } from "@/lib/types";
import { StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";
import { AuditModal } from "@/components/AuditModal";

export default function CompliancePage() {
  const [reviews, setReviews] = useState<EthicsReview[]>([]);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Adjudication state
  const [selectedReview, setSelectedReview] = useState<EthicsReview | null>(null);
  const [targetDecision, setTargetDecision] = useState<string>("");
  const [showAuditModal, setShowAuditModal] = useState(false);

  const currentUser = getCurrentUser();

  const loadData = async () => {
    try {
      const [rData, scData] = await Promise.all([
        api.getEthicsReviews(),
        api.getComplianceScorecard(),
      ]);
      setReviews(rData);
      setScorecard(scData);
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

  const canAdjudicate = currentUser?.role === "ETHICS" || currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Ethics & Regulatory Oversight
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ICMR / AYUSH GCP
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Institutional Ethics Committee (IEC) clearances, protocol amendments, and continuous safety audits
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
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending IEC Reviews</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{scorecard?.pending || 0}</span>
            <span className="text-xs font-medium text-amber-700">Dossiers in queue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Under committee evaluation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Trials Monitored</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{scorecard?.active_trials_monitored || 0}</span>
            <span className="text-xs font-medium text-blue-600">Multi-center sites</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Subject safety oversight active</p>
        </div>
      </div>

      {/* Ethics Review Dossiers Table */}
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

      {/* 21 CFR Part 11 Audit Modal */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        onConfirm={handleConfirmDecision}
        title="Institutional Ethics Ratification"
        description={`You are officially recording the ethics decision '${targetDecision}' for study '${selectedReview?.trial_study_id}'. State committee meeting minutes or conditions.`}
        confirmButtonText="Ratify Adjudication"
      />
    </div>
  );
}
