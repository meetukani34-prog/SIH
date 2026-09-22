"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Calendar,
  UserCheck,
  X,
  FileCode2,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuditLogRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [searchEmail, setSearchEmail] = useState("");

  // Inspect Diff modal
  const [inspectRecord, setInspectRecord] = useState<AuditLogRecord | null>(null);

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs({
        entity_type: entityFilter === "ALL" ? undefined : entityFilter,
        action: actionFilter === "ALL" ? undefined : actionFilter,
        user_email: searchEmail || undefined,
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            21 CFR Part 11 Audit Trail Ledger
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Append-Only Statutory Ledger
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable electronic records tracking every create, update, and adjudication with mandatory statutory reason for change
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search operator email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Entity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">All Entities</option>
              <option value="TRIAL">Trials</option>
              <option value="PARTICIPANT">Participants</option>
              <option value="ADVERSE_EVENT">Adverse Events</option>
              <option value="ETHICS_REVIEW">Ethics Clearances</option>
              <option value="DOCUMENT">Vault Documents</option>
              <option value="USER">User Sessions</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-2.5 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Querying immutable audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Audit Trail Records</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust search parameters or entity filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Timestamp (UTC)</th>
                  <th className="px-6 py-3.5">Operator (Email & Role)</th>
                  <th className="px-6 py-3.5">Action & Entity</th>
                  <th className="px-6 py-3.5">Mandatory Reason for Change</th>
                  <th className="px-6 py-3.5">IP & Origin</th>
                  <th className="px-6 py-3.5 text-right">Data Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{log.user_email || "system"}</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                        {log.user_role || "SYSTEM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          log.action === "CREATE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : log.action === "APPROVE"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : log.action === "UPDATE"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="ml-2 font-semibold text-slate-600">{log.entity_type}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {log.reason_for_change ? (
                        <div className="text-xs font-medium text-slate-900 bg-slate-50 p-2 rounded border border-slate-200/80 leading-snug">
                          &quot;{log.reason_for_change}&quot;
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Initial entry / System login</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.old_values || log.new_values ? (
                        <button
                          onClick={() => setInspectRecord(log)}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 text-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Diff
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Diff Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  21 CFR Part 11 Electronic Record Diff Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Action & Target</span>
                  <span className="font-bold text-slate-800">
                    {inspectRecord.action} · {inspectRecord.entity_type}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Operator</span>
                  <span className="font-bold text-slate-800">
                    {inspectRecord.user_email} ({inspectRecord.user_role})
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block font-medium">Statutory Justification</span>
                  <span className="font-semibold text-slate-900">
                    {inspectRecord.reason_for_change || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Pre-Modification State (Old)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-lg overflow-x-auto min-h-32">
                    {inspectRecord.old_values
                      ? JSON.stringify(inspectRecord.old_values, null, 2)
                      : "// No prior record (Initial creation)"}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Post-Modification State (New)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto min-h-32">
                    {inspectRecord.new_values
                      ? JSON.stringify(inspectRecord.new_values, null, 2)
                      : "// Deleted"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
