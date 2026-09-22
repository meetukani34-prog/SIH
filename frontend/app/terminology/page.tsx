"use client";

import React, { useState } from "react";
import { Sparkles, Search, BookOpen, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { TerminologySuggestion } from "@/lib/types";

const PRESET_QUERIES = [
  { label: "Amlapitta", desc: "Hyperacidity, sour eructation, gastric burn" },
  { label: "Shiroshoola", desc: "Frontal/temporal headache, migraine" },
  { label: "Sandhishoola", desc: "Arthralgia, joint pain & stiffness" },
  { label: "Chhardi", desc: "Vomiting, post-dosing emesis" },
  { label: "Kandu / Sheetapitta", desc: "Pruritus, allergic skin rash" },
  { label: "Shwasa", desc: "Dyspnoea, breathlessness" },
  { label: "Atisara", desc: "Diarrhoea, loose bowel movements" },
];

export default function TerminologyPage() {
  const [query, setQuery] = useState("Amlapitta");
  const [suggestions, setSuggestions] = useState<TerminologySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.suggestTerminology(searchTerm);
      setSuggestions(res.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Terminology Harmonizer</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Bio-Harmonization Model
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Semantic cross-walk bridging Classical Ayurvedic terminology (NAMASTE / Samhita) to international MedDRA Preferred Terms and System Organ Classes
        </p>
      </div>

      {/* Interactive Search Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Classical Ayurvedic symptom, Sanskrit term, or clinical note..."
              className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Harmonize Term
          </button>
        </form>

        {/* Preset Quick-Test Buttons */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Example Clinical Terms (Click to Test):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setQuery(p.label);
                  handleSearch(p.label);
                }}
                className="px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-xs font-medium text-purple-900 transition-colors cursor-pointer text-left"
              >
                <strong>{p.label}</strong>
                <span className="text-purple-600/70 text-[11px] ml-1.5">({p.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Harmonized Standards Mappings for &quot;{query}&quot;
            </h3>
            <span className="text-xs text-slate-500">
              {suggestions.length} match{suggestions.length === 1 ? "" : "es"} generated
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{s.meddra_term}</h4>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        MedDRA PT {s.meddra_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      System Organ Class (SOC): <strong className="text-slate-700">{s.system_organ_class}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {Math.round(s.confidence_score * 100)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Classical Ayurvedic Correlate
                    </span>
                    <div className="font-bold text-emerald-800 text-sm">{s.ayurvedic_correlate}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Category: {s.ayurvedic_category}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Clinical Reference & Correlation Rationale
                    </span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {s.notes || "Correlated with Classical Ayurvedic clinical presentation."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standards Architecture Info Card */}
      <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Cross-Terminology Architecture
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          AyurCTMS addresses a major challenge in traditional medicine research: disparate clinical terminologies. By harmonizing classical Ayurvedic diagnoses (Charaka, Sushruta, Vagbhata samhita nomenclature) with MedDRA (Medical Dictionary for Regulatory Activities) and ICD-11 Traditional Medicine Module 2, trial data remains scientifically interoperable with CDSCO, FDA, and WHO-UMC safety databases.
        </p>
      </div>
    </div>
  );
}
