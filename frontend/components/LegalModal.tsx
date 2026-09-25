"use client";

import React, { useEffect } from "react";
import {
  X,
  Shield,
  FileText,
  Info,
  CheckCircle2,
  Lock,
  Scale,
  Award,
  Leaf,
  ExternalLink,
} from "lucide-react";

export type LegalTabType = "about" | "terms" | "privacy" | "compliance";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
}

export function LegalModal({ isOpen, onClose, initialTab = "about" }: LegalModalProps) {
  const [activeTab, setActiveTab] = React.useState<LegalTabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-emerald-950/30 overflow-hidden flex flex-col max-h-[88vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AyurCTMS Legal & Regulatory Center
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AYUSH GCP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compliance, Transparency & Governance for Ayurvedic Clinical Trials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "about"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            About Us
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "terms"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "privacy"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "compliance"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            AYUSH & 21 CFR Compliance
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-300 text-sm space-y-6 leading-relaxed custom-scrollbar">
          {/* ──── TAB 1: ABOUT US ──── */}
          {activeTab === "about" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Smart India Hackathon (SIH) Initiative
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Pioneering India&apos;s First Ayurveda Clinical Trial Management System
                </h3>
                <p className="text-xs text-slate-300">
                  AyurCTMS is developed as an end-to-end, enterprise-grade Clinical Trial Management
                  System (CTMS) tailored specifically for Ayurvedic and traditional medicine formulations.
                  It bridges traditional Ayurvedic clinical practices with global regulatory standards
                  (ICH-GCP, CDISC, US FDA 21 CFR Part 11).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Problem Statement Solved
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Historically, traditional medicine trials in India faced challenges due to:
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <li>
                    <strong className="text-white">Terminology Fragmentation:</strong> Lack of cross-mapping
                    between classical Ayurvedic diagnosis (Prakriti, Dosha, Dhatu) and modern MedDRA / SNOMED-CT codes.
                  </li>
                  <li>
                    <strong className="text-white">Regulatory Silos:</strong> Difficulty maintaining tamper-evident audit
                    logs required by CDSCO and the Ministry of AYUSH.
                  </li>
                  <li>
                    <strong className="text-white">Standardization Gaps:</strong> Absence of automated CDISC SDTM
                    data structures for classical herbal and poly-herbal formulations.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  Core Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">Dual-Coding Engine</span>
                    Simultaneous coding for WHO MedDRA and NAMASTE (Ayush Terminology) with instant cross-walk.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">CTRI & WHO ICTRP Sync</span>
                    Instant trial lookup and synchronization across 700+ registered clinical trials.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">Pharmacovigilance (ASU)</span>
                    Real-time reporting of Adverse Events and SAEs compliant with Schedule Y & AYUSH ADR guidelines.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">Full 21 CFR Part 11 Audit Trail</span>
                    Immutable SHA-256 hash tracking for every participant data edit, consent, and signature.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──── TAB 2: TERMS & CONDITIONS ──── */}
          {activeTab === "terms" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400 border-b border-slate-800 pb-3">
                Last Updated: September 2026 | Governing Law: Republic of India
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">1. Acceptance of Terms</h4>
                <p className="text-xs text-slate-300">
                  By accessing or utilizing AyurCTMS (&quot;the Platform&quot;), including its trial registry,
                  electronic case report forms (eCRF), and pharmacovigilance modules, you agree to be bound
                  by these Terms & Conditions, the AYUSH GCP Guidelines, and Indian New Drugs & Clinical Trials Rules (2019).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">2. Authorized Clinical Roles & User Credentials</h4>
                <p className="text-xs text-slate-300">
                  Access is strictly provisioned based on verified institutional roles: Principal Investigator (PI),
                  Ethics Committee Member (ETHICS), Pharmacovigilance Officer (PV), Regulatory Inspector (REGULATOR),
                  or System Administrator (ADMIN). Users are legally responsible for safeguarding their digital
                  credentials and Master Keys. Account sharing is strictly prohibited under 21 CFR § 11.200.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">3. Data Integrity & Electronic Signatures</h4>
                <p className="text-xs text-slate-300">
                  All digital approvals, informed consents, and medical evaluation sign-offs executed on AyurCTMS
                  hold the legal equivalence of handwritten signatures pursuant to the Information Technology Act, 2000
                  and 21 CFR Part 11. Any attempt to bypass cryptographic signature verification or tamper with audit logs
                  constitutes a regulatory violation.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">4. Scientific & Research Disclaimer</h4>
                <p className="text-xs text-slate-300">
                  AyurCTMS provides data management and statistical validation workflows for clinical research.
                  Medical diagnoses and prescription decisions remain solely under the professional clinical judgment
                  of qualified AYUSH practitioners and Principal Investigators.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">5. Audit Readiness & Regulatory Inspection</h4>
                <p className="text-xs text-slate-300">
                  Institutions utilizing AyurCTMS acknowledge that regulatory inspectors from the Central Drugs Standard
                  Control Organization (CDSCO) and State Licensing Authorities have lawful rights to review audit logs,
                  eCRFs, and SAE notifications generated through this system.
                </p>
              </div>
            </div>
          )}

          {/* ──── TAB 3: PRIVACY POLICY ──── */}
          {activeTab === "privacy" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="font-bold text-emerald-400 block mb-1">
                  Commitment to Clinical Trial Subject Privacy
                </span>
                AyurCTMS adheres strictly to the Digital Personal Data Protection Act (DPDPA 2023),
                ICMR Ethical Guidelines for Biomedical Research, and international HIPAA de-identification standards.
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">1. Participant De-Identification</h4>
                <p className="text-xs text-slate-300">
                  All clinical trial participants are encoded using unique Subject Identification Numbers (USUBJID)
                  compliant with CDISC SDTM Demographics (DM) specifications. Direct identifiers (Full Names, Aadhaar
                  numbers, phone numbers) are never stored in unencrypted form in analytical registries.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">2. Encrypted Data Transmission & Storage</h4>
                <p className="text-xs text-slate-300">
                  All communications between user browsers and backend endpoints are secured via Transport Layer Security
                  (TLS 1.3). Database tables stored on Supabase PostgreSQL utilize AES-256 transparent data encryption
                  at rest with dedicated row-level security (RLS) policies.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">3. Role-Based Data Isolation</h4>
                <p className="text-xs text-slate-300">
                  Access to sensitive clinical trial datasets is strictly partitioned. Ethics Committees only review
                  anonymized ethical submissions; PV officers only receive safety surveillance data; and only
                  assigned trial site staff can review individual participant visit records.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">4. Zero Commercial Tracking</h4>
                <p className="text-xs text-slate-300">
                  AyurCTMS contains zero commercial advertising trackers, third-party analytics pixels, or
                  data-mining telemetry. All application telemetry is restricted solely to operational uptime
                  and regulatory compliance audit trails.
                </p>
              </div>
            </div>
          )}

          {/* ──── TAB 4: AYUSH & 21 CFR COMPLIANCE ──── */}
          {activeTab === "compliance" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Regulatory Alignment Framework
                </h4>
                <p className="text-xs text-slate-300 mb-3">
                  AyurCTMS has been architected from the ground up to comply with both Indian national standards
                  and international regulatory guidelines for clinical trials:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">US FDA 21 CFR Part 11</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Fully Compliant
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Supports computer-generated, time-stamped audit trails, password aging, two-factor authentication,
                    and non-repudiation electronic signature standards (§11.10 &amp; §11.50).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">Ministry of AYUSH GCP Guidelines</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Standard Practice
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Incorporates classical Ayurvedic outcome measures, Prakriti baseline assessments, and ASU
                    pharmacovigilance timelines (reporting Serious Adverse Events within 24 hours).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">CDISC SDTM v3.3 &amp; HL7 FHIR R4</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Export Ready
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Enables one-click export of clinical trial data into industry-standard CDISC SDTM domains
                    (DM, AE, DS, LB) and interoperable HL7 FHIR JSON bundles for international research submissions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>AyurCTMS • SIH 2024 Verified Platform</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            I Understand / Close
          </button>
        </div>
      </div>
    </div>
  );
}
