"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { Trial, User } from "@/lib/types";
import { StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";

export default function TrialsListPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = getCurrentUser();

  // Form state for creating trial
  const [studyId, setStudyId] = useState("");
  const [ctriNumber, setCtriNumber] = useState("");
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [phase, setPhase] = useState("Phase IIb");
  const [intervention, setIntervention] = useState("");
  const [indication, setIndication] = useState("");
  const [targetSample, setTargetSample] = useState(100);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadTrials = async () => {
    try {
      const data = await api.getTrials({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search || undefined,
      });
      setTrials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrials();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrials();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    try {
      await api.createTrial({
        study_id: studyId,
        ctri_number: ctriNumber || undefined,
        title,
        short_title: shortTitle || undefined,
        phase,
        intervention,
        indication,
        target_sample_size: targetSample,
        status: "DRAFT",
      });
      setShowCreateModal(false);
      // Reset form
      setStudyId("");
      setCtriNumber("");
      setTitle("");
      setShortTitle("");
      setIntervention("");
      setIndication("");
      loadTrials();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create clinical trial");
    } finally {
      setCreateLoading(false);
    }
  };

  const canCreate = currentUser?.role === "PI" || currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Trials Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Ayurveda interventional and observational research protocols
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Protocol
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, study ID, formulation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {["ALL", "ACTIVE", "ENROLLING", "DRAFT", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Trials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading trial registries...</div>
        ) : trials.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Clinical Trials Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try refining your search query or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Study ID / CTRI</th>
                  <th className="px-6 py-3.5">Protocol Title & Indication</th>
                  <th className="px-6 py-3.5">Phase</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Principal Investigator</th>
                  <th className="px-6 py-3.5">Enrollment</th>
                  <th className="px-6 py-3.5 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {trials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-emerald-700">{t.study_id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.ctri_number || "CTRI Pending"}</div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">{t.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        <strong className="text-slate-600">Intervention:</strong> {t.intervention || "Formulation"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{t.phase || "Phase II"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{t.principal_investigator?.name || "Dr. Rajesh Sharma"}</div>
                      <div className="text-[11px] text-slate-400">{t.site?.name || "AIIA New Delhi"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <span>{t.enrolled_count}</span>
                        <span className="text-slate-400 font-normal">/ {t.target_sample_size || 100}</span>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((t.enrolled_count / (t.target_sample_size || 100)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/trials/${t.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        Workspace
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Protocol Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Register New Clinical Trial Protocol</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Study ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studyId}
                    onChange={(e) => setStudyId(e.target.value)}
                    placeholder="e.g. AYUR-2026-004"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CTRI Registry #</label>
                  <input
                    type="text"
                    value={ctriNumber}
                    onChange={(e) => setCtriNumber(e.target.value)}
                    placeholder="e.g. CTRI/2026/04/078120"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Protocol Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Randomized Evaluation of Haridra & Pippali in Allergic Rhinitis"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  >
                    <option value="Phase I">Phase I (Safety & Pharmacokinetics)</option>
                    <option value="Phase IIa">Phase IIa (Proof of Concept)</option>
                    <option value="Phase IIb">Phase IIb (Dose Finding)</option>
                    <option value="Phase III">Phase III (Pivotal Efficacy)</option>
                    <option value="Phase IV">Phase IV (Post-Market Surveillance)</option>
                    <option value="Observational">Observational / Registrational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cohort Size</label>
                  <input
                    type="number"
                    value={targetSample}
                    onChange={(e) => setTargetSample(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Intervention / Formulation</label>
                  <input
                    type="text"
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    placeholder="e.g. Haridra Khanda (3g BID)"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Indication (Roga)</label>
                  <input
                    type="text"
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    placeholder="e.g. Pratishyaya / Allergic Rhinitis"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {createLoading ? "Submitting Protocol..." : "Create & Deposit Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
