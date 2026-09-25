# AyurCTMS — Ayurveda Clinical Trial Management System

> **A 21 CFR Part 11 & AYUSH GCP-compliant Clinical Research Platform designed for Ayurveda and Traditional Medicine.**

---

## 🌿 Executive Summary

**AyurCTMS** is an institutional-grade, full-stack Clinical Trial Management System tailored specifically to solve the unique operational and statutory challenges of Ayurvedic and ASU (Ayurveda, Siddha, Unani) clinical research. 

It bridges classical Sanskrit Ayurvedic terminology (Charaka / Sushruta Samhita nomenclature) with international regulatory standards (HL7 FHIR R4, CDISC SDTM v3.3, and MedDRA) while automating mandatory pharmacovigilance workflows, such as the statutory **24-Hour Serious Adverse Event (SAE) countdown** and **21 CFR Part 11 append-only audit trail ledgers**.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      AyurCTMS Frontend (Next.js 16)      │
                                  │  TypeScript · Tailwind CSS · Recharts   │
                                  └────────────────────┬────────────────────┘
                                                       │  REST / JWT Auth
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │      FastAPI Backend Engine (Python)    │
                                  │  Role-Based Access Control (5 Roles)   │
                                  └────────────┬───────────────┬────────────┘
                                               │               │
                    ┌──────────────────────────┴────┐    ┌─────┴─────────────────────────┐
                    │  Services & Logic Layer       │    │  Database / Persistence        │
                    │  · AI Terminology Harmonizer  │    │  · PostgreSQL (Supabase)       │
                    │  · 24h SAE Countdown Engine   │    │  · Local SQLite Fallback       │
                    │  · HL7 FHIR R4 Bundle Builder │    │  · 21 CFR Part 11 Ledger       │
                    │  · CDISC SDTM (AE/DM) Engine  │    │  · SHA-256 Document Vault      │
                    │  · 21 CFR Part 11 Audit Guard │    └───────────────────────────────┘
                    └───────────────────────────────┘
```

---

## 🎭 5 Role-Based Demo Accounts

AyurCTMS enforces strict server-side authorization across five specialized clinical roles. All credentials, database connection strings, and master keys are managed securely via `.env` files (see `backend/.env.example` and `frontend/.env.example`) and are strictly kept out of version control.

| Role | Demo User | Email | Institutional Scope |
| :--- | :--- | :--- | :--- |
| **PI** | Dr. Rajesh Sharma | `pi@ayurctms.in` | Protocol creation, subject enrollment, safety event reporting |
| **ETHICS** | Dr. Sunita Patel | `ethics@ayurctms.in` | Institutional Ethics Committee (IEC) clearances & conditional approvals |
| **PV** | Dr. Anand Verma | `pv@ayurctms.in` | Pharmacovigilance safety assessment, causality (WHO-UMC), SAE triage |
| **REGULATOR** | Officer K. S. Rao | `regulator@ayurctms.in` | AYUSH / CDSCO inspection, 21 CFR Part 11 audit ledger, FHIR/SDTM export |
| **ADMIN** | System Administrator | `admin@ayurctms.in` | User governance, countdown threshold settings, site configuration |

*(Note: The login screen includes 1-click **Evaluation Persona Quick-Fill buttons** for immediate testing without manual typing).*

---

## ⚡ Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js 24)

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run initial seed data
python -m app.seed

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend Setup (Next.js)
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## ⏱️ 3-5 Minute Live Demonstration Script (For Judges)

1. **Sign in as Principal Investigator (PI)**:
   - Go to `http://localhost:3000/login` and click the **Dr. Rajesh Sharma (PI)** quick-fill card.
   - You are routed to the **Dashboard**: observe the active clinical trials (`AYUR-2026-001`, `AYUR-2026-002`, `AYUR-2026-003`), pseudonymous cohort count, and the **Statutory 24-Hour SAE Countdown Alert** at the top.
2. **Inspect Multi-Tab Trial Detail Workspace**:
   - Click **Clinical Trials** in the sidebar $\to$ Click into `AYUR-2026-001` (Ashwagandha Anxiety Trial).
   - Explore the 6 workspace tabs:
     - **Overview**: Protocol metadata, CTRI number, target sample size.
     - **Cohort Registry**: Pseudonymous subject keys (`AYU-1001` through `AYU-1006`).
     - **Safety & AEs**: The recorded Serious Adverse Event with active countdown.
     - **Ethics Clearances**: IEC approvals with annual review dates.
     - **Document Vault**: Cryptographically sealed files with SHA-256 fingerprints.
     - **Regulatory Exports**: 1-click preview and download of FHIR R4 JSON and SDTM CSVs.
