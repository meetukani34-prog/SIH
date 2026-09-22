"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  FileCode2,
  Table,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Copy,
  Globe,
  Database,
  Building2,
} from "lucide-react";
import { api, getToken } from "@/lib/api";
import { Trial } from "@/lib/types";

export default function ExportsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getTrials();
        setTrials(data);
        if (data.length > 0) setSelectedTrialId(data[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedTrial = trials.find((t) => t.id === selectedTrialId);

  // Client-side instant file download helper
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
    if (!selectedTrialId) return;
    setDownloading("fhir");
    try {
      const data = await api.getFhirBundle(selectedTrialId);
      const studyCode = selectedTrial?.study_id || "TRIAL";
      triggerBlobDownload(
        JSON.stringify(data, null, 2),
        `FHIR_R4_Bundle_${studyCode}.json`,
        "application/json"
      );
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSdtm = async (domain: "AE" | "DM" | "DS") => {
    if (!selectedTrialId) return;
    setDownloading(domain);
    try {
      const token = getToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/exports/csv/${selectedTrialId}/${domain}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const csvText = await res.text();
      const studyCode = selectedTrial?.study_id || "TRIAL";
      triggerBlobDownload(
        csvText,
        `SDTM_${domain}_${studyCode}.csv`,
        "text/csv"
      );
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handlePreviewFhir = async () => {
    if (!selectedTrialId) return;
    setPreviewLoading(true);
    setPreviewTitle("HL7 FHIR R4 & ABDM Collection Bundle Preview");
    try {
      const data = await api.getFhirBundle(selectedTrialId);
      setPreviewContent(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setPreviewContent(`Error generating FHIR preview: ${e.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewSdtm = async (domain: "AE" | "DM" | "DS") => {
    if (!selectedTrialId) return;
    setPreviewLoading(true);
    setPreviewTitle(`CDISC SDTM v3.3 (${domain} Domain) Dataset Preview`);
    try {
      const data = await api.getSdtmDataset(selectedTrialId, domain);
      setPreviewContent(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setPreviewContent(`Error generating SDTM preview: ${e.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopy = () => {
    if (!previewContent) return;
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Regulatory Data Interchange Center</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            CTRI · CDISC · HL7 FHIR R4 · ABDM
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Interoperability hub aligning synthetic clinical research records with national and international regulatory standards
        </p>
      </div>

      {/* Trial Selector & CTRI Registry Link */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Selected Protocol:
          </label>
          <select
            value={selectedTrialId}
            onChange={(e) => {
              setSelectedTrialId(e.target.value);
              setPreviewContent("");
            }}
            className="text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
          >
            {trials.map((t) => (
              <option key={t.id} value={t.id}>
                {t.study_id} — {t.title}
              </option>
            ))}
          </select>
        </div>

        {selectedTrial?.ctri_number && (
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">CTRI Registry Ref:</span>
            <strong className="font-mono text-slate-800">{selectedTrial.ctri_number}</strong>
            <a
              href="https://ctri.nic.in"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-0.5 ml-1"
            >
              ctri.nic.in <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Three Regulatory Standards Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. HL7 FHIR R4 & ABDM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                HL7 FHIR R4 & ABDM
              </span>
              <span className="text-[10px] font-semibold text-slate-400">NHA Aligned</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">ABDM Research Study Bundle</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              HL7 FHIR R4 Collection Bundle aligned with Ayushman Bharat Digital Mission (ABDM) specifications, containing ResearchStudy, ResearchSubject (with ABHA tokenization), AdverseEvent (MedDRA codes), and electronic Consent resources.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              onClick={handlePreviewFhir}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview FHIR Bundle
            </button>
            <button
              onClick={handleDownloadFhir}
              disabled={downloading === "fhir"}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading === "fhir" ? "Generating Download..." : "Download FHIR R4 JSON"}
            </button>
          </div>
        </div>

        {/* 2. CDISC SDTM AE Domain */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                CDISC SDTM v3.3
              </span>
              <span className="text-[10px] font-semibold text-slate-400">AE Domain / CDASH</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Adverse Events Domain (AE)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Standardized pharmacovigilance tabulation: STUDYID, USUBJID, AESEQ, AETERM, AEMODIFY, AEDECOD (MedDRA), AESER, and AEREL compliant with CDISC Controlled Terminology (cdisc.org).
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => handlePreviewSdtm("AE")}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview AE Dataset
            </button>
            <button
              onClick={() => handleDownloadSdtm("AE")}
              disabled={downloading === "AE"}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading === "AE" ? "Generating CSV..." : "Download SDTM AE (CSV)"}
            </button>
          </div>
        </div>

        {/* 3. CDISC SDTM DM & DS Domains */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CDISC SDTM v3.3
              </span>
              <span className="text-[10px] font-semibold text-slate-400">DM & DS Domains</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Demographics & Disposition</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pseudonymized Demographics (DM) and Subject Milestone Disposition (DS) datasets: STUDYID, USUBJID, RFSTDTC, SEX, AGE, ARM, COUNTRY, and protocol milestones.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePreviewSdtm("DM")}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" /> Preview DM
              </button>
              <button
                onClick={() => handlePreviewSdtm("DS")}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" /> Preview DS
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownloadSdtm("DM")}
                disabled={downloading === "DM"}
                className="py-2 px-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-colors shadow-xs text-center cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" /> {downloading === "DM" ? "CSV..." : "SDTM DM"}
              </button>
              <button
                onClick={() => handleDownloadSdtm("DS")}
                disabled={downloading === "DS"}
                className="py-2 px-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1 transition-colors shadow-xs text-center cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" /> {downloading === "DS" ? "CSV..." : "SDTM DS"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Stream Previewer */}
      {previewContent && (
        <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden animate-in fade-in duration-200">
          <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">{previewTitle}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Payload"}
            </button>
          </div>
          <pre className="p-6 text-emerald-300 font-mono text-xs overflow-x-auto max-h-96">
            {previewLoading ? "// Generating live serialization..." : previewContent}
          </pre>
        </div>
      )}

      {/* Standards Architecture Documentation Section */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Standards Compliance & Sensitive Data Safeguards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              CTRI Alignment (ctri.nic.in)
            </h4>
            <p>
              Clinical Trials Registry – India public records are modeled directly into trial registries (CTRI numbers, Phase, Study Type, AYUSH GCP registration codes).
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-purple-600" />
              CDISC Standards (cdisc.org)
            </h4>
            <p>
              Employs CDASH for CRF intake and SDTM v3.3 (AE, DM, DS domains) with NCI Controlled Terminology and Define-XML 2.1 data structure alignment.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              HL7 FHIR R4 & ABDM
            </h4>
            <p>
              Interoperable with the Ayushman Bharat Digital Mission (ABDM / NHA) ecosystem using de-identified pseudonyms (AYU-XXXX) and FHIR R4 Research bundles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
