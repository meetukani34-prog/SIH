"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Building2,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { Participant, Trial } from "@/lib/types";
import { StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrialId, setSelectedTrialId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalTrialId, setModalTrialId] = useState("");
  const [participantCode, setParticipantCode] = useState("");
  const [ageGroup, setAgeGroup] = useState("25-34");
  const [sex, setSex] = useState("F");
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const currentUser = getCurrentUser();

  const loadData = async () => {
    try {
      const [pData, tData] = await Promise.all([
        api.getParticipants({
          trial_id: selectedTrialId === "ALL" ? undefined : selectedTrialId,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        }),
        api.getTrials(),
      ]);
      setParticipants(pData);
      setTrials(tData);
      if (tData.length > 0 && !modalTrialId) {
        setModalTrialId(tData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTrialId, statusFilter]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      await api.createParticipant({
        trial_id: modalTrialId,
        participant_code: participantCode.trim().toUpperCase(),
        age_group: ageGroup,
        sex,
        enrollment_date: enrollmentDate,
        status: "ENROLLED",
      });
      setShowModal(false);
      setParticipantCode("");
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to enroll participant");
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = participants.filter((p) => {
    if (!search) return true;
    return p.participant_code.toLowerCase().includes(search.toLowerCase());
  });

  const canEnroll = currentUser?.role === "PI" || currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Participant Cohort Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pseudonymous subject keys with absolute privacy protection (AYU-XXXX)
          </p>
        </div>

        {canEnroll && (
          <button
            onClick={() => {
              setParticipantCode(`AYU-${Math.floor(1000 + Math.random() * 9000)}`);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enroll Participant
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Subject ID (e.g. AYU-1001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Trial Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Trial:</span>
            <select
              value={selectedTrialId}
              onChange={(e) => setSelectedTrialId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">All Trials</option>
              {trials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.study_id}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="SCREENING">Screening</option>
              <option value="COMPLETED">Completed</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading cohort registry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Participants Found</h4>
            <p className="text-xs text-slate-500 mt-1">Enroll participants or adjust search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Pseudonymous Subject Key</th>
                  <th className="px-6 py-3.5">Trial Reference</th>
                  <th className="px-6 py-3.5">Age Group</th>
                  <th className="px-6 py-3.5">Sex</th>
                  <th className="px-6 py-3.5">Enrollment Date</th>
                  <th className="px-6 py-3.5">Clinical Status</th>
                  <th className="px-6 py-3.5">Last Visit</th>
                  <th className="px-6 py-3.5">Next Scheduled Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((p) => {
                  const matchedTrial = trials.find((t) => t.id === p.trial_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-emerald-700 text-sm">{p.participant_code}</div>
                        <div className="text-[10px] text-slate-400 font-medium">De-identified ID</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {matchedTrial?.study_id || "Trial"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{p.age_group || "—"}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{p.sex || "—"}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(p.enrollment_date)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(p.last_visit)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatDate(p.next_visit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Enroll Pseudonymous Subject</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Clinical Trial <span className="text-rose-500">*</span>
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
                  Pseudonymous Participant Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={participantCode}
                  onChange={(e) => setParticipantCode(e.target.value)}
                  placeholder="AYU-1011"
                  className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Do not input personal names, phone numbers or Aadhaar IDs (21 CFR Part 11).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age Bracket</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                  >
                    <option value="18-24">18-24 years</option>
                    <option value="25-34">25-34 years</option>
                    <option value="35-44">35-44 years</option>
                    <option value="45-54">45-54 years</option>
                    <option value="55-64">55-64 years</option>
                    <option value="65+">65+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                    <option value="Other">Other / Undisclosed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Date</label>
                <input
                  type="date"
                  required
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800"
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
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {modalLoading ? "Registering..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
