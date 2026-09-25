"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FlaskConical,
  Users,
  ShieldAlert,
  FileCheck2,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Trial, Participant, AdverseEvent } from "@/lib/types";

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OmniSearch({ isOpen, onClose }: OmniSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [aes, setAes] = useState<AdverseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadSearchPool();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open from anywhere if listener active
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadSearchPool = async () => {
    setLoading(true);
    try {
      const [tList, pList, aeList] = await Promise.all([
        api.getTrials({ limit: 30 }),
        api.getParticipants({ limit: 30 }),
        api.getAdverseEvents({ limit: 30 }),
      ]);
      setTrials(tList);
      setParticipants(pList);
      setAes(aeList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredTrials = q
    ? trials.filter(
        (t) =>
          t.study_id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.ctri_number && t.ctri_number.toLowerCase().includes(q)) ||
          (t.intervention && t.intervention.toLowerCase().includes(q))
      )
    : trials.slice(0, 4);

  const filteredParticipants = q
    ? participants.filter(
        (p) =>
          p.participant_code.toLowerCase().includes(q) ||
          (p.status && p.status.toLowerCase().includes(q))
      )
    : participants.slice(0, 3);

  const filteredAes = q
    ? aes.filter(
        (a) =>
          a.event_term.toLowerCase().includes(q) ||
          (a.meddra_term && a.meddra_term.toLowerCase().includes(q)) ||
          (a.ayurvedic_term && a.ayurvedic_term.toLowerCase().includes(q))
      )
    : aes.slice(0, 3);

  const handleNavigate = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search trials, CTRI IDs, subjects (AYU-XXXX), MedDRA terms, AEs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">Loading registry indices...</div>
          )}

          {/* Trials Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                Clinical Trials & Protocols ({filteredTrials.length})
              </span>
            </div>
            {filteredTrials.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">No matching trials</p>
            ) : (
              <div className="space-y-1.5">
                {filteredTrials.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleNavigate(`/trials/${t.id}`)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {t.study_id}
                        </span>
                        {t.ctri_number && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {t.ctri_number}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participants Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Pseudonymous Cohort ({filteredParticipants.length})
              </span>
            </div>
            {filteredParticipants.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">No matching participants</p>
            ) : (
              <div className="space-y-1.5">
                {filteredParticipants.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate(`/participants`)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-700">
                        {p.participant_code}
                      </span>
                      <span className="text-xs text-slate-500">
                        {p.age_group || "Adult"} · {p.sex || "Undisclosed"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {p.status}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety & Adverse Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Adverse Events & Safety Signals ({filteredAes.length})
              </span>
            </div>
            {filteredAes.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">No matching adverse events</p>
            ) : (
              <div className="space-y-1.5">
                {filteredAes.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleNavigate(`/adverse-events`)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                          {a.event_term}
                        </span>
                        {a.is_serious && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            SAE
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        MedDRA: {a.meddra_term || "Pending"} {a.ayurvedic_term ? `· Ayu: ${a.ayurvedic_term}` : ""}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-semibold text-slate-700 shadow-2xs">ESC</kbd> to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-semibold text-slate-700 shadow-2xs">Ctrl + K</kbd> to toggle
            </span>
          </div>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Global AIIA Registry OmniSearch
          </span>
        </div>
      </div>
    </div>
  );
}
