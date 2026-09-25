"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Users,
  FlaskConical,
  Activity,
  FileText,
  AlertTriangle,
  Search,
  RefreshCw,
  LogOut,
  Database,
  Server,
  Download,
  Building,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  ChevronRight,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import { User, Trial, Participant, AdverseEvent, AuditLogRecord } from "@/lib/types";

// Default personas for offline fallback or mock representation
const DEFAULT_USERS: Partial<User>[] = [
  {
    id: "usr-001-pi",
    name: "Dr. Rajesh Sharma",
    email: "pi@ayurctms.in",
    role: "PI",
    institution: "All India Institute of Ayurveda (AIIA), New Delhi",
    created_at: "2024-01-15T09:00:00Z",
  },
  {
    id: "usr-002-eth",
    name: "Dr. Sunita Patel",
    email: "ethics@ayurctms.in",
    role: "ETHICS",
    institution: "Institutional Ethics Review Board (IERB), Mumbai",
    created_at: "2024-01-16T10:30:00Z",
  },
  {
    id: "usr-003-pv",
    name: "Dr. Anand Verma",
    email: "pv@ayurctms.in",
    role: "PV",
    institution: "National Pharmacovigilance Coordination Centre (PvCC)",
    created_at: "2024-01-18T14:15:00Z",
  },
  {
    id: "usr-004-reg",
    name: "Officer K. S. Rao",
    email: "regulator@ayurctms.in",
    role: "REGULATOR",
    institution: "Ministry of AYUSH / CDSCO Regulatory Cell",
    created_at: "2024-01-20T11:00:00Z",
  },
  {
    id: "usr-005-adm",
    name: "System Administrator",
    email: "admin@ayurctms.in",
    role: "ADMIN",
    institution: "AyurCTMS Operations & Governance",
    created_at: "2024-01-10T08:00:00Z",
  },
];

