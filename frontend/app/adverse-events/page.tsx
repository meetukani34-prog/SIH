"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import {
  AdverseEvent,
  Trial,
  Participant,
  TerminologySuggestion,
} from "@/lib/types";
import { SeverityBadge, SaeCountdownBadge, StatusBadge } from "@/components/Badges";
import { formatDateTime } from "@/lib/utils";
import { AuditModal } from "@/components/AuditModal";

export default function AdverseEventsPage() {
  const [adverseEvents, setAdverseEvents] = useState<AdverseEvent[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSerious, setFilterSerious] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Record AE Modal
  const [showModal, setShowModal] = useState(false);
  const [modalTrialId, setModalTrialId] = useState("");
  const [modalParticipantId, setModalParticipantId] = useState("");
  const [eventTerm, setEventTerm] = useState("");
  const [ayurvedicTerm, setAyurvedicTerm] = useState("");
  const [meddraTerm, setMeddraTerm] = useState("");
  const [meddraCode, setMeddraCode] = useState("");
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 16));
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">("MODERATE");
  const [isSerious, setIsSerious] = useState(false);
  const [saeCriteria, setSaeCriteria] = useState<string[]>([]);
  const [causality, setCausality] = useState("POSSIBLE");
  const [outcome, setOutcome] = useState("RECOVERING");
  const [actionTaken, setActionTaken] = useState("");
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // AI Harmonizer helper
  const [aiSuggestions, setAiSuggestions] = useState<TerminologySuggestion[]>([]);
  const [aiSearching, setAiSearching] = useState(false);

  // Edit causality/outcome modal state
  const [selectedAeForEdit, setSelectedAeForEdit] = useState<AdverseEvent | null>(null);
  const [showEditAuditModal, setShowEditAuditModal] = useState(false);
  const [editOutcome, setEditOutcome] = useState("");
  const [editCausality, setEditCausality] = useState("");

  const currentUser = getCurrentUser();

  const loadData = async (isInitial = false) => {
    try {
      if (isInitial || trials.length === 0) {
        const [aeData, tData, pData] = await Promise.all([
          api.getAdverseEvents({
            is_serious:
              filterSerious === "SAE_ONLY" ? true : filterSerious === "NON_SERIOUS" ? false : undefined,
            limit: 50,
          }),
          api.getTrials({ limit: 50 }),
          api.getParticipants({ limit: 50 }),
        ]);
        setAdverseEvents(aeData);
        setTrials(tData);
        setParticipants(pData);
        if (tData.length > 0 && !modalTrialId) setModalTrialId(tData[0].id);
        if (pData.length > 0 && !modalParticipantId) setModalParticipantId(pData[0].id);
      } else {
        const aeData = await api.getAdverseEvents({
          is_serious:
            filterSerious === "SAE_ONLY" ? true : filterSerious === "NON_SERIOUS" ? false : undefined,
          limit: 50,
        });
        setAdverseEvents(aeData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(trials.length === 0);
  }, [filterSerious]);

  // AI Terminology Auto-Lookup debounce
  useEffect(() => {
    if (!eventTerm.trim() || eventTerm.length < 3) {
      setAiSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setAiSearching(true);
      try {
        const res = await api.suggestTerminology(eventTerm);
        setAiSuggestions(res.suggestions || []);
      } catch (e) {
        console.error("AI lookup failed", e);
      } finally {
        setAiSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [eventTerm]);

  const handleApplySuggestion = (s: TerminologySuggestion) => {
    setMeddraTerm(s.meddra_term);
    setMeddraCode(s.meddra_code);
    if (s.ayurvedic_correlate) {
      setAyurvedicTerm(s.ayurvedic_correlate);
    }
  };

  const handleCreateAe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    try {
      await api.createAdverseEvent({
        trial_id: modalTrialId,
        participant_id: modalParticipantId,
        event_term: eventTerm,
        ayurvedic_term: ayurvedicTerm || undefined,
        meddra_term: meddraTerm || undefined,
        meddra_code: meddraCode || undefined,
        onset_date: onsetDate,
        severity,
        is_serious: isSerious,
        sae_criteria: isSerious ? saeCriteria : undefined,
        causality: causality as any,
        outcome: outcome as any,
        action_taken: actionTaken || undefined,
        description: description || undefined,
      });
      setShowModal(false);
      // Reset
      setEventTerm("");
      setAyurvedicTerm("");
      setMeddraTerm("");
      setMeddraCode("");
      setIsSerious(false);
      setSaeCriteria([]);
      setDescription("");
      loadData();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to record adverse event");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmEdit = async (reason: string) => {
    if (!selectedAeForEdit) return;
    try {
      await api.updateAdverseEvent(selectedAeForEdit.id, {
        outcome: editOutcome as any,
        causality: editCausality as any,
        reason_for_change: reason,
      });
      setSelectedAeForEdit(null);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const activeSaes = adverseEvents.filter((ae) => ae.is_serious);

  const canReport = currentUser?.role === "PI" || currentUser?.role === "PV" || currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pharmacovigilance & Safety Operations
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Statutory 24h Clock
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Adverse Drug Reaction monitoring, Classical Ayurvedic harmonization, and expedited SAE reporting
          </p>
        </div>

        {canReport && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Adverse Event
          </button>
        )}
      </div>

      {/* Active Serious Adverse Events Priority Card */}
      {activeSaes.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50/90 to-amber-50/50 rounded-xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-950">Active Expedited Regulatory Clock Alerts</h3>
            </div>
            <span className="text-xs font-semibold text-rose-700">
              {activeSaes.length} Serious Adverse Event{activeSaes.length === 1 ? "" : "s"} monitored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSaes.map((sae) => (
              <div
                key={sae.id}
                className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {sae.participant_code || "Subject"}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">({sae.trial_study_id || "Trial"})</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{sae.event_term}</h4>
                  </div>
                  <SaeCountdownBadge
                    deadlineString={sae.sae_deadline}
                    saeStatus={sae.sae_status}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    MedDRA: <strong className="text-slate-700">{sae.meddra_term || "Pending"}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedAeForEdit(sae);
                      setEditOutcome(sae.outcome || "RECOVERING");
                      setEditCausality(sae.causality || "POSSIBLE");
                      setShowEditAuditModal(true);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Assess Causality
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symptoms, Ayurvedic terms, MedDRA codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { key: "ALL", label: "All Events" },
            { key: "SAE_ONLY", label: "Serious AEs (SAE)" },
            { key: "NON_SERIOUS", label: "Non-Serious" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterSerious(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterSerious === f.key
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adverse Events Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading safety records...</div>
        ) : adverseEvents.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Safety Events Logged</h4>
            <p className="text-xs text-slate-500 mt-1">
              Safety monitoring active. Record incident observations if detected.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Subject & Trial</th>
                  <th className="px-6 py-3.5">Observed Symptom</th>
                  <th className="px-6 py-3.5">Ayurvedic Correlate / MedDRA Term</th>
                  <th className="px-6 py-3.5">Onset Date</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Causality (WHO-UMC)</th>
                  <th className="px-6 py-3.5">Outcome</th>
                  <th className="px-6 py-3.5">Statutory 24h Clock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {adverseEvents
                  .filter((ae) => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    return (
                      ae.event_term.toLowerCase().includes(q) ||
                      (ae.ayurvedic_term && ae.ayurvedic_term.toLowerCase().includes(q)) ||
                      (ae.meddra_term && ae.meddra_term.toLowerCase().includes(q)) ||
                      (ae.participant_code && ae.participant_code.toLowerCase().includes(q))
                    );
                  })
                  .map((ae) => (
                    <tr key={ae.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900">{ae.participant_code || "Subject"}</div>
                        <div className="text-[11px] text-slate-400">{ae.trial_study_id || "Trial"}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs">{ae.event_term}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-emerald-800">{ae.ayurvedic_term || "—"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {ae.meddra_term ? `${ae.meddra_term} (${ae.meddra_code || "10001367"})` : "Pending Coding"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDateTime(ae.onset_date)}</td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={ae.severity} isSerious={ae.is_serious} />
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{ae.causality || "POSSIBLE"}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{ae.outcome || "RECOVERING"}</td>
                      <td className="px-6 py-4">
                        <SaeCountdownBadge
                          deadlineString={ae.sae_deadline}
                          saeStatus={ae.sae_status}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAeForEdit(ae);
                            setEditOutcome(ae.outcome || "RECOVERING");
                            setEditCausality(ae.causality || "POSSIBLE");
                            setShowEditAuditModal(true);
                          }}
                          className="font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Assess
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Safety Event Modal with Interactive AI Terminology Harmonizer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Clinical Safety & Adverse Event Reporting Form
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleCreateAe} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Trial <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={modalTrialId}
                    onChange={(e) => setModalTrialId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                  >
                    {trials.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.study_id} — {t.short_title || t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject ID <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={modalParticipantId}
                    onChange={(e) => setModalParticipantId(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.participant_code} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Term Input with AI Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Clinical Observation / Symptom <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    AI Harmonizer Active
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={eventTerm}
                  onChange={(e) => setEventTerm(e.target.value)}
                  placeholder="e.g. Amlapitta, Acute gastric burning, Shiroshoola, severe nausea..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Type natural clinical language or Classical Sanskrit terms (Charaka/Sushruta nomenclature).
                </p>

                {/* AI Suggestions Dropdown Cards */}
                {aiSearching && (
                  <div className="p-2 text-xs text-purple-600 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Harmonizing clinical terminology against MedDRA...
                  </div>
                )}

                {aiSuggestions.length > 0 && (
                  <div className="mt-2 p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
                    <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                      AI Harmonized Terminology Suggestions (Click to Apply)
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {aiSuggestions.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleApplySuggestion(s)}
                          className="p-2.5 rounded-lg bg-white border border-purple-100 hover:border-purple-400 hover:shadow-xs cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{s.meddra_term}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                                MedDRA {s.meddra_code}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {Math.round(s.confidence_score * 100)}% match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Ayurvedic Correlate: <strong className="text-emerald-700">{s.ayurvedic_correlate}</strong> ({s.ayurvedic_category})
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-100/60 px-2 py-1 rounded"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MedDRA & Ayurvedic Auto-populated Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MedDRA Preferred Term & Code
                  </label>
                  <input
                    type="text"
                    value={meddraTerm ? `${meddraTerm} (${meddraCode})` : ""}
                    readOnly
                    placeholder="Auto-populated by AI"
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classical Ayurvedic Category
                  </label>
                  <input
                    type="text"
                    value={ayurvedicTerm}
                    onChange={(e) => setAyurvedicTerm(e.target.value)}
                    placeholder="e.g. Annavaha Srotas"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
                  >
                    <option value="MILD">MILD</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="SEVERE">SEVERE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Causality (WHO-UMC)</label>
                  <select
                    value={causality}
                    onChange={(e) => setCausality(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
                  >
                    <option value="CERTAIN">CERTAIN</option>
                    <option value="PROBABLE">PROBABLE</option>
                    <option value="POSSIBLE">POSSIBLE</option>
                    <option value="UNLIKELY">UNLIKELY</option>
                    <option value="UNRELATED">UNRELATED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
                  >
                    <option value="RECOVERED">RECOVERED</option>
                    <option value="RECOVERING">RECOVERING</option>
                    <option value="NOT_RECOVERED">NOT RECOVERED</option>
                    <option value="FATAL">FATAL</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>

              {/* SAE Toggle with Warning */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSerious}
                    onChange={(e) => setIsSerious(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-950">
                    Classify as Serious Adverse Event (SAE)
                  </span>
                </label>
                {isSerious && (
                  <div className="text-[11px] text-rose-800 pl-6 space-y-1">
                    <p className="font-semibold">
                      ⚠️ Trigger: Flags this observation for immediate 24-hour statutory regulatory reporting countdown and sends high-priority alerts to Ethics & PV.
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2">
                      {["HOSPITALIZATION", "LIFE_THREATENING", "DEATH", "DISABILITY", "MEDICALLY_SIGNIFICANT"].map(
                        (crit) => (
                          <label key={crit} className="flex items-center gap-1 text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-rose-200">
                            <input
                              type="checkbox"
                              checked={saeCriteria.includes(crit)}
                              onChange={(e) => {
                                if (e.target.checked) setSaeCriteria([...saeCriteria, crit]);
                                else setSaeCriteria(saeCriteria.filter((c) => c !== crit));
                              }}
                            />
                            {crit}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Taken & Clinical Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail treatment, formulation withholding, emergency care, or concomitant herbs..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  {submitLoading ? "Recording..." : isSerious ? "Submit SAE (24h Clock Starts)" : "Save Adverse Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Causality & Outcome Assessment Modal (Audit Protected) */}
      {selectedAeForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Update Causality Assessment ({selectedAeForEdit.event_term})
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WHO-UMC Causality</label>
              <select
                value={editCausality}
                onChange={(e) => setEditCausality(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
              >
                <option value="CERTAIN">CERTAIN</option>
                <option value="PROBABLE">PROBABLE</option>
                <option value="POSSIBLE">POSSIBLE</option>
                <option value="UNLIKELY">UNLIKELY</option>
                <option value="UNRELATED">UNRELATED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Outcome</label>
              <select
                value={editOutcome}
                onChange={(e) => setEditOutcome(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
              >
                <option value="RECOVERED">RECOVERED</option>
                <option value="RECOVERING">RECOVERING</option>
                <option value="NOT_RECOVERED">NOT RECOVERED</option>
                <option value="FATAL">FATAL</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAeForEdit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowEditAuditModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Proceed to Regulatory Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 21 CFR Part 11 Audit Modal */}
      <AuditModal
        isOpen={showEditAuditModal}
        onClose={() => setShowEditAuditModal(false)}
        onConfirm={handleConfirmEdit}
        title="Pharmacovigilance Reassessment Ledger"
        description="Specify clinical notes for re-evaluating causality / outcome under 21 CFR Part 11 compliance."
        confirmButtonText="Confirm Safety Reassessment"
      />
    </div>
  );
}
