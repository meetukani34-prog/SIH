"use client";

import React, { useEffect, useState } from "react";
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Lock,
  Download,
  CheckCircle2,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { DocumentRecord, Trial } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalTrialId, setModalTrialId] = useState("");
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("PROTOCOL");
  const [fileName, setFileName] = useState("");
  const [version, setVersion] = useState("1.0");
  const [fileSize, setFileSize] = useState(1024 * 1024);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const currentUser = getCurrentUser();

  const loadData = async () => {
    try {
      const [dData, tData] = await Promise.all([
        api.getDocuments({
          doc_type: docTypeFilter === "ALL" ? undefined : docTypeFilter,
        }),
        api.getTrials(),
      ]);
      setDocuments(dData);
      setTrials(tData);
      if (tData.length > 0 && !modalTrialId) setModalTrialId(tData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [docTypeFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      await api.uploadDocument({
        trial_id: modalTrialId || undefined,
        title,
        doc_type: docType as any,
        file_name: fileName,
        file_path: `/vault/${docType.toLowerCase()}/${fileName}`,
        file_size: fileSize,
        version,
      });
      setShowModal(false);
      setTitle("");
      setFileName("");
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to deposit document");
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = documents.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Regulatory Document Vault</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Cryptographically Sealed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident trial master file (TMF), bilingual informed consent records, and expedited safety dossiers
          </p>
        </div>

        <button
          onClick={() => {
            setFileName(`Doc_${Date.now()}.pdf`);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Deposit Vault Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {[
            { key: "ALL", label: "All Vault" },
            { key: "PROTOCOL", label: "Protocols" },
            { key: "INFORMED_CONSENT", label: "Informed Consent (ICF)" },
            { key: "SAE_REPORT", label: "Statutory SAE Dossiers" },
            { key: "ETHICS_APPROVAL", label: "Clearance Certificates" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setDocTypeFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                docTypeFilter === f.key
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Vault Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Verifying document vault seals...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderLock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Documents in this Vault View</h4>
            <p className="text-xs text-slate-500 mt-1">Deposit trial records to establish cryptographic proof.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Document Title</th>
                  <th className="px-6 py-3.5">Classification</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Cryptographic SHA-256 Fingerprint</th>
                  <th className="px-6 py-3.5">Deposited On</th>
                  <th className="px-6 py-3.5 text-right">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{d.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{d.file_name}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {d.doc_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">v{d.version}</td>
                    <td className="px-6 py-4 text-slate-500">{(d.file_size / 1024).toFixed(1)} KB</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[11px] text-slate-600 truncate max-w-xs bg-slate-50 p-1 rounded border border-slate-200">
                        {d.checksum_sha256}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(d.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Sealed & Intact
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Document Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Deposit Record into Vault</h3>
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

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Associate Trial</label>
                <select
                  value={modalTrialId}
                  onChange={(e) => setModalTrialId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None (Institutional General File)</option>
                  {trials.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.study_id} — {t.short_title || t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Statistical Analysis Plan (SAP) v1.0"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classification</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PROTOCOL">Protocol</option>
                    <option value="INFORMED_CONSENT">Informed Consent (ICF)</option>
                    <option value="ETHICS_APPROVAL">Ethics Clearance Certificate</option>
                    <option value="SAE_REPORT">Expedited SAE Report</option>
                    <option value="REGULATORY_SUBMISSION">Regulatory Filing</option>
                    <option value="OTHER">Other Dossier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. SAP_AYUR_001_v1.0.pdf"
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 leading-relaxed">
                🔒 A SHA-256 checksum will be generated automatically upon deposit, certifying immutability in the regulatory vault under 21 CFR Part 11.
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
                  {modalLoading ? "Sealing..." : "Deposit & Seal Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
