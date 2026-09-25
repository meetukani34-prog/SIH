"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  ShieldAlert,
  Sparkles,
  FileCheck2,
  FolderLock,
  History,
  Download,
  Settings,
  LogOut,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser, removeToken } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "OPERATIONAL CORE",
    items: [
      { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
      { href: "/trials", label: "Clinical Trials", icon: FlaskConical },
      { href: "/participants", label: "Cohort Registry", icon: Users },
    ],
  },
  {
    label: "SAFETY & PHARMACOVIGILANCE",
    items: [
      { href: "/adverse-events", label: "Safety & Signals", icon: ShieldAlert, highlight: "24h" },
      { href: "/terminology", label: "AI Terminology", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    label: "GOVERNANCE & STATUTORY",
    items: [
      { href: "/compliance", label: "Compliance & CAPA", icon: FileCheck2 },
      { href: "/documents", label: "Document Vault", icon: FolderLock },
      { href: "/audit", label: "Audit Trail Ledger", icon: History },
    ],
  },
  {
    label: "DATA INTERCHANGE",
    items: [
      { href: "/exports", label: "Regulatory Exports", icon: Download, badge: "FHIR/SDTM" },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
          <Leaf className="w-5 h-5 text-emerald-100" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">AyurCTMS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              GCP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Ayurveda Clinical Trials</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.highlight}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Current User & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="min-w-0 flex-1 mr-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Dr. Rajesh Sharma"}</p>
              <span className="text-[10px] px-1.5 py-0.5 font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {user?.role || "PI"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || "pi@ayurctms.in"}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
