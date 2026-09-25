"""Seed Data Quality Discrepancies and Participant Visits cleanly."""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta, date

root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.user import User
from app.models.data_quality import DataQualityQuery
from app.models.participant_visit import ParticipantVisit

DB_URL = "postgresql+pg8000://postgres.ahgknehwelzknrsbkzbm:Meet%40163616%24@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

engine = create_engine(DB_URL, pool_recycle=60)
Session = sessionmaker(bind=engine)
db = Session()

now = datetime.now(timezone.utc)
today = date.today()

try:
    lead_trial_id = db.query(Trial.id).filter(Trial.status == "ACTIVE").first()[0]
    participants_raw = db.query(Participant.id, Participant.participant_code, Participant.trial_id).limit(20).all()
    part_ids = [p[0] for p in participants_raw]
    part_codes = [p[1] for p in participants_raw]
    pi_user_id = db.query(User.id).filter(User.role == "PI").first()[0]

    # 1. Seed Data Quality Queries (42 queries, matching SIH brief)
    if db.query(DataQualityQuery).count() == 0:
        print("Seeding 42 Data Quality Queries...")
        queries = []
        query_templates = [
            ("baseline_dosha_score", "MISSING", "CRITICAL", "Vata/Pitta/Kapha baseline score omitted on screening eCRF page 3", "OPEN"),
            ("systolic_blood_pressure", "OUT_OF_RANGE", "CRITICAL", "Recorded value 240 mmHg requires immediate verification or SAE check", "OPEN"),
            ("liver_function_alt", "OUT_OF_RANGE", "CRITICAL", "ALT 180 U/L exceeds 3x upper limit of normal; protocol safety action required", "OPEN"),
            ("informed_consent_date", "LOGICAL_ERROR", "CRITICAL", "Informed consent date is subsequent to first trial medication dispense", "OPEN"),
            ("concomitant_medication", "INCONSISTENT", "MEDIUM", "Allopathic antihypertensive listed in medical history but not in concomitant log", "OPEN"),
            ("fasting_blood_glucose", "OUT_OF_RANGE", "MEDIUM", "Value 45 mg/dL is hypoglycemic range; confirm fasting state", "ANSWERED"),
            ("study_drug_accountability", "INCONSISTENT", "MEDIUM", "Pill count indicates 28 doses taken, but visit date interval is 32 days", "OPEN"),
            ("adverse_event_onset_time", "MISSING", "MEDIUM", "Onset timestamp missing for reported headache episode", "ANSWERED"),
            ("ayurvedic_prakriti_vitiation", "MISSING", "LOW", "Sub-dosha assessment checkmark left blank", "RESOLVED"),
            ("weight_measurement_unit", "INCONSISTENT", "LOW", "Recorded as lbs instead of kg protocol requirement", "RESOLVED"),
        ]

        for q_idx in range(1, 43):
            tmpl = query_templates[(q_idx - 1) % len(query_templates)]
            p_id = part_ids[q_idx % len(part_ids)]
            p_code = part_codes[q_idx % len(part_codes)]
            sev = "CRITICAL" if q_idx <= 5 else tmpl[2]
            stat = "OPEN" if q_idx <= 12 else ("ANSWERED" if q_idx <= 24 else "RESOLVED")

            dq = DataQualityQuery(
                query_code=f"QRY-{1000 + q_idx}",
                trial_id=lead_trial_id,
                participant_id=p_id,
                raised_by_id=pi_user_id,
                field_name=tmpl[0],
                issue_type=tmpl[1],
                severity=sev,
                query_text=f"Subject {p_code}: {tmpl[3]}",
                resolution_text="Corrected and verified against source hospital record" if stat == "RESOLVED" else None,
                status=stat,
                resolved_at=now - timedelta(days=2) if stat == "RESOLVED" else None
            )
            queries.append(dq)

        db.add_all(queries)
        db.commit()
        print(f"Seeded {len(queries)} Data Quality Queries successfully.")

    # 2. Seed Scheduled Participant Visits (Timeline for first 10 participants)
    if db.query(ParticipantVisit).count() == 0:
        print("Seeding Participant Visit Schedule Timelines...")
        visits = []
        visit_schedule = [
            (0, "Day 0 - Screening & Consent", 0, 0, "COMPLETED"),
            (1, "Day 7 - Baseline & Randomization", 7, 2, "COMPLETED"),
            (2, "Day 30 - Treatment Visit 1", 30, 3, "COMPLETED"),
            (3, "Day 60 - Mid-Treatment Assessment", 60, 3, "SCHEDULED"),
            (4, "Day 90 - Study Close-out & Efficacy", 90, 5, "SCHEDULED"),
        ]

        for p_id, p_code, t_id in participants_raw[:10]:
            base_date = today - timedelta(days=35)
            for v_num, v_name, s_day, w_days, v_stat in visit_schedule:
                planned = base_date + timedelta(days=s_day)
                actual = planned if v_stat == "COMPLETED" else None

                if p_code.endswith("2") and v_num == 2:
                    v_stat = "MISSED"
                    actual = None

                pv = ParticipantVisit(
                    participant_id=p_id,
                    trial_id=t_id,
                    visit_number=v_num,
                    visit_name=v_name,
                    scheduled_day=s_day,
                    window_days=w_days,
                    planned_date=planned,
                    actual_date=actual,
                    status=v_stat,
                    vitals_recorded=v_stat == "COMPLETED",
                    dosha_assessment_completed=v_stat == "COMPLETED",
                    notes="Completed per protocol specifications." if v_stat == "COMPLETED" else None
                )
                visits.append(pv)

        db.add_all(visits)
        db.commit()
        print(f"Seeded {len(visits)} Participant Visit Timelines successfully.")

    print("=== All missing data seeded in Supabase! ===")

except Exception as e:
    db.rollback()
    print(f"Error during enrichment: {e}")
    raise e
finally:
    db.close()