export default function SarvottamSuperAdminPage() {
  // Password gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"users" | "trials" | "participants" | "adverse-events" | "audit" | "system">("users");

  // Data states
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [users, setUsers] = useState<User[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [adverseEvents, setAdverseEvents] = useState<AdverseEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Check if session storage already has unlocked token
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem("sarvottam_unlocked");
    if (isUnlocked === "true") {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setAuthLoading(true);

    const validPasswords = [
      "sarvottam",
      "sarvottam2024",
      "sarvottam@2024",
      "admin123",
      "Password123!",
      "superadmin",
    ];

    if (validPasswords.includes(passwordInput.trim().toLowerCase()) || passwordInput.trim() === "Password123!") {
      // Authenticate with admin backend to get JWT token for real API calls
      try {
        await api.login("admin@ayurctms.in", "Password123!");
      } catch (err) {
        console.warn("Backend auth bypassed for superadmin mode", err);
      }
      sessionStorage.setItem("sarvottam_unlocked", "true");
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      setPasswordError("Invalid Super Admin Password. (Hint: 'sarvottam' or 'Password123!')");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sarvottam_unlocked");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      try {
        const u = await api.getUsers();
        setUsers(u.length > 0 ? u : (DEFAULT_USERS as User[]));
      } catch {
        setUsers(DEFAULT_USERS as User[]);
      }

      // 2. Fetch Trials
      try {
        const t = await api.getTrials();
        setTrials(t);
      } catch {
        setTrials([]);
      }

      // 3. Fetch Participants
      try {
        const p = await api.getParticipants();
        setParticipants(p);
      } catch {
        setParticipants([]);
      }

      // 4. Fetch Adverse Events
      try {
        const ae = await api.getAdverseEvents();
        setAdverseEvents(ae);
      } catch {
        setAdverseEvents([]);
      }

      // 5. Fetch Audit Logs
      try {
        const al = await api.getAuditLogs();
        setAuditLogs(al);
      } catch {
        setAuditLogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.institution && u.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || u.role.toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  // Filtered trials
  const filteredTrials = trials.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.study_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ctri_number && t.ctri_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered participants
  const filteredParticipants = participants.filter(
    (p) =>
      p.participant_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.trial_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.status && p.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered adverse events
  const filteredAdverseEvents = adverseEvents.filter(
    (ae) =>
      ae.event_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ae.ayurvedic_term && ae.ayurvedic_term.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ae.meddra_term && ae.meddra_term.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If not authenticated, render Password Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-white">
        {/* Glowing Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-950/80 mb-4 ring-4 ring-emerald-500/20">
              <KeyRound className="w-10 h-10 text-emerald-100" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              RESTRICTED MASTER CONSOLE
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">SARVOTTAM</h1>
            <p className="text-xs text-slate-400 mt-1">
              Super Admin Core Operations & Master Data Intelligence
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
            {passwordError && (
              <div className="mb-5 p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Enter Super Admin Master Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Super Admin Password..."
                    className="w-full text-sm pl-9 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:opacity-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xl shadow-emerald-950/60 transition-all disabled:opacity-50 cursor-pointer"
              >
                {authLoading ? "Verifying Authority..." : "Unlock Sarvottam Terminal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Default Access Key:{" "}
                <button
                  type="button"
                  onClick={() => setPasswordInput("sarvottam")}
                  className="font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  sarvottam
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={() => setPasswordInput("Password123!")}
                  className="font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Password123!
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              ← Return to Main Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Super Admin Authenticated View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  SARVOTTAM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Master Governance & Complete System Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              Refresh All
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
            >
              Portal Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveTab("users")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{users.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Har ek user ki profile</p>
          </div>

          <div
            onClick={() => setActiveTab("trials")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === "trials"
                ? "bg-slate-900 border-teal-500/60 shadow-lg shadow-teal-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Trials</span>
              <FlaskConical className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">{trials.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">CTRI & AYUSH protocols</p>
          </div>

          <div
            onClick={() => setActiveTab("participants")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === "participants"
                ? "bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participants</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{participants.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Across all clinical sites</p>
          </div>

          <div
            onClick={() => setActiveTab("adverse-events")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === "adverse-events"
                ? "bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safety & SAEs</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">{adverseEvents.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">24h statutory compliance</p>
          </div>

          <div
            onClick={() => setActiveTab("audit")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Records</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{auditLogs.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">21 CFR Part 11 logged</p>
          </div>
        </div>

        {/* Search, Filter & Tabs Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "users", label: "Users & Personas", icon: Users },
              { id: "trials", label: "Clinical Trials", icon: FlaskConical },
              { id: "participants", label: "Cohort Patients", icon: Activity },
              { id: "adverse-events", label: "Adverse Events & SAE", icon: ShieldAlert },
              { id: "audit", label: "Part 11 Audit Trail", icon: FileText },
              { id: "system", label: "System Diagnostics", icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSearchTerm("");
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search bar & Role selector */}
          <div className="flex items-center gap-3">
            {activeTab === "users" && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Roles</option>
                <option value="PI">PI</option>
                <option value="ETHICS">Ethics</option>
                <option value="PV">PV</option>
                <option value="REGULATOR">Regulator</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search in ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 w-48 sm:w-64 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: All Users Details (Har ek user ki details) */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  All System Users & Regulatory Stakeholders
                </h2>
                <p className="text-xs text-slate-400">
                  Showing complete profile, roles, credentials, and institutional affiliations of every user.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-emerald-400 rounded-lg border border-slate-700">
                {filteredUsers.length} Users Listed
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Privileges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredUsers.map((u) => {
                      const roleColor: Record<string, string> = {
                        PI: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                        ETHICS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        PV: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                        REGULATOR: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                        ADMIN: "bg-rose-500/20 text-rose-400 border-rose-500/30",
                      };
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-300">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div>{u.name}</div>
                              <div className="text-[10px] text-slate-500 font-normal">Active Stakeholder</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                roleColor[u.role] || "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                            {u.institution || "National AYUSH Network"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">{String(u.id).slice(0, 13)}...</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "2024-01-15"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Full {u.role} Access
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical Trials */}
        {activeTab === "trials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-teal-400" />
                  All Clinical Trials Under Supervision
                </h2>
                <p className="text-xs text-slate-400">Complete protocol records, CTRI IDs, status and cohort metrics.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-teal-400 rounded-lg border border-slate-700">
                {filteredTrials.length} Trials
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Study ID</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">CTRI Number</th>
                      <th className="py-3 px-4">Phase</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Enrolled / Target</th>
                      <th className="py-3 px-4">Principal Investigator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredTrials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No clinical trials found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredTrials.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-teal-400">{t.study_id}</td>
                          <td className="py-3 px-4 font-bold text-white max-w-sm truncate">{t.title}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{t.ctri_number || "PENDING"}</td>
                          <td className="py-3 px-4 text-slate-300">{t.phase || "Phase II"}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {t.enrolled_count || 0} / {t.target_sample_size || 100}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {t.principal_investigator?.name || "Dr. Rajesh Sharma"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Participants */}
        {activeTab === "participants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  All Clinical Trial Participants
                </h2>
                <p className="text-xs text-slate-400">Enrolled patient cohorts, demographic tracking, and visit statuses.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-cyan-400 rounded-lg border border-slate-700">
                {filteredParticipants.length} Participants
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Subject Code</th>
                      <th className="py-3 px-4">Trial ID</th>
                      <th className="py-3 px-4">Age Group</th>
                      <th className="py-3 px-4">Sex</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Visit</th>
                      <th className="py-3 px-4">Next Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No participants loaded. Use seed script or create participant in PI Portal.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-cyan-400">{p.participant_code}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{p.trial_id}</td>
                          <td className="py-3 px-4 text-slate-300">{p.age_group || "30-45"}</td>
                          <td className="py-3 px-4 text-slate-300">{p.sex || "M"}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{p.last_visit || "2024-02-01"}</td>
                          <td className="py-3 px-4 text-slate-400">{p.next_visit || "2024-03-01"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Adverse Events */}
        {activeTab === "adverse-events" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Pharmacovigilance & SAE Safety Oversight
                </h2>
                <p className="text-xs text-slate-400">All adverse events, MedDRA codes, Ayurvedic correlates, and 24h statutory SAE records.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-rose-400 rounded-lg border border-slate-700">
                {filteredAdverseEvents.length} Events
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Event Term</th>
                      <th className="py-3 px-4">Ayurvedic Correlate</th>
                      <th className="py-3 px-4">MedDRA Term / Code</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">SAE (24h)</th>
                      <th className="py-3 px-4">Causality</th>
                      <th className="py-3 px-4">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredAdverseEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No adverse events recorded.
                        </td>
                      </tr>
                    ) : (
                      filteredAdverseEvents.map((ae) => (
                        <tr key={ae.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{ae.event_term}</td>
                          <td className="py-3 px-4 text-emerald-300 italic">{ae.ayurvedic_term || "N/A"}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {ae.meddra_term || "Unspecified"} ({ae.meddra_code || "—"})
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                ae.severity === "SEVERE"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : ae.severity === "MODERATE"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {ae.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {ae.is_serious ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                                SAE ACTIVE
                              </span>
                            ) : (
                              <span className="text-slate-500">Non-Serious</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{ae.causality || "POSSIBLE"}</td>
                          <td className="py-3 px-4 text-slate-400">{ae.outcome || "RECOVERING"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Part 11 Audit Trail */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Statutory 21 CFR Part 11 Audit Trail
                </h2>
                <p className="text-xs text-slate-400">Cryptographically verifiable, non-repudiable audit logs of every system transaction.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-amber-400 rounded-lg border border-slate-700">
                {auditLogs.length} Logged Actions
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity Type</th>
                      <th className="py-3 px-4">Entity ID</th>
                      <th className="py-3 px-4">Reason for Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs">
                          No audit trail records yet. All updates across trials, participants, and AEs will be logged automatically.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-sans">{log.user_email || "system"}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{log.entity_type}</td>
                          <td className="py-2.5 px-4 text-slate-500 text-[10px]">{String(log.entity_id).slice(0, 8)}...</td>
                          <td className="py-2.5 px-4 text-slate-400 font-sans">{log.reason_for_change || "Statutory audit record"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: System Diagnostics */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Database & Cloud Infrastructure
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="font-bold text-emerald-400">Supabase PostgreSQL / SQLite</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Deployment Target</span>
                  <span className="font-bold text-white">Vercel Serverless (Next.js + FastAPI)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Regulatory Architecture</span>
                  <span className="font-bold text-teal-400">21 CFR Part 11 & AYUSH GCP</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Authentication Protocol</span>
                  <span className="font-bold text-white">JWT Bearer (HS256)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-400" />
                Direct Regulatory Export Links
              </h3>
              <p className="text-xs text-slate-400">Download system data in international regulatory formats:</p>
              <div className="space-y-2">
                <Link
                  href="/exports"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <span>HL7 FHIR R4 Bundle Export</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </Link>
                <Link
                  href="/exports"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <span>CDISC SDTM Dataset (DM & AE Domains)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </Link>
                <Link
                  href="/audit"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <span>Inspection Ready Audit Trail CSV</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
