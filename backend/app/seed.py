"""Database Seeder — Populates AyurCTMS with comprehensive clinical trials, cohorts, safety events, and demo accounts."""

import uuid
import hashlib
from datetime import datetime, timezone, timedelta, date
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.site import Site
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent
from app.models.ethics_review import EthicsReview
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.auth.security import get_password_hash


def seed_database():
    print("--- Initializing AyurCTMS Database Seed ---")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "pi@ayurctms.in").first():
            print("Database already contains demo seed data. Skipping creation.")
            return

        now_utc = datetime.now(timezone.utc)
        today = date.today()

        # 1. Users (5 Distinct Roles for Demonstration)
        pw_hash = get_password_hash("Password123!")
        
        pi_user = User(
            name="Dr. Rajesh Sharma",
            email="pi@ayurctms.in",
            password_hash=pw_hash,
            role="PI",
            institution="All India Institute of Ayurveda (AIIA), New Delhi"
        )
        ethics_user = User(
            name="Dr. Sunita Patel",
            email="ethics@ayurctms.in",
            password_hash=pw_hash,
            role="ETHICS",
            institution="Institutional Ethics Review Committee, New Delhi"
        )
        pv_user = User(
            name="Dr. Anand Verma",
            email="pv@ayurctms.in",
            password_hash=pw_hash,
            role="PV",
            institution="National Pharmacovigilance Coordination Centre (NPvCC)"
        )
        regulator_user = User(
            name="Officer K. S. Rao",
            email="regulator@ayurctms.in",
            password_hash=pw_hash,
            role="REGULATOR",
            institution="Ministry of AYUSH / CDSCO Inspectorate"
        )
        admin_user = User(
            name="System Administrator",
            email="admin@ayurctms.in",
            password_hash=pw_hash,
            role="ADMIN",
            institution="AyurCTMS Platform Operations"
        )

        db.add_all([pi_user, ethics_user, pv_user, regulator_user, admin_user])
        db.commit()
        db.refresh(pi_user)
        db.refresh(ethics_user)
        db.refresh(pv_user)
        db.refresh(regulator_user)
        db.refresh(admin_user)
        print("Created 5 role-based accounts (Password: Password123!)")

        # 2. Clinical Trial Sites
        site_delhi = Site(
            name="AIIA Clinical Research Hospital",
            location="New Delhi, India",
            institution="All India Institute of Ayurveda",
            contact_name="Dr. Rajesh Sharma",
            contact_email="sharma.delhi@aiia.gov.in"
        )
        site_jamnagar = Site(
            name="IPGT&RA Clinical Center",
            location="Jamnagar, Gujarat",
            institution="Institute of Teaching & Research in Ayurveda",
            contact_name="Dr. H. M. Joshi",
            contact_email="joshi@itra.edu.in"
        )
        site_jaipur = Site(
            name="National Institute of Ayurveda Hospital",
            location="Jaipur, Rajasthan",
            institution="National Institute of Ayurveda",
            contact_name="Dr. V. K. Gupta",
            contact_email="gupta@nia.edu.in"
        )
        db.add_all([site_delhi, site_jamnagar, site_jaipur])
        db.commit()
        db.refresh(site_delhi)
        db.refresh(site_jamnagar)
        db.refresh(site_jaipur)
        print("Created 3 clinical trial research sites.")

        # 3. Clinical Trials
        trial_1 = Trial(
            study_id="AYUR-2026-001",
            ctri_number="CTRI/2026/01/045812",
            title="Efficacy and Safety of Standardized Ashwagandha (Withania somnifera) Extract in Generalized Anxiety Disorder (Chittodvega)",
            short_title="Ashwagandha in Generalized Anxiety Disorder",
            phase="Phase IIb",
            study_type="Interventional, Double-Blind, Randomized, Placebo-Controlled",
            intervention="Standardized Withania somnifera (600mg daily) vs Placebo",
            indication="Generalized Anxiety Disorder (ICD-10 F41.1 / Chittodvega)",
            principal_investigator_id=pi_user.id,
            site_id=site_delhi.id,
            target_sample_size=120,
            enrolled_count=68,
            status="ACTIVE",
            start_date=today - timedelta(days=90),
            expected_completion_date=today + timedelta(days=180),
            ethics_approval_date=today - timedelta(days=120),
            ethics_renewal_date=today + timedelta(days=245),
            protocol_version="2.1"
        )

        trial_2 = Trial(
            study_id="AYUR-2026-002",
            ctri_number="CTRI/2026/03/051289",
            title="Multi-Center Evaluation of Curcumin-Boswellia Serrata Formulation in Knee Osteoarthritis (Sandhigata Vata)",
            short_title="Curcumin-Boswellia in Knee Osteoarthritis",
            phase="Phase III",
            study_type="Interventional, Active-Controlled, Non-Inferiority",
            intervention="Curcuma longa + Boswellia serrata synergistic extract (500mg BID)",
            indication="Knee Osteoarthritis / Sandhigata Vata",
            principal_investigator_id=pi_user.id,
            site_id=site_jamnagar.id,
            target_sample_size=250,
            enrolled_count=142,
            status="ACTIVE",
            start_date=today - timedelta(days=150),
            expected_completion_date=today + timedelta(days=210),
            ethics_approval_date=today - timedelta(days=180),
            ethics_renewal_date=today + timedelta(days=185),
            protocol_version="3.0"
        )

        trial_3 = Trial(
            study_id="AYUR-2026-003",
            ctri_number="CTRI/2026/05/062104",
            title="Safety, Tolerability & Immunomodulatory Biomarkers of Guduchi Ghana Vati in Pre-Diabetic Metabolic Syndrome",
            short_title="Guduchi Ghana Vati in Metabolic Syndrome",
            phase="Phase IIa",
            study_type="Interventional, Open-Label, Biomarker Endpoint",
            intervention="Tinospora cordifolia aqueous extract (1000mg daily)",
            indication="Metabolic Syndrome & Impaired Fasting Glucose (Prameha Poorvarupa)",
            principal_investigator_id=pi_user.id,
            site_id=site_jaipur.id,
            target_sample_size=80,
            enrolled_count=15,
            status="ENROLLING",
            start_date=today - timedelta(days=30),
            expected_completion_date=today + timedelta(days=330),
            ethics_approval_date=today - timedelta(days=60),
            ethics_renewal_date=today + timedelta(days=305),
            protocol_version="1.0"
        )

        db.add_all([trial_1, trial_2, trial_3])
        db.commit()
        db.refresh(trial_1)
        db.refresh(trial_2)
        db.refresh(trial_3)
        print("Created 3 clinical trials.")

        # 4. Pseudonymous Participants (AYU-XXXX)
        participants = []
        p_codes = [
            ("AYU-1001", trial_1.id, site_delhi.id, "25-34", "F", "ENROLLED"),
            ("AYU-1002", trial_1.id, site_delhi.id, "35-44", "M", "ENROLLED"),
            ("AYU-1003", trial_1.id, site_delhi.id, "45-54", "F", "ENROLLED"),
            ("AYU-1004", trial_1.id, site_delhi.id, "25-34", "M", "ENROLLED"),
            ("AYU-1005", trial_1.id, site_delhi.id, "35-44", "F", "COMPLETED"),
            ("AYU-1006", trial_1.id, site_delhi.id, "55-64", "M", "SCREENING"),
            ("AYU-2001", trial_2.id, site_jamnagar.id, "45-54", "F", "ENROLLED"),
            ("AYU-2002", trial_2.id, site_jamnagar.id, "55-64", "M", "ENROLLED"),
            ("AYU-2003", trial_2.id, site_jamnagar.id, "65-74", "F", "ENROLLED"),
            ("AYU-3001", trial_3.id, site_jaipur.id, "35-44", "M", "ENROLLED")
        ]
        for code, t_id, s_id, age, sex, p_stat in p_codes:
            p = Participant(
                participant_code=code,
                trial_id=t_id,
                site_id=s_id,
                age_group=age,
                sex=sex,
                status=p_stat,
                enrollment_date=today - timedelta(days=45),
                last_visit=today - timedelta(days=7),
                next_visit=today + timedelta(days=21)
            )
            participants.append(p)
            db.add(p)
        db.commit()
        for p in participants:
            db.refresh(p)
        print("Enrolled 10 pseudonymous participants.")

        # 5. Adverse Events (Including Serious Adverse Event with active 24h statutory countdown)
        sae_deadline_demo = now_utc + timedelta(hours=18.5)

        ae_1 = AdverseEvent(
            trial_id=trial_1.id,
            participant_id=participants[1].id,  # AYU-1002
            reported_by_id=pi_user.id,
            event_term="Acute Gastric Pain & Burning Eructation",
            ayurvedic_term="Amlapitta / Vidagdha Jeerna",
            meddra_term="Dyspepsia / Gastroesophageal reflux disease",
            meddra_code="10013946",
            onset_date=now_utc - timedelta(hours=5.5),
            severity="SEVERE",
            is_serious=True,
            sae_criteria=["HOSPITALIZATION", "MEDICALLY_SIGNIFICANT"],
            causality="POSSIBLE",
            outcome="RECOVERING",
            sae_reported_at=now_utc - timedelta(hours=5.5),
            sae_deadline=sae_deadline_demo,
            sae_status="PENDING_24H",
            action_taken="Dosing suspended; antacid administered; subject admitted for observation",
            description="Subject developed acute epigastric burning 45 minutes following trial medication intake. Hospitalized for 24h statutory observation.",
            ai_suggested_meddra="Dyspepsia / Gastroesophageal reflux disease (Code: 10013946)",
            ai_suggested_ayurvedic="Amlapitta (Annavaha Srotas)",
            ai_confidence_score=0.94,
            status="UNDER_REVIEW"
        )

        ae_2 = AdverseEvent(
            trial_id=trial_1.id,
            participant_id=participants[0].id,  # AYU-1001
            reported_by_id=pi_user.id,
            event_term="Mild Frontal Headache",
            ayurvedic_term="Shiroshoola",
            meddra_term="Headache",
            meddra_code="10019211",
            onset_date=now_utc - timedelta(days=12),
            resolution_date=now_utc - timedelta(days=11),
            severity="MILD",
            is_serious=False,
            causality="UNLIKELY",
            outcome="RECOVERED",
            sae_status="NOT_APPLICABLE",
            action_taken="Dose maintained; symptomatic rest",
            description="Mild transient tension headache, resolved spontaneously after 6 hours.",
            ai_suggested_meddra="Headache (Code: 10019211)",
            ai_suggested_ayurvedic="Shiroshoola (Shiroroga)",
            ai_confidence_score=0.96,
            status="RESOLVED"
        )

        ae_3 = AdverseEvent(
            trial_id=trial_2.id,
            participant_id=participants[6].id,  # AYU-2001
            reported_by_id=pi_user.id,
            event_term="Mild Pruritic Skin Erythema",
            ayurvedic_term="Kandu / Sheetapitta",
            meddra_term="Pruritus / Rash erythematous",
            meddra_code="10037087",
            onset_date=now_utc - timedelta(days=5),
            resolution_date=now_utc - timedelta(days=3),
            severity="MODERATE",
            is_serious=False,
            causality="PROBABLE",
            outcome="RECOVERED",
            sae_status="NOT_APPLICABLE",
            action_taken="Formulation temporarily reduced to once daily",
            description="Maculopapular itchy patch on bilateral forearms. Resolved post dosage reduction.",
            ai_suggested_meddra="Pruritus / Rash erythematous (Code: 10037087)",
            ai_suggested_ayurvedic="Sheetapitta (Twak Vikara)",
            ai_confidence_score=0.92,
            status="RESOLVED"
        )

        db.add_all([ae_1, ae_2, ae_3])
        db.commit()
        db.refresh(ae_1)
        db.refresh(ae_2)
        db.refresh(ae_3)
        print("Logged adverse events and active SAE countdown.")

        # 6. Ethics Reviews
        review_1 = EthicsReview(
            trial_id=trial_1.id,
            reviewer_id=ethics_user.id,
            committee_name="AIIA Institutional Ethics Committee (Reg. ECR/124/Inst/DL/2023)",
            review_type="INITIAL",
            status="APPROVED",
            submission_date=today - timedelta(days=140),
            decision_date=today - timedelta(days=120),
            expiry_date=today + timedelta(days=245),
            protocol_version_reviewed="2.0",
            comments="Ethics committee reviewed protocol and informed consent sheets in Hindi and English. Approved unanimously with annual safety audit condition."
        )

        review_2 = EthicsReview(
            trial_id=trial_1.id,
            reviewer_id=ethics_user.id,
            committee_name="AIIA Institutional Ethics Committee",
            review_type="SAE_REVIEW",
            status="UNDER_REVIEW",
            submission_date=today,
            protocol_version_reviewed="2.1",
            comments="Expedited review of SAE report for subject AYU-1002. Evaluating causality and DSMB recommendations."
        )

        review_3 = EthicsReview(
            trial_id=trial_2.id,
            reviewer_id=ethics_user.id,
            committee_name="ITRA Ethics Review Board, Jamnagar",
            review_type="INITIAL",
            status="APPROVED",
            submission_date=today - timedelta(days=200),
            decision_date=today - timedelta(days=180),
            expiry_date=today + timedelta(days=185),
            protocol_version_reviewed="3.0",
            comments="Protocol approved for 250 subjects. Interim analysis requested after 100 participants reach Week 12."
        )

        db.add_all([review_1, review_2, review_3])
        db.commit()
        print("Registered ethics committee clearance dossiers.")

        # 7. Document Vault (with Tamper-evident SHA-256 Checksums)
        doc_content_1 = b"AYUR-2026-001 Clinical Protocol v2.1 AIIA Approved"
        doc_hash_1 = hashlib.sha256(doc_content_1).hexdigest()

        doc_content_2 = b"Informed Consent Form Bilingual Hindi English AYUR-2026-001"
        doc_hash_2 = hashlib.sha256(doc_content_2).hexdigest()

        doc_1 = Document(
            trial_id=trial_1.id,
            uploaded_by_id=pi_user.id,
            title="Clinical Study Protocol — Ashwagandha Anxiety Trial",
            doc_type="PROTOCOL",
            file_name="AYUR_001_Protocol_v2.1.pdf",
            file_path="/vault/protocols/AYUR_001_Protocol_v2.1.pdf",
            file_size=2458900,
            mime_type="application/pdf",
            version="2.1",
            checksum_sha256=doc_hash_1,
            is_vaulted=True
        )

        doc_2 = Document(
            trial_id=trial_1.id,
            uploaded_by_id=pi_user.id,
            title="Participant Informed Consent Form (ICF) — Bilingual",
            doc_type="INFORMED_CONSENT",
            file_name="AYUR_001_ICF_Bilingual_v2.0.pdf",
            file_path="/vault/icf/AYUR_001_ICF_Bilingual_v2.0.pdf",
            file_size=824500,
            mime_type="application/pdf",
            version="2.0",
            checksum_sha256=doc_hash_2,
            is_vaulted=True
        )

        doc_3 = Document(
            trial_id=trial_1.id,
            uploaded_by_id=pv_user.id,
            title="Statutory SAE Expedited Notification Form (AYU-1002)",
            doc_type="SAE_REPORT",
            file_name="SAE_AYU_1002_Expedited_24h.pdf",
            file_path="/vault/safety/SAE_AYU_1002_Expedited_24h.pdf",
            file_size=412000,
            mime_type="application/pdf",
            version="1.0",
            checksum_sha256=hashlib.sha256(b"SAE Report AYU-1002 24h statutory deposit").hexdigest(),
            is_vaulted=True
        )

        db.add_all([doc_1, doc_2, doc_3])
        db.commit()
        print("Deposited tamper-evident documents in regulatory vault.")

        # 8. 21 CFR Part 11 Audit Trail Entries
        audit_1 = AuditLog(
            user_id=pi_user.id,
            user_email=pi_user.email,
            user_role=pi_user.role,
            action="CREATE",
            entity_type="TRIAL",
            entity_id=str(trial_1.id),
            new_values={"study_id": trial_1.study_id, "protocol_version": "2.1"},
            reason_for_change="Protocol submission to CDSCO and CTRI",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            timestamp=now_utc - timedelta(days=90)
        )

        audit_2 = AuditLog(
            user_id=ethics_user.id,
            user_email=ethics_user.email,
            user_role=ethics_user.role,
            action="APPROVE",
            entity_type="ETHICS_REVIEW",
            entity_id=str(review_1.id),
            new_values={"status": "APPROVED", "decision_date": str(review_1.decision_date)},
            reason_for_change="Institutional Ethics clearance ratified in meeting #42",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            timestamp=now_utc - timedelta(days=120)
        )

        audit_3 = AuditLog(
            user_id=pi_user.id,
            user_email=pi_user.email,
            user_role=pi_user.role,
            action="CREATE",
            entity_type="ADVERSE_EVENT",
            entity_id=str(ae_1.id),
            new_values={"event_term": ae_1.event_term, "is_serious": True, "sae_status": "PENDING_24H"},
            reason_for_change="Urgent statutory SAE report recording",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            timestamp=now_utc - timedelta(hours=5.5)
        )

        db.add_all([audit_1, audit_2, audit_3])
        db.commit()
        print("Generated 21 CFR Part 11 immutable audit trail records.")

        # 9. Initial Notifications
        notif_1 = Notification(
            user_id=ethics_user.id,
            title="CRITICAL: Statutory SAE Alert [AYUR-2026-001]",
            message="Serious Adverse Event recorded for AYU-1002 (Acute Gastric Pain). 24h statutory regulatory clock is active.",
            notification_type="SAE_ALERT",
            severity="CRITICAL",
            link=f"/trials/{trial_1.id}/adverse-events",
            is_read=False
        )

        notif_2 = Notification(
            user_id=pv_user.id,
            title="CRITICAL: Statutory SAE Alert [AYUR-2026-001]",
            message="Expedited safety assessment required for AYU-1002. Causality and ICSR export required.",
            notification_type="SAE_ALERT",
            severity="CRITICAL",
            link=f"/trials/{trial_1.id}/adverse-events",
            is_read=False
        )

        db.add_all([notif_1, notif_2])
        db.commit()
        print("Dispatched statutory notifications.")

        print("=== AyurCTMS Database Seeding Complete! ===")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
