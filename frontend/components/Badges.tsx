"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-slate-400">—</span>;

  const normalized = status.toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  if (["ACTIVE", "APPROVED", "ENROLLED", "COMPLETED", "RESOLVED"].includes(normalized)) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["SCREENING", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "PENDING_24H"].includes(normalized)) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (["OVERDUE", "REJECTED", "SUSPENDED", "WITHDRAWN", "FATAL"].includes(normalized)) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (["ENROLLING", "CONDITIONAL"].includes(normalized)) {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${colorClasses}`}
    >
      {normalized}
    </span>
  );
}

export function SeverityBadge({ severity, isSerious }: { severity: string; isSerious?: boolean }) {
  const norm = severity?.toUpperCase();

  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  if (norm === "MILD") bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (norm === "MODERATE") bg = "bg-amber-50 text-amber-700 border-amber-200";
  if (norm === "SEVERE" || isSerious) bg = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${bg}`}>
        {norm || "UNKNOWN"}
      </span>
      {isSerious && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-red-600 text-white shadow-xs">
          <ShieldAlert className="w-3 h-3" />
          SAE
        </span>
      )}
    </span>
  );
}

export function SaeCountdownBadge({
  deadlineString,
  saeStatus,
}: {
  deadlineString?: string | null;
  saeStatus?: string | null;
}) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; isPast: boolean } | null>(null);

  useEffect(() => {
    if (!deadlineString) return;

    function calculate() {
      const target = new Date(deadlineString!).getTime();
      const now = new Date().getTime();
      const diffMs = target - now;

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, isPast: true });
      } else {
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setTimeLeft({ hours, minutes, isPast: false });
      }
    }

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadlineString]);

  if (saeStatus === "NOT_APPLICABLE") return <span className="text-slate-400 text-xs">—</span>;
  if (saeStatus === "SUBMITTED_IN_TIME") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Reported on time
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
        <Clock className="w-3 h-3" />
        Calculating...
      </span>
    );
  }

  if (timeLeft.isPast || saeStatus === "OVERDUE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white animate-urgent-pulse shadow-xs">
        <AlertCircle className="w-3.5 h-3.5" />
        OVERDUE (24h Lapsed)
      </span>
    );
  }

  const isCritical = timeLeft.hours < 6;
  const isWarning = timeLeft.hours < 12;

  let bgClass = "bg-blue-50 text-blue-700 border-blue-200";
  if (isCritical) {
    bgClass = "bg-rose-50 text-rose-700 border-rose-300 animate-urgent-pulse";
  } else if (isWarning) {
    bgClass = "bg-amber-50 text-amber-700 border-amber-300";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${bgClass}`}>
      <Clock className={`w-3.5 h-3.5 ${isCritical ? "text-rose-600" : ""}`} />
      <span>
        {timeLeft.hours}h {timeLeft.minutes}m remaining
      </span>
    </span>
  );
}
