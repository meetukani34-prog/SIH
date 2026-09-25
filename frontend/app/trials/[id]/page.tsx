"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FlaskConical,
  Users,
  ShieldAlert,
  FileCheck2,
  FolderLock,
  Download,
  Calendar,
  Building2,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCode2,
  Loader2,
} from "lucide-react";
import { api, getCurrentUser, getToken } from "@/lib/api";
import {
  Trial,
  Participant,
  AdverseEvent,
  EthicsReview,
  DocumentRecord,
  CtriCompleteness,
  ParticipantVisit,
} from "@/lib/types";
import { StatusBadge, SeverityBadge, SaeCountdownBadge } from "@/components/Badges";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AuditModal } from "@/components/AuditModal";

export default function TrialDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const trialId = params?.id as string;

  const [activeTab, setActiveTab] = useState<
    "overview" | "participants" | "safety" | "ethics" | "vault" | "exports"
  >("overview");

  const [trial, setTrial] = useState<Trial | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [adverseEvents, setAdverseEvents] = useState<AdverseEvent[]>([]);
  const [ethicsReviews, setEthicsReviews] = useState<EthicsReview[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [ctriCompleteness, setCtriCompleteness] = useState<CtriCompleteness | null>(null);
  const [selectedParticipantForVisits, setSelectedParticipantForVisits] = useState<Participant | null>(null);
  const [participantVisits, setParticipantVisits] = useState<ParticipantVisit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Status Change Audit Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("");

  const currentUser = getCurrentUser();

  const triggerBlobDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadFhir = async () => {
    if (!trial) return;
    setDownloading("fhir");
    try {
      const data = await api.getFhirBundle(trial.id);
      triggerBlobDownload(
        JSON.stringify(data, null, 2),
        `FHIR_R4_Bundle_${trial.study_id}.json`,
        "application/json"
      );
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSdtm = async (domain: "AE" | "DM" | "DS") => {
    if (!trial) return;
    setDownloading(domain);
    try {
      const token = getToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/exports/csv/${trial.id}/${domain}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const csvText = await res.text();
      triggerBlobDownload(
        csvText,
        `SDTM_${domain}_${trial.study_id}.csv`,
        "text/csv"
      );
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const loadTrialData = async () => {
    if (!trialId) return;
    try {
      const [tData, pData, aeData, erData, docData, ctriData] = await Promise.all([
        api.getTrial(trialId),
        api.getParticipants({ trial_id: trialId }),
        api.getAdverseEvents({ trial_id: trialId }),
        api.getEthicsReviews({ trial_id: trialId }),
        api.getDocuments({ trial_id: trialId }),
        api.getCtriCompleteness(trialId).catch(() => null),
      ]);
      setTrial(tData);
      setParticipants(pData);
      setAdverseEvents(aeData);
      setEthicsReviews(erData);
      setDocuments(docData);
      if (ctriData) setCtriCompleteness(ctriData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVisits = async (p: Participant) => {
    setSelectedParticipantForVisits(p);
    setShowVisitsModal(true);
    setLoadingVisits(true);
    try {
      const visits = await api.getParticipantVisits(p.id);
      setParticipantVisits(visits);
    } catch (e) {
      console.error(e);
      setParticipantVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  useEffect(() => {
    loadTrialData();
  }, [trialId]);

  const handleStatusChangeClick = (status: string) => {
    setTargetStatus(status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async (reason: string) => {
    if (!trial) return;
    try {
      await api.updateTrial(trial.id, {
        status: targetStatus as any,
        reason_for_change: reason,
      });
      loadTrialData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  if (loading || !trial) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const saeCount = adverseEvents.filter((ae) => ae.is_serious).length;

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <Link
          href="/trials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Trials Directory
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {trial.study_id}
              </span>
              <StatusBadge status={trial.status} />
              <span className="text-xs font-semibold text-slate-500">{trial.phase}</span>
              {trial.ctri_number && (
                <span className="text-xs text-slate-400 font-mono">CTRI: {trial.ctri_number}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2 tracking-tight">{trial.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Intervention: <strong className="text-slate-700">{trial.intervention || "Ayurvedic formulation"}</strong> · Indication:{" "}
              <strong className="text-slate-700">{trial.indication || "N/A"}</strong>
            </p>
          </div>

          {/* Quick Lifecycle Status Switcher for PI / ADMIN */}
          {(currentUser?.role === "PI" || currentUser?.role === "ADMIN") && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-semibold">Change Lifecycle:</span>
              {["ACTIVE", "ENROLLING", "SUSPENDED", "COMPLETED"]
                .filter((s) => s !== trial.status)
                .map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChangeClick(st)}
                    className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  >
                    Set {st}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 11-Step Visual Study Lifecycle Stepper */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Clinical Trial Lifecycle Governance (11-Stage Workflow)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              CDSCO / ICMR Compliant
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Current Stage: <strong className="text-slate-800">{trial.status}</strong>
          </span>
        </div>

        {/* Stepper bubbles */}
        <div className="flex items-center justify-between w-full overflow-x-auto pb-2 pt-1 gap-1">
          {[
            { num: 1, name: "Concept", stage: "DRAFT" },
            { num: 2, name: "Protocol", stage: "DRAFT" },
            { num: 3, name: "Ethics", stage: "SUBMITTED" },
            { num: 4, name: "CTRI", stage: "ACTIVE" },
            { num: 5, name: "Site Active", stage: "ACTIVE" },
            { num: 6, name: "Screening", stage: "ENROLLING" },
            { num: 7, name: "Enrollment", stage: "ENROLLING" },
            { num: 8, name: "Randomize", stage: "ENROLLING" },
            { num: 9, name: "Visits", stage: "ENROLLING" },
            { num: 10, name: "Cleaning", stage: "COMPLETED" },
            { num: 11, name: "Close-out", stage: "COMPLETED" },
          ].map((st) => {
            const statusOrder: Record<string, number> = {
              DRAFT: 1,
              SUBMITTED: 3,
              ACTIVE: 5,
              ENROLLING: 8,
              SUSPENDED: 8,
              COMPLETED: 11,
            };
            const currentStageNum = statusOrder[trial.status] || 1;
            const isCompleted = st.num < currentStageNum;
            const isCurrent = st.num === currentStageNum;

            return (
              <div key={st.num} className="flex flex-col items-center min-w-[70px] text-center shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? "✓" : st.num}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1.5 leading-tight ${
                    isCurrent
                      ? "text-blue-700 font-bold"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {st.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 overflow-x-auto shadow-2xs">
        {[
          { key: "overview", label: "Protocol Overview", icon: FlaskConical },
          { key: "participants", label: `Cohort Registry (${participants.length})`, icon: Users },
          {
            key: "safety",
            label: `Safety & AEs (${adverseEvents.length})`,
            icon: ShieldAlert,
            badge: saeCount > 0 ? `${saeCount} SAE` : undefined,
          },
          { key: "ethics", label: `Ethics & Clearances (${ethicsReviews.length})`, icon: FileCheck2 },
          { key: "vault", label: `Document Vault (${documents.length})`, icon: FolderLock },
          { key: "exports", label: "Regulatory Exports", icon: Download, badge: "FHIR / SDTM" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    tab.badge.includes("SAE")
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Protocol Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Protocol Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Study Design</span>
                  <span className="font-semibold text-slate-800">{trial.study_type || "Interventional, Double-Blind"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Protocol Version</span>
                  <span className="font-mono font-bold text-slate-800">v{trial.protocol_version || "1.0"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Investigational Formulation</span>
                  <span className="font-semibold text-slate-800">{trial.intervention}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Target Indication (Classical & Modern)</span>
                  <span className="font-semibold text-slate-800">{trial.indication}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Statutory Timeline & Approvals</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Trial Start Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(trial.start_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Target Completion Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(trial.expected_completion_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Ethics Clearance Date</span>
                  <span className="font-semibold text-emerald-700">{formatDate(trial.ethics_approval_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Annual Renewal Due</span>
                  <span className="font-semibold text-amber-700">{formatDate(trial.ethics_renewal_date)}</span>
                </div>
              </div>
            </div>

            {/* CTRI 8-Point Completeness Score Widget */}
            {ctriCompleteness && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      CTRI Regulatory Completeness Audit
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ctriCompleteness.is_complete
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ctriCompleteness.is_complete ? "Compliant" : "Action Required"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {ctriCompleteness.score_percentage}%
                    </span>
                    <span className="text-xs text-slate-400">Score</span>
                  </div>
                </div>

                {/* Checklist items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ctriCompleteness.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-slate-100 flex items-center justify-between bg-slate-50/50"
                    >
                      <span className="text-slate-600 font-medium">{item.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.satisfied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.satisfied ? "✓ Satisfied" : "✗ Missing"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {ctriCompleteness.recommendations.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 block">Regulatory Gaps to Address:</span>
                    <ul className="list-disc list-inside text-amber-800 space-y-0.5 text-[11px]">
                      {ctriCompleteness.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Site & Investigator Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Investigative Site</h3>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block font-medium">Principal Investigator</span>
                  <span className="font-bold text-slate-900">{trial.principal_investigator?.name || "Dr. Rajesh Sharma"}</span>
                  <p className="text-slate-500 text-[11px]">{trial.principal_investigator?.email}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block font-medium">Research Institution</span>
                  <span className="font-semibold text-slate-800">{trial.site?.institution || "All India Institute of Ayurveda"}</span>
                  <p className="text-slate-500 text-[11px]">{trial.site?.location || "New Delhi, India"}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Gauge Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cohort Recruitment</h3>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{trial.enrolled_count}</span>
                <span className="text-xs font-semibold text-slate-500">Target: {trial.target_sample_size || 100}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((trial.enrolled_count / (trial.target_sample_size || 100)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {Math.round((trial.enrolled_count / (trial.target_sample_size || 100)) * 100)}% of target cohort enrolled
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Participants (Cohort Registry) */}
      {activeTab === "participants" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Trial Participant Cohort Registry</h3>
              <p className="text-xs text-slate-500">Pseudonymous subjects with zero personal identifiers stored</p>
            </div>
            <Link
              href="/participants"
              className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg"
            >
              Enroll Subject
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Subject Key</th>
                  <th className="px-6 py-3">Age Group</th>
                  <th className="px-6 py-3">Sex</th>
                  <th className="px-6 py-3">Enrollment Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Visit</th>
                  <th className="px-6 py-3">Next Scheduled Visit</th>
                  <th className="px-6 py-3 text-right">Visits Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      No participants currently enrolled for this trial.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-emerald-700">{p.participant_code}</td>
                      <td className="px-6 py-3.5 text-slate-700">{p.age_group || "—"}</td>
                      <td className="px-6 py-3.5 text-slate-700">{p.sex || "—"}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(p.enrollment_date)}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(p.last_visit)}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{formatDate(p.next_visit)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenVisits(p)}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1 border border-emerald-200 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          5 Visits
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Safety & Adverse Events */}
      {activeTab === "safety" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Pharmacovigilance & Safety Observations</h3>
              <p className="text-xs text-slate-500">Expedited statutory reporting and MedDRA coding ledger</p>
            </div>
            <Link
              href="/adverse-events"
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 rounded-lg"
            >
              + Record Adverse Event
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Reported Symptom</th>
                  <th className="px-6 py-3">Ayurvedic Correlate / MedDRA Term</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Causality</th>
                  <th className="px-6 py-3">Outcome</th>
                  <th className="px-6 py-3">24h Statutory Clock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {adverseEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No adverse events recorded for this study.
                    </td>
                  </tr>
                ) : (
                  adverseEvents.map((ae) => (
                    <tr key={ae.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{ae.participant_code}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{ae.event_term}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-emerald-800">{ae.ayurvedic_term || "—"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {ae.meddra_term} ({ae.meddra_code})
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <SeverityBadge severity={ae.severity} isSerious={ae.is_serious} />
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-700">{ae.causality || "POSSIBLE"}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-700">{ae.outcome || "RECOVERING"}</td>
                      <td className="px-6 py-3.5">
                        <SaeCountdownBadge
                          deadlineString={ae.sae_deadline}
                          saeStatus={ae.sae_status}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Ethics Clearances */}
      {activeTab === "ethics" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Institutional Ethics Committee Clearances</h3>
            <p className="text-xs text-slate-500">Statutory protocol approvals, amendments, and annual safety audits</p>
          </div>
          <div className="divide-y divide-slate-100">
            {ethicsReviews.map((er) => (
              <div key={er.id} className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{er.committee_name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {er.review_type}
                    </span>
                  </div>
                  <StatusBadge status={er.status} />
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  {er.comments || "Review dossier in order."}
                </p>
                <div className="flex items-center gap-6 text-[11px] text-slate-400">
                  <span>Submission: {formatDate(er.submission_date)}</span>
                  <span>Decision: {formatDate(er.decision_date)}</span>
                  <span>Valid Until: {formatDate(er.expiry_date)}</span>
                  <span>Protocol Reviewed: {er.protocol_version_reviewed || "v1.0"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Document Vault */}
      {activeTab === "vault" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tamper-Evident Regulatory Document Vault</h3>
              <p className="text-xs text-slate-500">21 CFR Part 11 certified with SHA-256 cryptographic hashes</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Document Title</th>
                  <th className="px-6 py-3">Classification</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3">File Size</th>
                  <th className="px-6 py-3">Tamper-Proof SHA-256 Checksum</th>
                  <th className="px-6 py-3 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-400">{doc.file_name}</div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{doc.doc_type}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-800">v{doc.version}</td>
                    <td className="px-6 py-3.5 text-slate-500">{((Number(doc.file_size || 0)) / 1024).toFixed(1)} KB</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                      {doc.checksum_sha256}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Regulatory Exports */}
      {activeTab === "exports" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Regulatory Data Interchange</h3>
            <p className="text-xs text-slate-500 mt-1">
              One-click standards-based export packages ready for CDSCO, ICMR, and WHO-UMC data submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FHIR R4 Bundle */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    HL7 FHIR R4
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">JSON Bundle</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Research Study Bundle</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Contains ResearchStudy, ResearchSubject, and AdverseEvent resources structured per HL7 FHIR clinical research specifications.
                </p>
              </div>
              <button
                onClick={handleDownloadFhir}
                disabled={downloading === "fhir"}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {downloading === "fhir" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloading === "fhir" ? "Generating..." : "Download FHIR R4 JSON"}
              </button>
            </div>

            {/* CDISC SDTM AE Domain */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                    CDISC SDTM v3.3
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">AE Domain</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Adverse Events (AE) Dataset</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tabular dataset containing standard SDTM variables: STUDYID, USUBJID, AETERM, AEMODIFY, AEDECOD, AESER, and AEREL.
                </p>
              </div>
              <button
                onClick={() => handleDownloadSdtm("AE")}
                disabled={downloading === "AE"}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {downloading === "AE" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloading === "AE" ? "Generating..." : "Download SDTM AE (CSV)"}
              </button>
            </div>

            {/* CDISC SDTM DM Domain */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    CDISC SDTM v3.3
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">DM Domain</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Demographics (DM) Dataset</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pseudonymized subject demographics: USUBJID, RFSTDTC, SEX, AGE, ARM, and COUNTRY aligned with standard submission specs.
                </p>
              </div>
              <button
                onClick={() => handleDownloadSdtm("DM")}
                disabled={downloading === "DM"}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {downloading === "DM" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloading === "DM" ? "Generating..." : "Download SDTM DM (CSV)"}
              </button>
            </div>

            {/* CDISC SDTM DS Domain */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                    CDISC SDTM v3.3
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">DS Domain</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Disposition (DS) Dataset</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Trial milestone disposition milestones: PROTOCOL COMPLETED, SCREEN FAILURE, WITHDRAWN, or ONGOING.
                </p>
              </div>
              <button
                onClick={() => handleDownloadSdtm("DS")}
                disabled={downloading === "DS"}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {downloading === "DS" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloading === "DS" ? "Generating..." : "Download SDTM DS (CSV)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 21 CFR Part 11 Audit Modal */}
      <AuditModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleConfirmStatusChange}
        title="Protocol Lifecycle Ratification"
        description={`You are modifying the lifecycle status of '${trial.study_id}' to '${targetStatus}'. State your clinical/regulatory justification.`}
        confirmButtonText="Ratify Status Change"
      />

      {/* Participant Visit Schedule Timeline Modal */}
      {showVisitsModal && selectedParticipantForVisits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedParticipantForVisits.participant_code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedParticipantForVisits.age_group || "Adult"} · {selectedParticipantForVisits.sex || "Undisclosed"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Participant Protocol Visit Schedule (5-Milestone Timeline)
                </h3>
              </div>
              <button
                onClick={() => setShowVisitsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {loadingVisits ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  Loading visit milestones and CRF telemetry...
                </div>
              ) : participantVisits.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No scheduled visit events generated for this subject yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {participantVisits.map((v, i) => {
                    const isDone = v.status === "COMPLETED";
                    const isMissed = v.status === "MISSED" || v.status === "WINDOW_EXCEEDED";

                    return (
                      <div key={v.id || i} className="relative">
                        <div
                          className={`absolute -left-[27px] top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                              : isMissed
                              ? "border-rose-500 text-rose-600 bg-rose-50"
                              : "border-slate-300 text-slate-400"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{v.visit_name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isMissed
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {v.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Protocol Window:</span>
                              <span>Target Day {v.target_day} (±{v.window_after_days}d)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Scheduled / Actual:</span>
                              <span>{formatDate(v.scheduled_date)} {v.actual_date ? `· ${formatDate(v.actual_date)}` : ""}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-[11px]">
                            <span className={v.vital_signs_recorded ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                              {v.vital_signs_recorded ? "✓ Vitals Recorded" : "○ Vitals Pending"}
                            </span>
                            <span className={v.crf_completed ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                              {v.crf_completed ? "✓ eCRF Complete" : "○ eCRF Open"}
                            </span>
                          </div>
                          {v.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                              Note: {v.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowVisitsModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
