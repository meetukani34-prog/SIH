"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Clock,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
} from "lucide-react";
import { api, getCurrentUser, setCurrentUser, setToken } from "@/lib/api";
import { NotificationItem, UserRole } from "@/lib/types";
import { OmniSearch } from "@/components/OmniSearch";

const DEMO_PERSONAS: { role: UserRole; name: string; email: string; institution: string }[] = [
  { role: "PI", name: "Dr. Rajesh Sharma", email: "pi@ayurctms.in", institution: "AIIA New Delhi" },
  { role: "ETHICS", name: "Dr. Sunita Patel", email: "ethics@ayurctms.in", institution: "Institutional Ethics Review Board" },
  { role: "PV", name: "Dr. Anand Verma", email: "pv@ayurctms.in", institution: "National Pharmacovigilance Centre" },
  { role: "REGULATOR", name: "Officer K. S. Rao", email: "regulator@ayurctms.in", institution: "Ministry of AYUSH / CDSCO" },
  { role: "ADMIN", name: "System Administrator", email: "admin@ayurctms.in", institution: "AyurCTMS Operations" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserState, setCurrentUserState] = useState(getCurrentUser());
  const [timeUtc, setTimeUtc] = useState("");
  const [timeIst, setTimeIst] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    function updateClocks() {
      const now = new Date();
      setTimeUtc(
        now.toUTCString().replace("GMT", "UTC").split(" ").slice(4, 5).join("") + " UTC"
      );
      setTimeIst(
        now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }) + " IST"
      );
    }
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onUserChanged = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setCurrentUserState(custom.detail);
      } else {
        setCurrentUserState(getCurrentUser());
      }
    };
    window.addEventListener("ayurctms_user_changed", onUserChanged);
    return () => window.removeEventListener("ayurctms_user_changed", onUserChanged);
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch {}
    }
    loadNotifications();
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSwitchRole = async (persona: (typeof DEMO_PERSONAS)[0]) => {
    try {
      // 1. Optimistic instant local update (0ms latency, no page refresh)
      const personaUser = {
        id: `user-${persona.role.toLowerCase()}`,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        institution: persona.institution,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(personaUser);
      setCurrentUserState(personaUser);
      setShowRoleMenu(false);

      // 2. Dispatch cross-component event so Dashboard & Sidebar immediately render the role's view
      window.dispatchEvent(new CustomEvent("ayurctms_user_changed", { detail: personaUser }));

      // 3. Authenticate with backend in background to refresh JWT token
      const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Password123!";
      api.login(persona.email, demoPassword).then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setCurrentUserState(data.user);
        }
      }).catch(() => {
        // Silently preserve local session if backend auth is slow/offline
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Humanize pathname
  const pageTitle =
    pathname.split("/")[1]
      ? pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1).replace("-", " ")
      : "Dashboard";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
        <span className="text-xs text-slate-400 font-normal">|</span>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          21 CFR Part 11 Active Ledger
        </span>
      </div>

      {/* Right controls: OmniSearch, Statutory Clock, Role Quick-Switch, Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          title="Open Global Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search studies, CTRI, subjects...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-400">Ctrl K</kbd>
        </button>

        {/* Statutory Dual Regulatory Clock */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeIst}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{timeUtc}</span>
        </div>

        {/* Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role: {currentUserState?.role || "PI"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">Switch Persona (Live Demo)</p>
                <p className="text-[11px] text-slate-500">FastAPI backend enforces role-level security</p>
              </div>
              <div className="space-y-1">
                {DEMO_PERSONAS.map((p) => {
                  const isCurrent = currentUserState?.role === p.role;
                  return (
                    <button
                      key={p.role}
                      onClick={() => handleSwitchRole(p)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start justify-between transition-colors ${
                        isCurrent
                          ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-bold border border-slate-200">
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{p.institution}</p>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-xs font-bold text-slate-800">Statutory Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No new safety alerts.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        n.is_read ? "bg-slate-50 text-slate-600" : "bg-rose-50/70 border border-rose-100 text-rose-950"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.severity === "CRITICAL" ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <OmniSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
}