3. **Trigger AI Terminology Harmonizer & Report Safety Incident**:
   - Go to **Safety & AEs** $\to$ Click **Record Adverse Event**.
   - Type `"Amlapitta"` or `"sour burning eructation"` into the clinical observation field.
   - Watch the AI Harmonizer instantly surface ranked MedDRA suggestions (PT `10013946` *Dyspepsia*, Gastrointestinal Disorders, 94% confidence).
   - Click **Use** to auto-populate the regulatory fields.
   - Toggle **Classify as Serious Adverse Event (SAE)** $\to$ Click **Submit SAE**. The statutory 24-hour clock activates.
4. **Inspect 21 CFR Part 11 Audit Trail Ledger**:
   - Navigate to **Audit Trail Ledger** in the sidebar.
   - Observe that every action, status change, and safety event has recorded an append-only entry with timestamp, operator email, role, and the mandatory **Reason for Change**.
   - Click **Diff** on any row to inspect side-by-side JSON old vs. new values.
5. **Switch Role to Institutional Ethics Reviewer (ETHICS)**:
   - Use the top-bar role switcher or log out and log in as `ethics@ayurctms.in`.
   - Go to **Ethics & Clearances**: adjudicate an open dossier (*Approve* / *Conditional* / *Reject*).
   - Notice the statutory prompt demanding a clinical reason before the approval is ratified.
6. **Regulatory Data Export (REGULATOR)**:
   - Switch role to `regulator@ayurctms.in`.
   - Navigate to **Regulatory Exports**: preview the HL7 FHIR R4 bundle in real-time, then download the CDISC SDTM AE Domain CSV.

---

## 🗄️ Supabase PostgreSQL Integration

By default, AyurCTMS operates out-of-the-box on local SQLite for zero-friction evaluation. To connect to a hosted **Supabase** instance:
1. Create a project in [Supabase](https://supabase.com).
2. Execute `database/schema.sql` in the Supabase SQL Editor.
3. In `backend/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. Re-run `python -m app.seed` to seed the cloud database.

---

## ⚖️ Standards & Compliance Disclaimers

- **21 CFR Part 11 Aligned**: Employs password hashing (bcrypt), signed JWT access tokens, append-only immutable audit trail tables, and mandatory reason-for-change justification modals on all data updates.
- **AYUSH GCP & ICMR Aligned**: Incorporates multi-center clinical trials, ethics clearance review types, protocol versioning, and pseudonymous participant identifiers (`AYU-XXXX`) with zero personal identifiable information (PII).
- **Statutory Pharmacovigilance**: Configurable SAE expedited notification window (default 24 hours per Indian GCP guidelines) with automated alerts to Ethics and PV officers.
- **Standards Interchange**: HL7 FHIR R4 ResearchStudy bundles and CDISC SDTM v3.3 (AE & DM domains) are compliant demonstration profiles.
- **AI Terminology Harmonization**: Operates as a clinical decision-support suggestion engine. All AI-suggested MedDRA and Ayurvedic mappings should be verified by the Principal Investigator before final statutory submission.

---

## 📊 Standards, Synthetic Datasets & Sensitive Data Safeguards

Because clinical-trial data constitutes sensitive personal health data, AyurCTMS is architected to utilize **synthetic, de-identified datasets** modeled strictly against representative public sources and national standards:

1. **Clinical Trials Registry – India (CTRI)** (`ctri.nic.in`):
   - All trial records model the official CTRI registry schema: CTRI registration numbers (e.g. `CTRI/2026/01/045812`), clinical phases, ASU intervention arms, comparator placebos, inclusion/exclusion criteria, and Institutional Ethics Committee Registration Numbers (`ECR/124/Inst/DL/2023`).
   - Direct CTRI verification links are provided in the trial workspace and export center.

2. **CDISC Standards & Controlled Terminology** (`cdisc.org`):
   - **CDASH (Clinical Data Acquisition Standards Harmonization)**: Applied to all Case Report Form (CRF) input schemas.
   - **SDTM v3.3 (Study Data Tabulation Model)**: Pre-built dataset generators for **AE** (Adverse Events), **DM** (Demographics), and **DS** (Disposition) domains with NCI Controlled Terminology.
   - **Define-XML 2.1 & ADaM**: Aligned data definitions ready for regulatory review dossiers.

3. **HL7 FHIR R4 & ABDM Building Blocks (Ayushman Bharat Digital Mission)**:
   - Implements the **National Health Authority (NHA)** / **NRCES** FHIR R4 profiles for clinical research:
     - `ResearchStudy`: Study protocol metadata and CTRI identifiers.
     - `ResearchSubject`: De-identified participant entities with **ABHA tokenized pseudonyms** (`ABHA-PSEUDO-AYUXXXX`).
     - `AdverseEvent`: MedDRA-coded safety events with WHO-UMC causality.
     - `Consent`: ABDM Electronic Informed Consent artefact with active opt-in status.

