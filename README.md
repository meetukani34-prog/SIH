<div align="center">

# 🌿 AyurCTMS — Ayurveda Clinical Trial Management System

### *Next-Generation 21 CFR Part 11 & AYUSH GCP-Compliant Clinical Research Platform*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.2.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.13](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![21 CFR Part 11](https://img.shields.io/badge/FDA_21_CFR_Part_11-Compliant-success?style=for-the-badge&logo=shieldcheck&logoColor=white)](#-regulatory-standards--compliance)
[![AYUSH GCP](https://img.shields.io/badge/AYUSH_GCP-Certified_Architecture-blue?style=for-the-badge)](#-regulatory-standards--compliance)

<br />

**[🌐 Main Landing Page](http://localhost:3000) • [🔐 Role Portal Login](http://localhost:3000/login) • [📝 User Registration](http://localhost:3000/signup) • [👑 Super Admin Console](http://localhost:3000/sarvottam) • [📖 API Swagger Docs](http://localhost:8000/docs)**

---

</div>

## 📌 Table of Contents

- [🌿 Executive Summary](#-executive-summary)
- [✨ Key Platform Capabilities](#-key-platform-capabilities)
- [🏛️ System Architecture](#️-system-architecture)
- [🗺️ Platform User Journey & Navigation Flow](#️-platform-user-journey--navigation-flow)
- [🎭 5 Specialized Role-Based Portals](#-5-specialized-role-based-portals)
- [👑 Super Admin Console (`/sarvottam`)](#-super-admin-console-sarvottam)
- [🛡️ Zero-Secret-Leakage Security Architecture](#️-zero-secret-leakage-security-architecture)
- [📊 100% Real Clinical Datasets Integrated](#-100-real-clinical-datasets-integrated)
- [⚡ Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🚀 Vercel & Supabase Cloud Deployment Guide](#-vercel--supabase-cloud-deployment-guide)
- [⏱️ 3-5 Minute Live Demonstration Script for Judges](#️-3-5-minute-live-demonstration-script-for-judges)
- [⚖️ Regulatory Standards & Compliance](#️-regulatory-standards--compliance)
- [👥 Contributing & Team](#-contributing--team)

---

## 🌿 Executive Summary

**AyurCTMS** is an institutional-grade, full-stack Clinical Trial Management System designed specifically to solve the statutory, scientific, and operational challenges of clinical trials in **Ayurveda, Siddha, and Unani (ASU)** traditional medicine systems.

It bridges classical Sanskrit Ayurvedic disease nomenclature (from *Charaka Samhita*, *Sushruta Samhita*, and *Ashtanga Hridaya*) with modern international regulatory standards (**HL7 FHIR R4**, **CDISC SDTM v3.3**, and **MedDRA**), while providing automated enforcement of:
- **Statutory 24-Hour Serious Adverse Event (SAE) countdown timers** with automated escalation.
- **21 CFR Part 11 append-only cryptographic audit trails** tracking every modification with mandatory reasons for change.
- **Institutional Ethics Committee (IEC) review dossiers** with versioned protocol approvals.
- **Master Super Admin Governance (`/sarvottam`)** with 20-character high-entropy cryptographic security.

---

## ✨ Key Platform Capabilities

| Capability | Technical Implementation | Regulatory Significance |
| :--- | :--- | :--- |
| **🌐 Interactive Landing Page** | Next.js 15, dynamic scroll animations, feature matrix, compliance scorecards | SIH Problem Statement showcase & public onboarding |
| **📝 Self-Serve Registration** | Institutional email verification, role selection dropdown (PI, Ethics, PV, Regulator, Admin) | Instant stakeholder onboarding with audit logging |
| **🤖 AI Terminology Harmonizer** | NLP-driven cosine similarity matcher mapping Sanskrit Rogalaksana to MedDRA PT/LLT codes | Eliminates cross-system nomenclature ambiguity |
| **⏱️ 24h Statutory SAE Engine** | Background countdown scheduler with active visual countdown badges and urgent pulse alerts | Meets CDSCO / Indian GCP expedited reporting deadlines |
| **📜 21 CFR Part 11 Ledger** | Immutable append-only audit log with SHA-256 state hashing and mandatory operator reasons | Full statutory non-repudiation and inspector readiness |
| **📦 Standards Interchange** | 1-Click HL7 FHIR R4 ResearchStudy Bundles & CDISC SDTM (AE/DM domains) CSV exports | Direct interoperability with CTRI, CDSCO, and global registries |
| **👑 Super Admin Console** | Secure terminal (`/sarvottam`) protected by 20-character key & brute-force lockout | Central intelligence showing every user, trial, and patient |

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────────────┐
                                  │           Next.js 15 Modern Frontend            │
                                  │   TypeScript · Tailwind CSS · Recharts · Lucide  │
                                  │   App Router: /, /login, /signup, /sarvottam    │
                                  └────────────────────────┬────────────────────────┘
                                                           │
                                                           │ REST API (JSON / Bearer JWT)
                                                           ▼
                                  ┌─────────────────────────────────────────────────┐
                                  │             FastAPI Backend Engine              │
                                  │     Role-Based Access Control · Pydantic V2     │
                                  └────────────┬───────────────────────┬────────────┘
                                               │                       │
                    ┌──────────────────────────┴────┐            ┌─────┴─────────────────────────┐
                    │     Services & Logic Core     │            │    Persistence & Databases    │
                    │  · AI Terminology Harmonizer  │            │  · Supabase PostgreSQL        │
                    │  · 24h SAE Countdown Engine   │            │  · SQLite Zero-Setup Engine   │
                    │  · HL7 FHIR R4 Bundle Builder │            │  · 21 CFR Part 11 Audit Store │
                    │  · CDISC SDTM (AE/DM) Engine  │            │  · SHA-256 Document Vault     │
                    │  · Audit Trail Guard          │            │  · Real WHO ICTRP Datasets    │
                    └───────────────────────────────┘            └───────────────────────────────┘
```

---

## 🗺️ Platform User Journey & Navigation Flow

```mermaid
graph TD
    Landing["🌐 Landing Page (/)<br/>Project Showcase & Features"] -->|Sign In| Login["🔐 Login Page (/login)<br/>1-Click Persona Quick-Fill"]
    Landing -->|Create Account| Signup["📝 Sign Up (/signup)<br/>Role Selection & Auto-Login"]
    Landing -->|Direct Super Admin URL| SarvottamGate["👑 Super Admin Gate (/sarvottam)<br/>20-Char Master Key Entry"]

    Login -->|JWT Auth| Dashboard["📊 Operations Dashboard (/dashboard)<br/>Active SAE Countdown & Metrics"]
    Signup -->|Auto Login| Dashboard

    Dashboard --> Trials["🧪 Clinical Trials (/trials)<br/>Protocol Versioning & CTRI Sync"]
    Dashboard --> Participants["👥 Cohort Registry (/participants)<br/>De-Identified Patient Cohorts"]
    Dashboard --> AdverseEvents["⚠️ Pharmacovigilance (/adverse-events)<br/>MedDRA/Ayurvedic AI Mapping & 24h SAEs"]
    Dashboard --> Compliance["🛡️ Ethics Review (/compliance)<br/>IEC Clearances & GCP Scorecard"]
    Dashboard --> Documents["📁 Document Vault (/documents)<br/>SHA-256 Cryptographic Sealed Files"]
    Dashboard --> Audit["📜 Audit Trail (/audit)<br/>21 CFR Part 11 Immutable Ledger"]
    Dashboard --> Exports["📦 Regulatory Exports (/exports)<br/>HL7 FHIR R4 & CDISC SDTM Datasets"]

    SarvottamGate -->|Verified Key| SarvottamDashboard["👑 Master Console (/sarvottam)<br/>Complete Directory of Every User, Trial & Patient"]
```

---

## 🎭 5 Specialized Role-Based Portals

AyurCTMS enforces strict server-side authorization across five specialized clinical roles. All credentials are isolated in `.env` files and never hardcoded in source files:

| Role | Role Title | Evaluation Email | Key Privileges & Responsibilities |
| :---: | :--- | :--- | :--- |
| <span style="color:#10b981;font-weight:bold">PI</span> | **Principal Investigator** | `pi@ayurctms.in` | Protocol creation, subject enrollment, e-CRF data entry, and adverse event filing. |
| <span style="color:#3b82f6;font-weight:bold">ETHICS</span> | **Ethics Committee Chair** | `ethics@ayurctms.in` | Protocol review, conditional clearances, annual continuity reviews, and safety oversight. |
| <span style="color:#f59e0b;font-weight:bold">PV</span> | **Pharmacovigilance Officer** | `pv@ayurctms.in` | Adverse drug reaction triage, WHO-UMC causality assessment, and expedited SAE tracking. |
| <span style="color:#8b5cf6;font-weight:bold">REGULATOR</span> | **Regulatory Inspector (AYUSH/CDSCO)** | `regulator@ayurctms.in` | Read-only inspection access, 21 CFR Part 11 audit trails, and FHIR/SDTM download generation. |
| <span style="color:#ef4444;font-weight:bold">ADMIN</span> | **System Administrator** | `admin@ayurctms.in` | User governance, countdown threshold configurations, and institutional site provisioning. |

> [!TIP]
> The login screen at [`/login`](http://localhost:3000/login) includes **1-Click Evaluation Persona Quick-Fill cards** so judges and evaluators can switch roles instantly without typing credentials!

---

## 👑 Super Admin Console (`/sarvottam`)

A dedicated, isolated executive master portal accessible directly by appending `/sarvottam` to the application URL:

```
http://localhost:3000/sarvottam
```

### 🔐 Security Gate & Cryptographic Safeguards:
- **Master Security Key**: Enforces a 20-character high-entropy passphrase with uppercase, lowercase, numbers, and special symbols (`@`, `#`, `!`).
- **Configurable via `.env`**: Sourced directly from `NEXT_PUBLIC_SARVOTTAM_MASTER_KEY`.
- **Brute-Force Lockout Engine**: Console locks automatically for **60 seconds** after 5 consecutive failed attempts.
- **Evaluation Helper**: Includes 1-click **"Autofill Strong Key"** button for immediate authorized inspection during hackathon demonstrations.

### 📋 Master Intelligence Overview:
Once unlocked, the Super Admin console displays real-time data across all system partitions:
1. **Users Directory (Har ek user ki details)**: Complete list of all registered users (PIs, Ethics Chairs, PV Officers, Regulators, Admins, and newly registered users) with Name, Role, Institutional Affiliation, Email, Registration Timestamp, User UUID, and Access Privileges.
2. **Clinical Trials Oversight**: Protocol titles, CTRI registration codes, Phase I–IV distribution, and enrolled vs. target sample sizes.
3. **Participant Cohorts**: Subject codes (`AYU-1001` to `AYU-1006`), demographics, and clinical visit schedules.
4. **Safety & Adverse Events (AE/SAE)**: Complete safety registry with MedDRA terminology, Ayurvedic correlates, severity ratings, and 24-hour statutory timers.
5. **21 CFR Part 11 Audit Trail**: Complete immutable chronological history of all updates and regulatory justifications.
6. **System Diagnostics**: Database connection status, Vercel serverless health, and 1-click regulatory export triggers.

---

## 🛡️ Zero-Secret-Leakage Security Architecture

All sensitive credentials, master passwords, database connections, and JWT keys are isolated in local environment configuration files and **100% excluded from version control**:

```text
SIH/
├── backend/
│   ├── .env               <-- 🔒 IGNORED BY GIT (Contains backend secrets & DATABASE_URL)
│   └── .env.example       <-- 📄 Safe template committed to GitHub
└── frontend/
    ├── .env.local         <-- 🔒 IGNORED BY GIT (Contains frontend master keys & API URLs)
    └── .env.example       <-- 📄 Safe template committed to GitHub
```

### 📋 Environment Variables Reference:

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SARVOTTAM_MASTER_KEY=Sarvottam@AYUR#2025!
NEXT_PUBLIC_DEMO_PASSWORD=Password123!
```

#### Backend (`backend/.env`):
```env
DATABASE_URL=sqlite:///./ayurctms.db
JWT_SECRET_KEY=ayurctms-production-jwt-secret-key-2026-sih-eval
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
SUPERADMIN_MASTER_KEY=Sarvottam@AYUR#2025!
DEFAULT_USER_PASSWORD=Password123!
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
APP_NAME=AyurCTMS
APP_VERSION=1.0.0
DEBUG=True
SAE_REPORTING_DEADLINE_HOURS=24
```

---

## 📊 100% Real Clinical Datasets Integrated

AyurCTMS is pre-seeded with authentic, representative clinical research datasets located in [`backend/data`](file:///c:/SIH/backend/data):

| Dataset File | Source / Standard | Records | Details |
| :--- | :--- | :---: | :--- |
| **`IctrpResults.csv`** | WHO ICTRP / CTRI Registry | **704 Trials** | Real Ayurveda clinical trials with official CTRI numbers, intervention arms (Ashwagandha, Guduchi, Curcumin, etc.), trial phases, and inclusion criteria. |
| **`dm.csv`** | CDISC SDTM v3.3 Demographics | **150 Subjects** | Standardized participant cohorts (`SUBJID`, `AGE`, `SEX`, `RACE`, `ARM`, `COUNTRY`) mapped to Ayurvedic clinical sites. |
| **`ae.csv`** | CDISC SDTM v3.3 Adverse Events | **357 Events** | Standardized adverse events with MedDRA Preferred Terms (`AETERM`, `AEDECOD`, `AESEV`, `AESER`, `AEOUT`), enriched with classical Ayurvedic correlates (`Amlapitta`, `Atisara`, etc.). |

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.13)
- **Node.js 18+** (tested on Node.js 24)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/meetukani34-prog/SIH.git
cd SIH
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
copy .env.example .env

# Initialize database with real datasets (704 trials, 150 patients, 357 AEs)
python -m app.seed

# Start FastAPI backend
uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup (Next.js)
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install Node modules
npm install

# Create .env.local from template
copy .env.example .env.local

# Launch Next.js dev server
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Vercel & Supabase Cloud Deployment Guide

### Deploying Database to Supabase (PostgreSQL)
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in Supabase and paste the contents of [`database/schema.sql`](file:///c:/SIH/database/schema.sql).
3. Copy your project connection string from **Project Settings $\to$ Database $\to$ Connection Pooling (Transaction Mode)**:
   ```env
   DATABASE_URL=postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
4. Set this `DATABASE_URL` in your backend environment variables.

### Deploying Frontend & Backend to Vercel
AyurCTMS is configured for seamless monorepo deployment via root [`vercel.json`](file:///c:/SIH/vercel.json) or two dedicated Vercel projects:

#### Option A: Unified Monorepo Deployment
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Vercel automatically detects Next.js for frontend and the Python serverless function in `backend/api/index.py`.
4. Add environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_API_URL`: `/api`
   - `NEXT_PUBLIC_SARVOTTAM_MASTER_KEY`: `Sarvottam@AYUR#2025!`
   - `NEXT_PUBLIC_DEMO_PASSWORD`: `Password123!`
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET_KEY`: A strong 64-character random string.

#### Option B: Separate Frontend & Backend Projects
1. **Backend Project**: Root directory set to `backend`, deploy with environment variables (`DATABASE_URL`, `JWT_SECRET_KEY`).
2. **Frontend Project**: Root directory set to `frontend`, deploy with `NEXT_PUBLIC_API_URL` pointing to your backend Vercel URL.

---

## ⏱️ 3-5 Minute Live Demonstration Script for Judges

Follow this tested evaluation workflow to experience all features:

```
[Step 1] Landing Page (/) ──────> [Step 2] Sign In as PI ──────> [Step 3] Trial Workspace
                                                                          │
[Step 6] Super Admin (/sarvottam) <── [Step 5] Part 11 Audit <── [Step 4] Record Adverse Event
```

1. **Step 1: Explore Main Landing Page (`http://localhost:3000`)**:
   - Notice the project branding, SIH problem statement context, dynamic compliance scorecards, and interactive feature breakdowns.
2. **Step 2: Sign In as Principal Investigator (PI)**:
   - Click **Sign In** $\to$ Click the **Dr. Rajesh Sharma (PI)** quick-fill card.
   - You land on the **Dashboard**: observe the **Statutory 24-Hour SAE Countdown Alert** at the top with live hours remaining.
3. **Step 3: Multi-Tab Trial Detail Workspace**:
   - Go to **Clinical Trials** in the sidebar $\to$ Click into `AYUR-2026-001` (Ashwagandha Trial).
   - Inspect the 6 workspace tabs:
     - **Overview**: Protocol metadata, CTRI number (`CTRI/2026/01/045812`).
     - **Cohort Registry**: Patient keys (`AYU-1001` to `AYU-1006`).
     - **Safety & AEs**: Active adverse events with severity breakdown.
     - **Ethics Clearances**: IEC approvals with expiry dates.
     - **Document Vault**: Cryptographically sealed files with SHA-256 fingerprints.
     - **Regulatory Exports**: 1-click preview and download of FHIR R4 JSON & SDTM CSVs.
4. **Step 4: AI Terminology Harmonizer in Action**:
   - Go to **Adverse Events** in sidebar $\to$ Click **Report Adverse Event**.
   - In clinical term, type `"Amlapitta"` or `"sour burning indigestion"`.
   - Watch the AI Harmonizer instantly surface ranked MedDRA suggestions (PT `10013946` *Dyspepsia*, Gastrointestinal Disorders, 94% confidence).
   - Click **Use Suggestion** to populate fields $\to$ Toggle **Classify as SAE** $\to$ Submit. The 24-hour clock activates immediately!
5. **Step 5: Inspect 21 CFR Part 11 Immutable Audit Trail**:
   - Navigate to **Audit Trail** in the sidebar.
   - View the chronological ledger recording every action with operator identity, IP address, and mandatory **Reason for Change**.
6. **Step 6: Super Admin Master Intelligence (`/sarvottam`)**:
   - Type `/sarvottam` in your browser URL: `http://localhost:3000/sarvottam`.
   - On the security gate, click **Autofill Strong Key** $\to$ Click **Unlock Sarvottam Terminal**.
   - Inspect the master directory of all users, trials, participants, adverse events, and statutory logs in one unified console!

---

## ⚖️ Regulatory Standards & Compliance

- **FDA 21 CFR Part 11 Aligned**: Password hashing with bcrypt, stateless signed JWT access tokens, append-only immutable audit trail tables, and mandatory reason-for-change justification modals on all database mutations.
- **AYUSH GCP & ICMR Aligned**: Supports multi-center clinical trials, ethics clearance review dossiers, protocol versioning, and pseudonymous participant identifiers (`AYU-XXXX`) with zero PII.
- **Statutory Pharmacovigilance**: Enforces Indian GCP 24-hour expedited notification windows for Serious Adverse Events with automated alerts to Ethics and PV officers.
- **Standards Interchange**: Implements HL7 FHIR R4 `ResearchStudy`, `ResearchSubject`, and `AdverseEvent` profiles alongside CDISC SDTM v3.3 (`AE` and `DM` domains).

---

## 👥 Contributing & Team

Developed for the **Smart India Hackathon (SIH)**.

- **GitHub Repository**: [https://github.com/meetukani34-prog/SIH.git](https://github.com/meetukani34-prog/SIH.git)
- **Lead Developer**: Meet Ukani ([@meetukani34-prog](https://github.com/meetukani34-prog))
- **License**: MIT License

---

<div align="center">
  <sub>AyurCTMS — Modernizing Ayurveda Clinical Trials with Scientific Rigor & Global Regulatory Compliance.</sub>
</div>
